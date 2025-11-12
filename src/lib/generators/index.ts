import type {TqlDocument} from '../parser/types.js'

import {parseTqlDocumentFromString} from '../parser/index.js'
import {generateAmbiguityFacet} from './ambiguity.js'
import {generateContextFacet} from './context.js'
import {generateTableFacet} from './data.js'
import {generateIntentFacet} from './intent.js'
import {generateMeaningFacet} from './meaning.js'
import {generateQueryFacet} from './query.js'
import {generateScoreFacet} from './score.js'
import {generateStructureFacet} from './structure.js'
import {generateTasksFacet} from './tasks.js'

export interface TqlGeneratorInput {
  headers: string[]
  rows: string[][]
}

export interface TqlGeneratorOptions {
  facets?: ('ambiguity' | 'context' | 'intent' | 'meaning' | 'query' | 'score' | 'structure' | 'table' | 'tasks')[]
}

export function generateTql(input: TqlGeneratorInput, options: TqlGeneratorOptions = {}): string {
  const {headers, rows} = input
  const facets = options.facets || ['table', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score']

  const sections: string[] = []

  if (facets.includes('table')) {
    sections.push(generateTableFacet({headers, rows}))
  }

  if (facets.includes('meaning')) {
    sections.push(generateMeaningFacet({headers}))
  }

  if (facets.includes('structure')) {
    sections.push(generateStructureFacet({headers}))
  }

  if (facets.includes('ambiguity')) {
    sections.push(generateAmbiguityFacet())
  }

  if (facets.includes('intent')) {
    sections.push(generateIntentFacet())
  }

  if (facets.includes('context')) {
    sections.push(generateContextFacet())
  }

  if (facets.includes('query')) {
    sections.push(generateQueryFacet())
  }

  if (facets.includes('tasks')) {
    sections.push(generateTasksFacet())
  }

  if (facets.includes('score')) {
    sections.push(generateScoreFacet())
  }

  return sections.join('\n\n')
}

// New API for generating TqlDocument objects directly
export interface GenerateTqlDocumentInput {
  facet: {
    name: '@table'
  }
  source: {
    data: {
      headers: string[]
      rows: string[][]
    }
    format: 'csv'
  }
}

/**
 * Generate a TqlDocument object from CSV data
 * Returns a fully parsed TqlDocument (JSON) instead of a TQL string
 *
 * @example
 * const doc = generateTqlDocument({
 *   source: { format: 'csv', data: csvData },
 *   facet: { name: '@table' }
 * })
 */
export function generateTqlDocument(input: GenerateTqlDocumentInput): TqlDocument {
  const {headers, rows} = input.source.data

  // Generate TQL string with all facets
  const tqlString = generateTql({headers, rows})

  // Parse to TqlDocument object
  return parseTqlDocumentFromString(tqlString)
}
