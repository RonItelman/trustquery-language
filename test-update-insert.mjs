#!/usr/bin/env node
// Test UPDATE and INSERT with diff generation using the new sequence structure
import { parseTql } from './dist/lib/parser/index.js'
import { applyChangesToConversation, updateRowInMemory, insertRowInMemory } from './dist/lib/operations/crud.js'
import { writeTql } from './dist/lib/parser/generator.js'
import { getDocumentCount } from './dist/lib/parser/types.js'

const filePath = 'examples/stablecoin-output.tql'

console.log('📖 Reading conversation from', filePath)
const conversation = parseTql(filePath)
console.log(`   Conversation has ${getDocumentCount(conversation)} document(s)`)
console.log(`   Sequence has ${conversation.sequence.length} items\n`)

console.log('✏️  Applying changes:')
console.log('   1. UPDATE @meaning[2]/definition = "ISO 8601 UTC" (timestamp column)')
console.log('   2. INSERT @context row: key="user_timezone", value="MST"\n')

const updatedConversation = applyChangesToConversation(conversation, (doc) => {
  // UPDATE: Set definition for timestamp (row at index 2)
  updateRowInMemory(doc, 'meaning', 2, { definition: 'ISO 8601 UTC' })

  // INSERT: Add user_timezone to context
  insertRowInMemory(doc, 'context', { key: 'user_timezone', value: 'MST' })
})

console.log(`✅ Changes applied!`)
console.log(`   Conversation now has ${getDocumentCount(updatedConversation)} documents`)
console.log(`   Sequence now has ${updatedConversation.sequence.length} items\n`)

console.log('Sequence structure:')
updatedConversation.sequence.forEach((item, i) => {
  const key = Object.keys(item)[0]
  console.log(`   [${i}] ${key}`)
})

console.log('\n💾 Writing updated conversation to', filePath)
writeTql(filePath, updatedConversation)

console.log('\n✅ Done!')
console.log('\nNext steps:')
console.log('  1. View the file: cat examples/stablecoin-output.tql')
console.log('  2. Look for #conversation[2]: (was [1])')
console.log('  3. Find $diff[+0→+1]: section between documents')
console.log('  4. Check #document[+1]: has the changes:')
console.log('     - @meaning[2]/definition = "ISO 8601 UTC"')
console.log('     - @context[1] with user_timezone=MST')
