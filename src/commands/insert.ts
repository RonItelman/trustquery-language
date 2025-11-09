import {Command, Flags} from '@oclif/core'

import {insertRow} from '../lib/operations/crud.js'

export default class Insert extends Command {
  static description = 'Insert a row into a TQL file facet'
static examples = [
    `<%= config.bin %> <%= command.id %> --file data.tql --facet context --key user-timezone --value MST
✓ Inserted 1 row into @context in data.tql`,
    `<%= config.bin %> <%= command.id %> --file data.tql --facet context --data '{"key":"user-timezone","value":"MST"}'
✓ Inserted 1 row into @context in data.tql`,
  ]
static flags = {
    data: Flags.string({
      char: 'd',
      description: 'Row data as JSON string (without index)',
      exclusive: ['key', 'value'],
      required: false,
    }),
    facet: Flags.string({
      char: 'f',
      description: 'Facet to insert into',
      options: ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score'],
      required: true,
    }),
    file: Flags.string({
      description: 'Path to the TQL file',
      required: true,
    }),
    key: Flags.string({
      char: 'k',
      description: 'Key (for context/tasks/score facets)',
      required: false,
    }),
    value: Flags.string({
      char: 'v',
      description: 'Value (for context facet)',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Insert)

    try {
      let rowData: Record<string, string>

      // Parse row data from either --data flag or --key/--value flags
      if (flags.data) {
        try {
          rowData = JSON.parse(flags.data)
        } catch {
          this.error('Invalid JSON in --data flag')
        }
      } else if (flags.key && flags.value && flags.facet === 'context') {
        // Shorthand for context rows
        rowData = {
          key: flags.key,
          value: flags.value,
        }
      } else if (flags.key && flags.value && flags.facet === 'tasks') {
        // Shorthand for tasks rows (assuming key is name, value is description)
        rowData = {
          description: flags.value,
          formula: '',
          name: flags.key,
        }
      } else {
        this.error('Must provide either --data or (--key and --value for context facet)')
      }

      // Insert the row
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      insertRow(flags.file, flags.facet as any, rowData as any)

      this.log(`✓ Inserted 1 row into @${flags.facet} in ${flags.file}`)
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to insert row: ${error.message}`)
      }

      throw error
    }
  }
}
