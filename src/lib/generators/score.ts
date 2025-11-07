export function generateScoreFacet(): string {
  const headers = ['index', 'measure', 'value']
  const measures = [
    'range-values',
    'number-of-interpretations',
    'Uncertainty Ratio (UR)',
    'Missing Certainty Ratio',
  ]

  // Calculate column widths
  const indexWidth = Math.max('index'.length, measures.length.toString().length)
  const measureWidth = Math.max(...measures.map((m) => m.length), 'measure'.length)
  const valueWidth = 'value'.length

  // Build the table
  const lines: string[] = []

  // Add prefix with row count
  lines.push(`@score[${measures.length}]:`)

  // Add header row
  lines.push(`| ${headers[0].padEnd(indexWidth)} | ${headers[1].padEnd(measureWidth)} | ${headers[2].padEnd(valueWidth)} |`)

  // Add separator row
  lines.push(`|${'-'.repeat(indexWidth + 2)}|${'-'.repeat(measureWidth + 2)}|${'-'.repeat(valueWidth + 2)}|`)

  // Add measure rows (with empty values)
  for (let i = 0; i < measures.length; i++) {
    const measure = measures[i]
    lines.push(`| ${(i + 1).toString().padEnd(indexWidth)} | ${measure.padEnd(measureWidth)} | ${' '.repeat(valueWidth)} |`)
  }

  return lines.join('\n')
}
