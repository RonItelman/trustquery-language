export interface StructureFacetInput {
  headers: string[]
}

interface ColumnStructure {
  column: string
  nullAllowed: string
  dataType: string
  minValue: string
  maxValue: string
  format: string
  userConfirmed: string
}

export function generateStructureFacet(input: StructureFacetInput): string {
  const {headers} = input

  // Create structure template for each column (all fields blank except column name)
  const structures: ColumnStructure[] = headers.map((header) => ({
    column: header,
    nullAllowed: '',
    dataType: '',
    minValue: '',
    maxValue: '',
    format: '',
    userConfirmed: '',
  }))

  // Calculate column widths
  const colWidths = {
    index: Math.max('index'.length, headers.length.toString().length),
    column: Math.max(...structures.map((s) => s.column.length), 'column'.length),
    nullAllowed: 'nullAllowed'.length,
    dataType: 'dataType'.length,
    minValue: 'minValue'.length,
    maxValue: 'maxValue'.length,
    format: 'format'.length,
    userConfirmed: 'user_confirmed'.length,
  }

  // Build the table
  const lines: string[] = []

  // Add prefix with row count
  lines.push(`@structure[${headers.length}]:`)

  // Add header row
  const headerRow =
    '| ' +
    'index'.padEnd(colWidths.index) +
    ' | ' +
    'column'.padEnd(colWidths.column) +
    ' | ' +
    'nullAllowed'.padEnd(colWidths.nullAllowed) +
    ' | ' +
    'dataType'.padEnd(colWidths.dataType) +
    ' | ' +
    'minValue'.padEnd(colWidths.minValue) +
    ' | ' +
    'maxValue'.padEnd(colWidths.maxValue) +
    ' | ' +
    'format'.padEnd(colWidths.format) +
    ' | ' +
    'user_confirmed'.padEnd(colWidths.userConfirmed) +
    ' |'
  lines.push(headerRow)

  // Add separator row
  const separator =
    '|' +
    '-'.repeat(colWidths.index + 2) +
    '|' +
    '-'.repeat(colWidths.column + 2) +
    '|' +
    '-'.repeat(colWidths.nullAllowed + 2) +
    '|' +
    '-'.repeat(colWidths.dataType + 2) +
    '|' +
    '-'.repeat(colWidths.minValue + 2) +
    '|' +
    '-'.repeat(colWidths.maxValue + 2) +
    '|' +
    '-'.repeat(colWidths.format + 2) +
    '|' +
    '-'.repeat(colWidths.userConfirmed + 2) +
    '|'
  lines.push(separator)

  // Add data rows (all fields blank except column name)
  for (let i = 0; i < structures.length; i++) {
    const structure = structures[i]
    const dataRow =
      '| ' +
      (i + 1).toString().padEnd(colWidths.index) +
      ' | ' +
      structure.column.padEnd(colWidths.column) +
      ' | ' +
      structure.nullAllowed.padEnd(colWidths.nullAllowed) +
      ' | ' +
      structure.dataType.padEnd(colWidths.dataType) +
      ' | ' +
      structure.minValue.padEnd(colWidths.minValue) +
      ' | ' +
      structure.maxValue.padEnd(colWidths.maxValue) +
      ' | ' +
      structure.format.padEnd(colWidths.format) +
      ' | ' +
      structure.userConfirmed.padEnd(colWidths.userConfirmed) +
      ' |'
    lines.push(dataRow)
  }

  return lines.join('\n')
}
