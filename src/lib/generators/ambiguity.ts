export function generateAmbiguityFacet(): string {
  const headers = ['index', 'query_trigger', 'ambiguity_type', 'ambiguity_risk']

  // Calculate column widths based on header names
  const colWidths = headers.map((h) => h.length)

  // Build the table
  const lines: string[] = []

  // Add prefix with row count of 0 (no data rows on initialization)
  lines.push('@ambiguity[0]:')

  // Add header row
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |'
  lines.push(headerRow)

  // Add separator row
  const separator = '|' + colWidths.map((w) => '-'.repeat(w + 2)).join('|') + '|'
  lines.push(separator)

  // No data rows on initialization

  return lines.join('\n')
}
