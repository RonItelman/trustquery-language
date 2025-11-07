export interface DataFacetInput {
  headers: string[]
  rows: string[][]
}

export function generateDataFacet(input: DataFacetInput): string {
  const {headers, rows} = input
  const numDataRows = rows.length

  // Add index column
  const allHeaders = ['index', ...headers]

  // Calculate column widths
  const indexWidth = Math.max('index'.length, numDataRows.toString().length)
  const colWidths = [indexWidth, ...headers.map((header, colIndex) => {
    const maxDataWidth = Math.max(...rows.map((row) => (row[colIndex] || '').length))
    return Math.max(header.length, maxDataWidth)
  })]

  // Build the table
  const lines: string[] = []

  // Add prefix
  lines.push(`@data[${numDataRows}]:`)

  // Add header row
  const headerRow = '| ' + allHeaders.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |'
  lines.push(headerRow)

  // Add separator row
  const separator = '|' + colWidths.map((w) => '-'.repeat(w + 2)).join('|') + '|'
  lines.push(separator)

  // Add data rows
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    const indexCell = (i + 1).toString().padEnd(indexWidth)
    const dataCells = row.map((cell, j) => (cell || '').padEnd(colWidths[j + 1])).join(' | ')
    const dataRow = '| ' + indexCell + ' | ' + dataCells + ' |'
    lines.push(dataRow)
  }

  return lines.join('\n')
}
