import type {
  AmbiguityRow,
  ContextRow,
  IntentRow,
  MeaningRow,
  QueryRow,
  ScoreRow,
  StructureRow,
  TableRow,
  TasksRow,
  TqlConversation,
  TqlDocument,
} from '../parser/types.js'
import {getDocuments} from '../parser/types.js'

import {writeTql} from '../parser/generator.js'
import {parseTql} from '../parser/index.js'
import {diffTqlDocuments} from './diff.js'

type FacetName = 'ambiguity' | 'context' | 'intent' | 'meaning' | 'query' | 'score' | 'structure' | 'table' | 'tasks'

type FacetRowType<T extends FacetName> = T extends 'table'
  ? TableRow
  : T extends 'meaning'
    ? MeaningRow
    : T extends 'structure'
      ? StructureRow
      : T extends 'ambiguity'
        ? AmbiguityRow
        : T extends 'intent'
          ? IntentRow
          : T extends 'context'
            ? ContextRow
            : T extends 'query'
              ? QueryRow
              : T extends 'tasks'
                ? TasksRow
                : T extends 'score'
                  ? ScoreRow
                  : never

// ============================================================================
// IN-MEMORY OPERATIONS (First-class)
// ============================================================================

/**
 * Insert a row into a TQL document (in-memory)
 * @param doc - The TQL document object
 * @param facet - The facet to insert into
 * @param data - Row data (without index, will be auto-assigned)
 */
export function insertRowInMemory<T extends FacetName>(
  doc: TqlDocument,
  facet: T,
  data: Omit<FacetRowType<T>, 'index'>,
): void {
  const currentRows = doc[facet].rows
  const nextIndex = currentRows.length + 1

  const rowWithIndex = {
    index: nextIndex,
    ...data,
  } as FacetRowType<T>

  // @ts-expect-error - TypeScript can't infer the row type correctly
  currentRows.push(rowWithIndex)
}

/**
 * Insert multiple rows into a TQL document (in-memory)
 * @param doc - The TQL document object
 * @param facet - The facet to insert into
 * @param dataArray - Array of row data (without index)
 */
export function insertRowsInMemory<T extends FacetName>(
  doc: TqlDocument,
  facet: T,
  dataArray: Array<Omit<FacetRowType<T>, 'index'>>,
): void {
  const currentRows = doc[facet].rows
  let nextIndex = currentRows.length + 1

  for (const data of dataArray) {
    const rowWithIndex = {
      index: nextIndex++,
      ...data,
    } as FacetRowType<T>

    // @ts-expect-error - TypeScript can't infer the row type correctly
    currentRows.push(rowWithIndex)
  }
}

/**
 * Delete a row from a TQL document by index (in-memory)
 * @param doc - The TQL document object
 * @param facet - The facet to delete from
 * @param index - The index of the row to delete (1-based)
 */
export function deleteRowInMemory<T extends FacetName>(
  doc: TqlDocument,
  facet: T,
  index: number,
): void {
  const currentRows = doc[facet].rows as FacetRowType<T>[]

  // Find the row with the matching index
  const rowIndex = currentRows.findIndex((row) => Number(row.index) === index)

  if (rowIndex === -1) {
    throw new Error(`Row with index ${index} not found in @${facet} facet`)
  }

  // Remove the row
  currentRows.splice(rowIndex, 1)

  // Reindex remaining rows
  for (const [i, row] of currentRows.entries()) {
    row.index = i + 1
  }
}

/**
 * Delete multiple rows from a TQL document by indices (in-memory)
 * @param doc - The TQL document object
 * @param facet - The facet to delete from
 * @param indices - Array of indices to delete (1-based)
 */
export function deleteRowsInMemory<T extends FacetName>(
  doc: TqlDocument,
  facet: T,
  indices: number[],
): void {
  const currentRows = doc[facet].rows as FacetRowType<T>[]

  // Sort indices in descending order to avoid index shifting issues
  const sortedIndices = [...indices].sort((a, b) => b - a)

  let deletedCount = 0

  // Delete each row
  for (const index of sortedIndices) {
    const rowIndex = currentRows.findIndex((row) => Number(row.index) === index)

    if (rowIndex !== -1) {
      currentRows.splice(rowIndex, 1)
      deletedCount++
    }
  }

  if (deletedCount === 0) {
    throw new Error(`No rows found with indices ${indices.join(', ')} in @${facet} facet`)
  }

  // Reindex remaining rows
  for (const [i, row] of currentRows.entries()) {
    row.index = i + 1
  }
}

/**
 * Update a row in a TQL document by index (in-memory)
 * @param doc - The TQL document object
 * @param facet - The facet to update
 * @param index - The index of the row to update (1-based)
 * @param data - New data for the row (without index)
 */
export function updateRowInMemory<T extends FacetName>(
  doc: TqlDocument,
  facet: T,
  index: number,
  data: Partial<Omit<FacetRowType<T>, 'index'>>,
): void {
  const currentRows = doc[facet].rows as FacetRowType<T>[]

  // Find the row with the matching index
  const rowIndex = currentRows.findIndex((row) => Number(row.index) === index)

  if (rowIndex === -1) {
    throw new Error(`Row with index ${index} not found in @${facet} facet`)
  }

  // Update the row (merge with existing data, preserve index)
  currentRows[rowIndex] = {
    ...currentRows[rowIndex],
    ...data,
    index, // Preserve the index
  } as FacetRowType<T>
}

// ============================================================================
// FILE-BASED WRAPPERS (Convenience)
// ============================================================================

