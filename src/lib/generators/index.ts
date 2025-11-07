import {generateAmbiguityFacet} from './ambiguity.js'
import {generateContextFacet} from './context.js'
import {generateDataFacet} from './data.js'
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
  facets?: ('data' | 'meaning' | 'structure' | 'ambiguity' | 'intent' | 'context' | 'query' | 'tasks' | 'score')[]
}

export function generateTql(input: TqlGeneratorInput, options: TqlGeneratorOptions = {}): string {
  const {headers, rows} = input
  const facets = options.facets || ['data', 'meaning', 'structure', 'ambiguity', 'intent', 'context', 'query', 'tasks', 'score']

  const sections: string[] = []

  if (facets.includes('data')) {
    sections.push(generateDataFacet({headers, rows}))
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
