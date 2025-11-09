// Main library exports for use in other Node applications

// TQL Generators
export { generateTql } from './lib/generators/index.js'

export type { TqlGeneratorInput, TqlGeneratorOptions } from './lib/generators/index.js'
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

// Generator (JSON → TQL)
export { generateTqlFromJson, writeTql } from './lib/parser/generator.js'

// Parser (TQL → JSON)
export { parseTql, parseTqlFromString, writeTqlJson } from './lib/parser/index.js'

// Types
export type {
  AmbiguityFacet,
  AmbiguityRow,
  ContextFacet,
  ContextRow,
  DataFacet,
  DataRow,
  IntentFacet,
  IntentRow,
  MeaningFacet,
  MeaningRow,
  QueryFacet,
  QueryRow,
  ScoreFacet,
  ScoreRow,
  StructureFacet,
  StructureRow,
  TasksFacet,
  TasksRow,
  TqlDocument,
} from './lib/parser/types.js'

// CSV Reader
export { readCsv } from './lib/readers/csv.js'

// CLI (for oclif)
export { run } from '@oclif/core'
