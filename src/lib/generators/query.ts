export function generateQueryFacet(): string {
  const headers = ['index', 'user_message', 'timestamp_utc']

  // Calculate column widths
  const colWidths = headers.map((h) => h.length)

  // Build the table
  const lines: string[] = []

  // Add prefix with row count of 0 (no data rows on initialization)
  lines.push('@query[0]:')

  // Add header row
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |'
  lines.push(headerRow)

  // Add separator row
  const separator = '|' + colWidths.map((w) => '-'.repeat(w + 2)).join('|') + '|'
  lines.push(separator)

  // No data rows on initialization

  return lines.join('\n')
}
