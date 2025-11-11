# TQL DIFF Example

Demonstrates the diff functionality for tracking changes between TQL documents in a conversation.

## Use Case: Collaborative Data Disambiguation

A user uploads a CSV, then an LLM fills in meanings and context. The DIFF shows exactly what changed.

## Example Code

```typescript
import {
  generateTqlDocument,
  insertRowInMemory,
  updateRowInMemory,
  diffTqlDocuments,
  formatDiffAsMarkdown
} from 'trustql'

// Step 1: User uploads CSV
const csvData = {
  headers: ['id', 'product', 'price'],
  rows: [
    ['1', 'Widget', '9.99'],
    ['2', 'Gadget', '19.99'],
    ['3', 'Doohickey', '29.99']
  ]
}

const doc0 = generateTqlDocument({
  source: { format: 'csv', data: csvData },
  facet: { name: '@table' }
})

// Step 2: LLM fills in meanings
const doc1 = JSON.parse(JSON.stringify(doc0)) // Deep clone

updateRowInMemory(doc1, 'meaning', 1, {
  definition: 'Unique product identifier'
})
updateRowInMemory(doc1, 'meaning', 2, {
  definition: 'Product name or description'
})
updateRowInMemory(doc1, 'meaning', 3, {
  definition: 'Product price in USD'
})

// LLM adds context
insertRowInMemory(doc1, 'context', {
  key: 'currency',
  value: 'USD'
})

// Step 3: Compute diff
const diff = diffTqlDocuments(doc0, doc1)
const markdownOutput = formatDiffAsMarkdown(diff, true) // true = colors

console.log(markdownOutput)
```

## Output (with terminal colors)

```
📊 TQL DIFF

Summary:
  • 2 facets modified
  • 7 facets unchanged
  • 7 row changes

Changes by facet:

@meaning (modified)
  • 6 changes

| Δ | index | column  | definition                  |
|---|-------|---------|-----------------------------|
| - | 1     | id      |                             |  (red)
| + | 1     | id      | Unique product identifier   |  (green)
| - | 2     | product |                             |  (red)
| + | 2     | product | Product name or description |  (green)
| - | 3     | price   |                             |  (red)
| + | 3     | price   | Product price in USD        |  (green)

@context (added)
  • 1 changes

| Δ | index | key      | value |
|---|-------|----------|-------|
| + | 1     | currency | USD   |  (green)

Unchanged facets:
  ✓ @table (3 rows)
  ✓ @structure (3 rows)
  ✓ @ambiguity (0 rows)
  ✓ @intent (0 rows)
  ✓ @query (0 rows)
  ✓ @tasks (0 rows)
  ✓ @score (4 rows)
```

## Key Features

### Git-Style Diff Format
- Red `-` for removed/old values
- Green `+` for added/new values
- Two rows for modifications (git-style)

### Table Validation
```typescript
// Error if @table differs
doc2.table.rows[0].product = 'Changed'

diffTqlDocuments(doc1, doc2)
// ❌ Error: DIFF operations can only be performed on matching datasets
```

### Conversation Diff
```typescript
const conversation = {
  documents: [doc0, doc1, doc2]
}

// Compare documents by index
const diff = diffConversationStep(conversation, 0, 1)
```

### JSON Output (for APIs)
```typescript
const jsonOutput = formatDiffAsJson(diff)
// Returns structured JSON instead of markdown
```

## Use Cases

1. **Debugging LLM behavior** - See exactly what the LLM changed
2. **Audit trails** - Track every disambiguation decision
3. **Quality metrics** - Measure how many clarifications were needed
4. **User feedback** - Show users what the system understood
5. **Testing** - Verify LLM output matches expected changes

## Why This Matters

Traditional approach:
```
User: "Show me total revenue"
LLM: [generates answer with assumptions]
User: "That's wrong"
→ No record of what assumptions were made
```

With TQL DIFF:
```
User: "Show me total revenue"
System generates doc[0] with ambiguity flagged

LLM clarifies, generates doc[1]
→ DIFF shows: @intent added "Which total: gross or net?"

User responds, generates doc[2]
→ DIFF shows: @context added "total_type: net"

Full audit trail of disambiguation!
```

## API Reference

### Core Functions

- `diffTqlDocuments(before, after)` - Diff two documents
- `diffConversationStep(conversation, fromIndex, toIndex)` - Diff conversation documents
- `formatDiffAsMarkdown(diff, useColors?)` - Terminal output with colors
- `formatDiffAsJson(diff)` - JSON output for APIs

### Types

- `TqlDiff` - Complete diff result
- `FacetDiff` - Changes for a single facet
- `RowChange` - Individual row change (added/removed/modified)
- `ChangeType` - 'added' | 'removed' | 'modified' | 'unchanged'