/**
 * Insert a row into a TQL file facet
 * @param filePath - Path to the .tql file
 * @param facet - The facet to insert into
 * @param data - Row data (without index, will be auto-assigned)
 * @param documentIndex - Index of document in conversation (default: 0)
 */
export function insertRow<T extends FacetName>(
  filePath: string,
  facet: T,
  data: Omit<FacetRowType<T>, 'index'>,
  documentIndex = 0,
): void {
  const conversation = parseTql(filePath)
  const documents = getDocuments(conversation)

  if (!documents[documentIndex]) {
    throw new Error(`Document at index ${documentIndex} not found`)
  }

  insertRowInMemory(documents[documentIndex], facet, data)
  writeTql(filePath, conversation)
}

/**
 * Insert multiple rows into a TQL file facet
 * @param filePath - Path to the .tql file
 * @param facet - The facet to insert into
 * @param dataArray - Array of row data (without index)
 * @param documentIndex - Index of document in conversation (default: 0)
 */
export function insertRows<T extends FacetName>(
  filePath: string,
  facet: T,
  dataArray: Array<Omit<FacetRowType<T>, 'index'>>,
  documentIndex = 0,
): void {
  const conversation = parseTql(filePath)
  const documents = getDocuments(conversation)

  if (!documents[documentIndex]) {
    throw new Error(`Document at index ${documentIndex} not found`)
  }

  insertRowsInMemory(documents[documentIndex], facet, dataArray)
  writeTql(filePath, conversation)
}

/**
 * Delete a row from a TQL file facet by index
 * @param filePath - Path to the .tql file
 * @param facet - The facet to delete from
 * @param index - The index of the row to delete (1-based)
 * @param documentIndex - Index of document in conversation (default: 0)
 */
export function deleteRow<T extends FacetName>(
  filePath: string,
  facet: T,
  index: number,
  documentIndex = 0,
): void {
  const conversation = parseTql(filePath)
  const documents = getDocuments(conversation)

  if (!documents[documentIndex]) {
    throw new Error(`Document at index ${documentIndex} not found`)
  }

  deleteRowInMemory(documents[documentIndex], facet, index)
  writeTql(filePath, conversation)
}

/**
 * Delete multiple rows from a TQL file facet by indices
 * @param filePath - Path to the .tql file
 * @param facet - The facet to delete from
 * @param indices - Array of indices to delete (1-based)
 * @param documentIndex - Index of document in conversation (default: 0)
 */
export function deleteRows<T extends FacetName>(
  filePath: string,
  facet: T,
  indices: number[],
  documentIndex = 0,
): void {
  const conversation = parseTql(filePath)
  const documents = getDocuments(conversation)

  if (!documents[documentIndex]) {
    throw new Error(`Document at index ${documentIndex} not found`)
  }

  deleteRowsInMemory(documents[documentIndex], facet, indices)
  writeTql(filePath, conversation)
}

/**
 * Update a row in a TQL file facet by index
 * @param filePath - Path to the .tql file
 * @param facet - The facet to update
 * @param index - The index of the row to update (1-based)
 * @param data - New data for the row (without index)
 * @param documentIndex - Index of document in conversation (default: 0)
 */
export function updateRow<T extends FacetName>(
  filePath: string,
  facet: T,
  index: number,
  data: Partial<Omit<FacetRowType<T>, 'index'>>,
  documentIndex = 0,
): void {
  const conversation = parseTql(filePath)
  const documents = getDocuments(conversation)

  if (!documents[documentIndex]) {
    throw new Error(`Document at index ${documentIndex} not found`)
  }

  updateRowInMemory(documents[documentIndex], facet, index, data)
  writeTql(filePath, conversation)
}

// ============================================================================
// CONVERSATION OPERATIONS (With Diff Generation)
// ============================================================================

/**
 * Deep clone a TqlDocument
 */
function deepCloneDocument(doc: TqlDocument): TqlDocument {
  return JSON.parse(JSON.stringify(doc)) as TqlDocument
}

/**
 * Apply changes to a conversation document and create a new document with diff
 * This is the immutable approach: doesn't modify existing document, creates new one
 *
 * @param conversation - The conversation to modify
 * @param changes - Function that applies changes to the cloned document
 * @param sourceDocIndex - Index of document to base changes on (default: last document)
 * @returns Updated conversation with new document and diff appended to sequence
 */
export function applyChangesToConversation(
  conversation: TqlConversation,
  changes: (doc: TqlDocument) => void,
  sourceDocIndex?: number,
): TqlConversation {
  // Get all documents from sequence
  const documents = conversation.sequence
    .filter((item) => Object.keys(item)[0].startsWith('#document'))
    .map((item) => Object.values(item)[0] as TqlDocument)

  // Default to last document
  const fromIndex = sourceDocIndex ?? documents.length - 1
  const originalDoc = documents[fromIndex]

  if (!originalDoc) {
    throw new Error(`Document at index ${fromIndex} not found`)
  }

  // Clone the source document
  const newDoc = deepCloneDocument(originalDoc)

  // Apply changes to the new document
  changes(newDoc)

  // Generate diff between original and new
  const diff = diffTqlDocuments(originalDoc, newDoc)

  // Create new sequence with appended diff and document
  const toIndex = documents.length
  const newSequence = [
    ...conversation.sequence,
    {[`$diff[+${fromIndex}→+${toIndex}]`]: diff} as any,
    {[`#document[+${toIndex}]`]: newDoc} as any,
  ]

  return {
    sequence: newSequence,
  }
}
