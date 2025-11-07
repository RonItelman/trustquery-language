export interface MeaningFacetInput {
  headers: string[]
}

export function generateMeaningFacet(input: MeaningFacetInput): string {
  const {headers} = input

  // Define column widths for the meaning table
  const indexWidth = Math.max('index'.length, headers.length.toString().length)
  const columnWidth = Math.max(...headers.map((h) => h.length), 'column'.length)
  const definitionWidth = 'definition'.length
  const userConfirmedWidth = 'user_confirmed'.length

  // Build the table
  const lines: string[] = []

  // Add prefix with row count (number of columns)
  lines.push(`@meaning[${headers.length}]:`)

  // Add header row
  const headerRow =
    '| ' +
    'index'.padEnd(indexWidth) +
    ' | ' +
    'column'.padEnd(columnWidth) +
    ' | ' +
    'definition'.padEnd(definitionWidth) +
    ' | ' +
    'user_confirmed'.padEnd(userConfirmedWidth) +
    ' |'
  lines.push(headerRow)

  // Add separator row
  const separator =
    '|' +
    '-'.repeat(indexWidth + 2) +
    '|' +
    '-'.repeat(columnWidth + 2) +
    '|' +
    '-'.repeat(definitionWidth + 2) +
    '|' +
    '-'.repeat(userConfirmedWidth + 2) +
    '|'
  lines.push(separator)

  // Add data rows (one per column, with blank definition and user_confirmed)
  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    const dataRow =
      '| ' +
      (i + 1).toString().padEnd(indexWidth) +
      ' | ' +
      header.padEnd(columnWidth) +
      ' | ' +
      ''.padEnd(definitionWidth) +
      ' | ' +
      ''.padEnd(userConfirmedWidth) +
      ' |'
    lines.push(dataRow)
  }

  return lines.join('\n')
}
