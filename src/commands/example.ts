import {Command, Flags} from '@oclif/core'
import * as fs from 'node:fs'
import * as path from 'node:path'

import Create from './create.js'

export default class Example extends Command {
  static description = 'Run example commands to demonstrate TQL CLI functionality'
  static examples = [
    `<%= config.bin %> <%= command.id %>
Runs the default stablecoin example`,
    `<%= config.bin %> <%= command.id %> --clean
Runs example and cleans up generated files`,
  ]

  static flags = {
    clean: Flags.boolean({
      description: 'Clean up generated files after running example',
      required: false,
    }),
  }

  async run(): Promise<void> {
    const {flags} = await this.parse(Example)

    this.log('🚀 TQL CLI Example\n')
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    this.log('Example: International Stablecoin Transfers')
    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Check if example file exists
    const exampleCsv = path.join(process.cwd(), 'examples', 'stablecoin.csv')
    if (!fs.existsSync(exampleCsv)) {
      this.error('Example file not found: examples/stablecoin.csv')
    }

    this.log('Dataset: examples/stablecoin.csv')
    this.log('  • 25 international stablecoin transfers')
    this.log('  • USDC and USDT transactions')
    this.log('  • Multi-wallet cross-border payments\n')

    this.log('Query: "How much was transferred yesterday?"\n')

    this.log('Running command:')
    this.log('  tql create --source csv --in examples/stablecoin.csv \\')
    this.log('    --query "How much was transferred yesterday?" \\')
    this.log('    --out examples/stablecoin-output.tql \\')
    this.log('    --json\n')

    this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

    // Run the create command programmatically
    const outputFile = path.join(process.cwd(), 'examples', 'stablecoin-output.tql')

    try {
      // Create an instance of the Create command
      await Create.run([
        '--source',
        'csv',
        '--in',
        exampleCsv,
        '--query',
        'How much was transferred yesterday?',
        '--out',
        outputFile,
        '--json',
      ])

      this.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      this.log('✅ Example completed successfully!')
      this.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

      this.log('Generated files:')
      this.log(`  📄 ${outputFile}`)
      this.log('\nTo view the TQL file:')
      this.log(`  cat ${outputFile}\n`)

      this.log('What was created:')
      this.log('  • TqlConversation with 1 document')
      this.log('  • @table facet: 25 transaction rows')
      this.log('  • @query facet: User query with timestamp')
      this.log('  • @meaning, @structure: Empty templates ready for LLM')
      this.log('  • @ambiguity, @intent: Empty (no ambiguity detected yet)\n')

      this.log('Next steps to try:')
      this.log('  1. View the file: cat examples/stablecoin-output.tql')
      this.log('  2. Add meanings: tql insert --file examples/stablecoin-output.tql --facet meaning ...')
      this.log('  3. Compare changes: tql diff (coming soon)')
      this.log('  4. Export as JSON: tql create --format json\n')

      // Clean up only if --clean flag is set
      if (flags.clean) {
        this.log('🧹 Cleaning up generated files...')
        if (fs.existsSync(outputFile)) {
          fs.unlinkSync(outputFile)
          this.log(`  Deleted: ${outputFile}`)
        }

        this.log('')
      } else {
        this.log('💡 Tip: Use "tql example --clean" to remove generated files\n')
      }
    } catch (error) {
      if (error instanceof Error) {
        this.error(`Failed to run example: ${error.message}`)
      }

      throw error
    }
  }
}
