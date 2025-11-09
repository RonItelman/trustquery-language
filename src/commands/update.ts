import {Command, Flags} from '@oclif/core'

import {updateRow} from '../lib/operations/crud.js'

export default class Update extends Command {
  static description = 'Update a row in a TQL file facet'
static examples = [
    `<%= config.bin %> <%= command.id %> --file data.tql --facet context --index 1 --data '{"value":"PST"}'
✓ Updated row 1 in @context in data.tql`,
    `<%= config.bin %> <%= command.id %> --file data.tql --facet meaning --index 2 --data '{"definition":"Updated definition"}'
✓ Updated row 2 in @meaning in data.tql`,
  ]
static flags = {
    data: Flags.string({
      char: 'd',
      description: 'Row data as JSON string (fields to update, without index)',
      required: true,
    }),
    facet: Flags.string({
      char: 'f',
      description: 'Facet to update',
      options: ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score'],
      required: true,
    }),
    file: Flags.string({
      description: 'Path to the TQL file',
      required: true,
    }),
    index: Flags.integer({
      char: 'i',
      description: 'Index of row to update (1-based)',
      required: true,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Update)

    try {
      // Parse row data from --data flag
      let rowData: Record<string, string>
      try {
        rowData = JSON.parse(flags.data)
      } catch {
        this.error('Invalid JSON in --data flag')
      }

      // Update the row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      updateRow(flags.file, flags.facet as any, flags.index, rowData as any)

      this.log(`✓ Updated row ${flags.index} in @${flags.facet} in ${flags.file}`)
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to update row: ${error.message}`)
      }

      throw error
    }
  }
}
