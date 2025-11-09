import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import {basename, dirname, extname, join} from 'node:path'

import {generateTql} from '../lib/generators/index.js'
import {parseTqlFromString, writeTqlJson} from '../lib/parser/index.js'
import {readCsv} from '../lib/readers/csv.js'

export default class Create extends Command {
  static description = 'Create a TQL file from a data source'
static examples = [
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv
✓ Created data.tql`,
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv --out -
[prints TQL to stdout]`,
    `cat data.csv | <%= config.bin %> <%= command.id %> --source csv --in -
[reads from stdin, prints to stdout]`,
    `pbpaste | <%= config.bin %> <%= command.id %> --source csv --in -
[paste CSV from clipboard, see TQL output]`,
  ]
static flags = {
    facets: Flags.string({
      description: 'Comma-separated list of facets to generate (data,meaning,structure,ambiguity,intent,context,query,tasks,score)',
      required: false,
    }),
    format: Flags.string({
      description: 'Output format',
      options: ['tql', 'json'],
      required: false,
    }),
    in: Flags.string({
      description: 'Input file path (use "-" to read from stdin)',
      required: true,
    }),
    out: Flags.string({
      description: 'Output file path (use "-" for stdout, defaults to input path with .tql or .json extension)',
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
      // Check if reading from stdin
      await (flags.in === '-' ? this.createFromCsvStdin(flags.out, flags.facets, flags.format as 'json' | 'tql' | undefined) : this.createFromCsv(flags.in, flags.out, flags.facets, flags.format as 'json' | 'tql' | undefined));
    }
  }

  private async createFromCsv(inputPath: string, outputPath?: string, facetsFlag?: string, format?: 'json' | 'tql'): Promise<void> {
    try {
      // Read the CSV file
      const csvData = readCsv(inputPath)

      // Parse facets flag
      const facets = facetsFlag
        ? (facetsFlag.split(',').map((f) => f.trim()) as ('ambiguity' | 'context' | 'data' | 'intent' | 'meaning' | 'query' | 'score' | 'structure' | 'tasks')[])
        : undefined

      // Generate TQL content (always generate TQL first)
      const tqlContent = generateTql(
        {
          headers: csvData.headers,
          rows: csvData.rows,
        },
        {facets},
      )

      // Determine format (default to tql)
      const outputFormat = format || 'tql'

      const facetList = facets || ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score']
      const facetNames = facetList.map((f) => `@${f}`).join(', ')

      // Check if output is stdout
      if (outputPath === '-') {
        // Output to stdout (in-memory testing)
        if (outputFormat === 'json') {
          const tqlDoc = parseTqlFromString(tqlContent)
          this.log(JSON.stringify(tqlDoc, null, 2))
        } else {
          this.log(tqlContent)
        }
      } else {
        // Write to file
        const output = outputPath || this.getDefaultOutputPath(inputPath, outputFormat)

        if (outputFormat === 'json') {
          // Parse TQL string to JSON and write
          const tqlDoc = parseTqlFromString(tqlContent)
          writeTqlJson(output, tqlDoc)
        } else {
          // Write TQL directly
          fs.writeFileSync(output, tqlContent, 'utf8')
        }

        this.log(`✓ Created ${output}`)
        this.log(`  Format: ${outputFormat.toUpperCase()}`)
        this.log(`  Facets: ${facetNames}`)
        this.log(`  Data rows: ${csvData.rows.length}`)
        this.log(`  Columns: ${csvData.headers.length}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to create file: ${error.message}`)
      }

      throw error
    }
  }

  private async createFromCsvStdin(outputPath?: string, facetsFlag?: string, format?: 'json' | 'tql'): Promise<void> {
    try {
      // Read from stdin
      let csvContent = ''
      for await (const chunk of process.stdin) {
        csvContent += chunk
      }

      if (!csvContent.trim()) {
        this.error('No CSV content received from stdin')
      }

      // Parse CSV content manually (simple parser for stdin)
      const lines = csvContent.trim().split('\n')
      const headers = lines[0].split(',').map((h) => h.trim())
      const rows = lines.slice(1).map((line) => line.split(',').map((cell) => cell.trim()))

      // Parse facets flag
      const facets = facetsFlag
        ? (facetsFlag.split(',').map((f) => f.trim()) as ('ambiguity' | 'context' | 'data' | 'intent' | 'meaning' | 'query' | 'score' | 'structure' | 'tasks')[])
        : undefined

      // Generate TQL content
      const tqlContent = generateTql(
        {
          headers,
          rows,
        },
        {facets},
      )

      // Determine format (default to tql)
      const outputFormat = format || 'tql'

      const facetList = facets || ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score']
      const facetNames = facetList.map((f) => `@${f}`).join(', ')

      // Check if output is stdout
      if (!outputPath || outputPath === '-') {
        // Output to stdout (in-memory testing)
        if (outputFormat === 'json') {
          const tqlDoc = parseTqlFromString(tqlContent)
          this.log(JSON.stringify(tqlDoc, null, 2))
        } else {
          this.log(tqlContent)
        }
      } else {
        // Write to file
        if (outputFormat === 'json') {
          // Parse TQL string to JSON and write
          const tqlDoc = parseTqlFromString(tqlContent)
          writeTqlJson(outputPath, tqlDoc)
        } else {
          // Write TQL directly
          fs.writeFileSync(outputPath, tqlContent, 'utf8')
        }

        this.log(`✓ Created ${outputPath}`)
        this.log(`  Format: ${outputFormat.toUpperCase()}`)
        this.log(`  Facets: ${facetNames}`)
        this.log(`  Data rows: ${rows.length}`)
        this.log(`  Columns: ${headers.length}`)
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to create from stdin: ${error.message}`)
      }

      throw error
    }
  }

  private getDefaultOutputPath(inputPath: string, format: 'json' | 'tql'): string {
    const dir = dirname(inputPath)
    const base = basename(inputPath, extname(inputPath))
    const ext = format === 'json' ? '.json' : '.tql'
    return join(dir, `${base}${ext}`)
  }
}
