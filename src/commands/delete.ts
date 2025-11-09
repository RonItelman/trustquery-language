import {Command, Flags} from '@oclif/core'

import {deleteRow, deleteRows} from '../lib/operations/crud.js'

export default class Delete extends Command {
  static description = 'Delete row(s) from a TQL file facet'
static examples = [
    `<%= config.bin %> <%= command.id %> --file data.tql --facet context --index 1
✓ Deleted 1 row from @context in data.tql`,
    `<%= config.bin %> <%= command.id %> --file data.tql --facet context --indices 1,2,3
✓ Deleted 3 rows from @context in data.tql`,
  ]
static flags = {
    facet: Flags.string({
      char: 'f',
      description: 'Facet to delete from',
      options: ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score'],
      required: true,
    }),
    file: Flags.string({
      description: 'Path to the TQL file',
      required: true,
    }),
    index: Flags.integer({
      char: 'i',
      description: 'Index of row to delete (1-based)',
      exclusive: ['indices'],
      required: false,
    }),
    indices: Flags.string({
      description: 'Comma-separated list of indices to delete (e.g., "1,2,3")',
      exclusive: ['index'],
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Delete)

    try {
      if (flags.index !== undefined) {
        // Delete single row
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deleteRow(flags.file, flags.facet as any, flags.index)
        this.log(`✓ Deleted 1 row from @${flags.facet} in ${flags.file}`)
      } else if (flags.indices) {
        // Delete multiple rows
        const indices = flags.indices.split(',').map((idx) => Number.parseInt(idx.trim(), 10))

        if (indices.some((idx) => Number.isNaN(idx))) {
          this.error('Invalid indices format. Use comma-separated numbers (e.g., "1,2,3")')
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        deleteRows(flags.file, flags.facet as any, indices)
        this.log(`✓ Deleted ${indices.length} rows from @${flags.facet} in ${flags.file}`)
      } else {
        this.error('Must provide either --index or --indices')
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to delete row(s): ${error.message}`)
      }

      throw error
    }
  }
}
