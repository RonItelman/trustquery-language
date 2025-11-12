import * as fs from 'node:fs'

import {formatDiffAsMarkdown} from '../operations/diff.js'
import type {TqlConversation, TqlDocument} from './types.js'
import {getDocumentCount} from './types.js'

/**
 * Generate a .tql file from a TqlConversation JSON structure
 */
export function generateTqlFromConversation(conversation: TqlConversation): string {
  const sections: string[] = []

  // Add conversation header with document count
  const docCount = getDocumentCount(conversation)
  sections.push(`#conversation[${docCount}]:`)
  sections.push('') // Empty line after conversation header

  // Iterate through sequence and output each item
  for (let i = 0; i < conversation.sequence.length; i++) {
    const item = conversation.sequence[i]
    const key = Object.keys(item)[0]
    const value = Object.values(item)[0]

    if (key.startsWith('#document')) {
      // Output document
      sections.push(`${key}:`)
      sections.push(generateTqlFromJson(value as TqlDocument))
    } else if (key.startsWith('$diff')) {
      // Output diff
      sections.push(`${key}:`)
      sections.push(formatDiffAsMarkdown(value as any, false)) // No colors in file
    }

    // Add empty line between items (except after last)
    if (i < conversation.sequence.length - 1) {
      sections.push('')
    }
  }

  return sections.join('\n')
}

/**
 * Generate facets content for a single TqlDocument
 * (Used internally by generateTqlFromConversation)
 */
export function generateTqlFromJson(doc: TqlDocument): string {
  const sections: string[] = []

  // Generate all 9 facets (always, even if empty)
  sections.push(generateTableSection(doc))
  sections.push(generateMeaningSection(doc))
  sections.push(generateStructureSection(doc))
  sections.push(generateAmbiguitySection(doc))
  sections.push(generateIntentSection(doc))
  sections.push(generateContextSection(doc))
  sections.push(generateQuerySection(doc))
  sections.push(generateTasksSection(doc))
  sections.push(generateScoreSection(doc))

  return sections.join('\n\n')
}

/**
 * Write TQL conversation to file
 */
export function writeTql(filePath: string, conversation: TqlConversation): void {
  const content = generateTqlFromConversation(conversation)
  fs.writeFileSync(filePath, content, 'utf8')
}

// Helper function to generate a table section
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateTable(headers: string[], rows: Record<string, any>[], rowCount: number, facetName: string): string {
  const lines: string[] = []

  // Add facet header
  lines.push(`@${facetName}[${rowCount}]:`)

  // Calculate column widths
  const colWidths: number[] = headers.map((header) => {
    const headerWidth = header.length
    const maxDataWidth = rows.length > 0
      ? Math.max(...rows.map((row) => String(row[header] || '').length))
      : 0
    return Math.max(headerWidth, maxDataWidth)
  })

  // Add header row
  const headerRow = '| ' + headers.map((h, i) => h.padEnd(colWidths[i])).join(' | ') + ' |'
  lines.push(headerRow)

  // Add separator row
  const separator = '|' + colWidths.map((w) => '-'.repeat(w + 2)).join('|') + '|'
  lines.push(separator)

  // Add data rows
  for (const row of rows) {
    const dataRow = '| ' + headers.map((h, i) => String(row[h] || '').padEnd(colWidths[i])).join(' | ') + ' |'
    lines.push(dataRow)
  }

  return lines.join('\n')
}

function generateTableSection(doc: TqlDocument): string {
  if (doc.table.rows.length === 0) {
    // Return empty table with index column only
    const headers = ['index']
    return generateTable(headers, [], 0, 'table')
  }

  // Get all column names from the first row
  const firstRow = doc.table.rows[0]
  const headers = Object.keys(firstRow)

  return generateTable(headers, doc.table.rows, doc.table.rows.length, 'table')
}

function generateMeaningSection(doc: TqlDocument): string {
  const headers = ['index', 'column', 'definition']
  return generateTable(headers, doc.meaning.rows, doc.meaning.rows.length, 'meaning')
}

function generateStructureSection(doc: TqlDocument): string {
  const headers = ['index', 'column', 'nullAllowed', 'dataType', 'minValue', 'maxValue', 'format']
  return generateTable(headers, doc.structure.rows, doc.structure.rows.length, 'structure')
}

function generateAmbiguitySection(doc: TqlDocument): string {
  const headers = ['index', 'query_trigger', 'ambiguity_type', 'ambiguity_risk']
  return generateTable(headers, doc.ambiguity.rows, doc.ambiguity.rows.length, 'ambiguity')
}

function generateIntentSection(doc: TqlDocument): string {
  const headers = ['index', 'query_trigger', 'clarifying_question', 'options', 'user_response', 'user_confirmed']
  return generateTable(headers, doc.intent.rows, doc.intent.rows.length, 'intent')
}

function generateContextSection(doc: TqlDocument): string {
  const headers = ['index', 'key', 'value']
  return generateTable(headers, doc.context.rows, doc.context.rows.length, 'context')
}

function generateQuerySection(doc: TqlDocument): string {
  const headers = ['index', 'user_message', 'timestamp_utc']
  return generateTable(headers, doc.query.rows, doc.query.rows.length, 'query')
}

function generateTasksSection(doc: TqlDocument): string {
  const headers = ['index', 'name', 'description', 'formula']
  return generateTable(headers, doc.tasks.rows, doc.tasks.rows.length, 'tasks')
}

function generateScoreSection(doc: TqlDocument): string {
  const headers = ['index', 'measure', 'value']
  return generateTable(headers, doc.score.rows, doc.score.rows.length, 'score')
}
