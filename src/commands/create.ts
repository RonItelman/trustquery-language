import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'
import {readCsv} from '../lib/readers/csv.js'
import {generateTql} from '../lib/generators/index.js'

export default class Create extends Command {
  static description = 'Create a TQL file from a data source'

  static examples = [
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv
Creating TQL file from data.csv...
✓ Created data.tql with 9 facets (@data, @meaning, @structure, @ambiguity, @intent, @context, @query, @tasks, @score)`,
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv --out custom.tql
Creating TQL file from data.csv...
✓ Created custom.tql with 9 facets (@data, @meaning, @structure, @ambiguity, @intent, @context, @query, @tasks, @score)`,
  ]

  static flags = {
    facets: Flags.string({
      description: 'Comma-separated list of facets to generate (data,meaning,structure,ambiguity,intent,context,query,tasks,score)',
      required: false,
    }),
    in: Flags.string({
      description: 'Input file path',
      required: true,
    }),
    out: Flags.string({
      description: 'Output file path (defaults to input path with .tql extension)',
      required: false,
    }),
    source: Flags.string({
      description: 'Source data format',
      options: ['csv'],
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Create)

    if (flags.source === 'csv') {
      await this.createFromCsv(flags.in, flags.out, flags.facets)
    }
  }

  private async createFromCsv(inputPath: string, outputPath?: string, facetsFlag?: string): Promise<void> {
    try {
      // Read the CSV file
      const csvData = readCsv(inputPath)

      // Parse facets flag
      const facets = facetsFlag
        ? (facetsFlag.split(',').map((f) => f.trim()) as ('data' | 'meaning' | 'structure' | 'ambiguity' | 'intent' | 'context' | 'query' | 'tasks' | 'score')[])
        : undefined

      // Generate TQL content
      const tqlContent = generateTql(
        {
          headers: csvData.headers,
          rows: csvData.rows,
        },
        {facets},
      )

      // Determine output path
      const output = outputPath || this.getDefaultOutputPath(inputPath)

      // Write to file
      fs.writeFileSync(output, tqlContent, 'utf-8')

      const facetList = facets || ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score']
      const facetNames = facetList.map((f) => `@${f}`).join(', ')

      this.log(`✓ Created ${output}`)
      this.log(`  Facets: ${facetNames}`)
      this.log(`  Data rows: ${csvData.rows.length}`)
      this.log(`  Columns: ${csvData.headers.length}`)
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to create TQL file: ${error.message}`)
      }

      throw error
    }
  }

  private getDefaultOutputPath(inputPath: string): string {
    const dir = path.dirname(inputPath)
    const basename = path.basename(inputPath, path.extname(inputPath))
    return path.join(dir, `${basename}.tql`)
  }
}
