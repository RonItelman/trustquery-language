// Main library exports for use in other Node applications

// TQL Generators
export { generateTql, generateTqlDocument } from './lib/generators/index.js'

export type { GenerateTqlDocumentInput, TqlGeneratorInput, TqlGeneratorOptions } from './lib/generators/index.js'
// Operations (In-Memory First-Class)
export {
  deleteRowInMemory,
  deleteRowsInMemory,
  insertRowInMemory,
  insertRowsInMemory,
  updateRowInMemory,
} from './lib/operations/crud.js'

// Operations (File-Based Wrappers)
export {
  deleteRow,
  deleteRows,
  insertRow,
  insertRows,
  updateRow,
} from './lib/operations/crud.js'

// Diff Operations
export {
  diffConversationStep,
  diffTqlDocuments,
  formatDiffAsJson,
  formatDiffAsMarkdown,
} from './lib/operations/diff.js'

// Generator (JSON → TQL)
export { generateTqlFromJson, writeTql } from './lib/parser/generator.js'

// Parser (TQL → JSON)
export { parseTql, parseTqlFromString, writeTqlJson } from './lib/parser/index.js'

// Types
export type {
  AmbiguityFacet,
  AmbiguityRow,
  ChangeType,
  ContextFacet,
  ContextRow,
  FacetDiff,
  IntentFacet,
  IntentRow,
  MeaningFacet,
  MeaningRow,
  QueryFacet,
  QueryRow,
  RowChange,
  ScoreFacet,
  ScoreRow,
  StructureFacet,
  StructureRow,
  TableFacet,
  TableRow,
  TasksFacet,
  TasksRow,
  TqlConversation,
  TqlDiff,
  TqlDocument,
} from './lib/parser/types.js'

// CSV Reader
export { readCsv } from './lib/readers/csv.js'

// CLI (for oclif)
export { run } from '@oclif/core'
