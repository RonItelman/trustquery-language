import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import {basename, dirname, extname, join} from 'node:path'

import {generateTql, generateTqlDocument} from '../lib/generators/index.js'
import {generateTqlFromJson} from '../lib/parser/generator.js'
import {parseTqlFromString, writeTqlJson} from '../lib/parser/index.js'
import type {TqlConversation, TqlDocument} from '../lib/parser/types.js'
import {readCsv} from '../lib/readers/csv.js'
import {insertRowInMemory} from '../lib/operations/crud.js'

export default class Create extends Command {
  static description = 'Create a TQL conversation from a data source'
static examples = [
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv --out data.tql
✓ Created data.tql (TqlConversation with 1 document)`,
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv --query "Show transactions" --out data.tql --json
✓ Created data.tql with query, prints JSON to terminal`,
    `<%= config.bin %> <%= command.id %> --source csv --in data.csv --format json --out data.json
✓ Created data.json (TqlConversation as JSON)`,
    `cat data.csv | <%= config.bin %> <%= command.id %> --source csv --in - --query "Analyze data"
[reads from stdin, creates conversation]`,
  ]
static flags = {
    facets: Flags.string({
      description: 'Comma-separated list of facets to generate (table,meaning,structure,ambiguity,intent,context,query,tasks,score)',
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
    json: Flags.boolean({
      description: 'Print conversation JSON to terminal',
      required: false,
    }),
    out: Flags.string({
      description: 'Output file path (use "-" for stdout, defaults to input path with .tql or .json extension)',
      required: false,
    }),
    query: Flags.string({
      description: 'User query message to add to @query facet',
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
      await (flags.in === '-'
        ? this.createFromCsvStdin(flags.out, flags.facets, flags.format as 'json' | 'tql' | undefined, flags.query, flags.json)
        : this.createFromCsv(flags.in, flags.out, flags.facets, flags.format as 'json' | 'tql' | undefined, flags.query, flags.json)
      );
    }
  }

  private async createFromCsv(
    inputPath: string,
    outputPath?: string,
    facetsFlag?: string,
    format?: 'json' | 'tql',
    query?: string,
    printJson?: boolean,
  ): Promise<void> {
    try {
      // Read the CSV file
      const csvData = readCsv(inputPath)

      // Generate TqlDocument from CSV
      const doc = generateTqlDocument({
        source: {
          format: 'csv',
          data: {
            headers: csvData.headers,
            rows: csvData.rows,
          },
        },
        facet: {
          name: '@table',
        },
      })

      // Add query to @query facet if provided
      if (query) {
        insertRowInMemory(doc, 'query', {
          user_message: query,
          timestamp_utc: new Date().toISOString(),
        })
      }

      // Wrap in TqlConversation (always)
      const conversation: TqlConversation = {
        documents: [doc],
      }

      // Determine format (default to tql)
      const outputFormat = format || 'tql'

      // Check if output is stdout
      if (outputPath === '-') {
        // Output to stdout (in-memory testing)
        if (outputFormat === 'json') {
          this.log(JSON.stringify(conversation, null, 2))
        } else {
          // Generate TQL markdown from first document
          const tqlContent = generateTqlFromJson(doc)
          this.log(tqlContent)
        }
      } else {
        // Write to file
        const output = outputPath || this.getDefaultOutputPath(inputPath, outputFormat)

        if (outputFormat === 'json') {
          // Write conversation as JSON
          fs.writeFileSync(output, JSON.stringify(conversation, null, 2), 'utf8')
        } else {
          // Write conversation as TQL markdown
          // For now, just write the first document
          // TODO: Support multiple documents in .tql format
          const tqlContent = generateTqlFromJson(doc)
          fs.writeFileSync(output, tqlContent, 'utf8')
        }

        this.log(`✓ Created ${output}`)
        this.log(`  Format: ${outputFormat.toUpperCase()}`)
        this.log(`  Documents: ${conversation.documents.length}`)
        this.log(`  Data rows: ${csvData.rows.length}`)
        this.log(`  Columns: ${csvData.headers.length}`)
        if (query) {
          this.log(`  Query: "${query}"`)
        }

        // Print JSON to terminal if --json flag is set
        if (printJson) {
          this.log('\n' + JSON.stringify(conversation, null, 2))
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to create file: ${error.message}`)
      }

      throw error
    }
  }

  private async createFromCsvStdin(
    outputPath?: string,
    facetsFlag?: string,
    format?: 'json' | 'tql',
    query?: string,
    printJson?: boolean,
  ): Promise<void> {
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

      // Generate TqlDocument from CSV
      const doc = generateTqlDocument({
        source: {
          format: 'csv',
          data: {
            headers,
            rows,
          },
        },
        facet: {
          name: '@table',
        },
      })

      // Add query to @query facet if provided
      if (query) {
        insertRowInMemory(doc, 'query', {
          user_message: query,
          timestamp_utc: new Date().toISOString(),
        })
      }

      // Wrap in TqlConversation (always)
      const conversation: TqlConversation = {
        documents: [doc],
      }

      // Determine format (default to tql)
      const outputFormat = format || 'tql'

      // Check if output is stdout
      if (!outputPath || outputPath === '-') {
        // Output to stdout (in-memory testing)
        if (outputFormat === 'json') {
          this.log(JSON.stringify(conversation, null, 2))
        } else {
          const tqlContent = generateTqlFromJson(doc)
          this.log(tqlContent)
        }
      } else {
        // Write to file
        if (outputFormat === 'json') {
          fs.writeFileSync(outputPath, JSON.stringify(conversation, null, 2), 'utf8')
        } else {
          const tqlContent = generateTqlFromJson(doc)
          fs.writeFileSync(outputPath, tqlContent, 'utf8')
        }

        this.log(`✓ Created ${outputPath}`)
        this.log(`  Format: ${outputFormat.toUpperCase()}`)
        this.log(`  Documents: ${conversation.documents.length}`)
        this.log(`  Data rows: ${rows.length}`)
        this.log(`  Columns: ${headers.length}`)
        if (query) {
          this.log(`  Query: "${query}"`)
        }

        // Print JSON to terminal if --json flag is set
        if (printJson) {
          this.log('\n' + JSON.stringify(conversation, null, 2))
        }
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
