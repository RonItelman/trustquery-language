// Main library exports for use in other Node applications

// TQL Generators
export { generateTql, generateTqlDocument } from './lib/generators/index.js'

export type { GenerateTqlDocumentInput, TqlGeneratorInput, TqlGeneratorOptions } from './lib/generators/index.js'
// Operations (In-Memory First-Class)
export {
  applyChangesToConversation,
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
export { generateTqlFromConversation, generateTqlFromJson, writeTql } from './lib/parser/generator.js'

// Parser (TQL → JSON)
export { parseTql, parseTqlConversationFromString, parseTqlDocumentFromString, writeTqlJson } from './lib/parser/index.js'

// Helper Functions
export { getDocumentCount, getDocuments, getLastDocument } from './lib/parser/types.js'

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
  SequenceItem,
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
