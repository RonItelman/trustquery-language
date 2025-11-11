# Using trustql as a Library in Your Project

## Installation

```bash
# From npm
npm install trustql

# OR from GitHub
npm install github:RonItelman/tql-cli

# OR local development
npm install /path/to/tql-cli
```

## Example: CSV Drag & Drop

```typescript
import { readCsv, generateTql, parseTqlFromString, writeTqlJson } from 'trustql'
import fs from 'fs'

// When user drops a CSV file
function handleCsvDrop(csvFilePath: string, format: 'tql' | 'json' = 'tql') {
  // 1. Read the CSV
  const csvData = readCsv(csvFilePath)

  // 2. Generate TQL (returns a string, all in-memory)
  const tqlContent = generateTql({
    headers: csvData.headers,
    rows: csvData.rows
  })

  // 3. Choose output format
  if (format === 'json') {
    // Convert TQL string to JSON
    const tqlDoc = parseTqlFromString(tqlContent)
    writeTqlJson('output.json', tqlDoc)
    return tqlDoc
  } else {
    // Save as TQL
    fs.writeFileSync('output.tql', tqlContent, 'utf-8')
    return tqlContent
  }
}

// Usage - TQL format
const tqlString = handleCsvDrop('./data/transactions.csv', 'tql')

// Usage - JSON format
const tqlJson = handleCsvDrop('./data/transactions.csv', 'json')
```

## Example: Working with TQL in Memory (Web App / REST API)

```typescript
import {
  readCsv,
  generateTql,
  parseTqlFromString,
  generateTqlFromJson,
  insertRowInMemory,
  updateRowInMemory,
  deleteRowInMemory
} from 'trustql'

// 1. User uploads CSV (web app scenario)
const csvData = readCsv(uploadedFile)

// 2. Generate TQL string (in-memory, no files)
const tqlString = generateTql({
  headers: csvData.headers,
  rows: csvData.rows
})

// 3. Parse to JSON for manipulation (in-memory)
const doc = parseTqlFromString(tqlString)

// 4. CRUD operations (in-memory - NO filesystem)
insertRowInMemory(doc, 'context', {
  key: 'user-timezone',
  value: 'America/New_York'
})

updateRowInMemory(doc, 'context', 1, {
  value: 'America/Los_Angeles'
})

insertRowInMemory(doc, 'meaning', {
  column: 'amount_usd',
  definition: 'Transaction amount in USD (thousands)',
  user_confirmed: 'yes'
})

deleteRowInMemory(doc, 'query', 1)

// 5. Convert back to TQL string
const updatedTqlString = generateTqlFromJson(doc)

// 6. Send to frontend or save to database
await saveToDatabase(userId, datasetId, updatedTqlString)
// OR return to client
res.json({ tql: updatedTqlString })
```

## Example: Generate TQL without Files

```typescript
import { generateTql } from 'trustql'

// In-memory CSV data
const data = {
  headers: ['id', 'name', 'amount'],
  rows: [
    ['1', 'Alice', '100'],
    ['2', 'Bob', '200']
  ]
}

// Generate TQL string (no file operations)
const tqlString = generateTql(data)

// Use the string however you need
sendToClient(tqlString)
// OR save it
// OR parse it
```

## TypeScript Types

```typescript
import type {
  TqlDocument,
  MeaningRow,
  StructureRow
} from 'trustql'

function processTql(doc: TqlDocument) {
  doc.meaning.rows.forEach((row: MeaningRow) => {
    console.log(`Column: ${row.column}, Definition: ${row.definition}`)
  })
}
```

## Example: File-Based CRUD (Convenience Wrappers)

```typescript
import { insertRow, insertRows, updateRow, deleteRow, deleteRows } from 'trustql'

// INSERT
insertRow('data.tql', 'context', {
  key: 'user-timezone',
  value: 'MST'
})

insertRows('data.tql', 'tasks', [
  {
    name: 'total_transferred',
    description: 'Sum of all completed transfers',
    formula: 'SUM(amount_usd WHERE status=completed)'
  }
])

// UPDATE (by index - partial updates supported)
updateRow('data.tql', 'context', 1, {
  value: 'PST'  // Only update the value field
})

// DELETE
deleteRow('data.tql', 'context', 1)
deleteRows('data.tql', 'context', [2, 3, 5])

// Note: These are convenience wrappers around the in-memory operations
// They do: parseTql → modify → writeTql
```

## CLI Commands

### Create (with stdin/stdout for in-memory testing)

```bash
# Create TQL file from CSV (default format)
tql create --source csv --in data.csv

# Create JSON file from CSV
tql create --source csv --in data.csv --format json

# Output to stdout (for testing in-memory, no files created)
tql create --source csv --in data.csv --out -

# Read from stdin, output to stdout (fully in-memory)
cat data.csv | tql create --source csv --in -
echo "name,age\nAlice,30\nBob,25" | tql create --source csv --in -

# Paste CSV from clipboard (macOS)
pbpaste | tql create --source csv --in -

# Copy CSV in VSCode, paste in terminal, see TQL output:
# 1. Copy CSV content from VSCode
# 2. Run: pbpaste | tql create --source csv --in -
# 3. See TQL output immediately

# JSON format from stdin
cat data.csv | tql create --source csv --in - --format json
```

### Insert

```bash
# Insert using key/value flags (for @context facet)
tql insert --file data.tql --facet context --key user-timezone --value MST

# Insert using JSON data (for any facet)
tql insert --file data.tql --facet tasks --data '{"name":"total_transferred","description":"Sum of all completed transfers","formula":"SUM(amount_usd WHERE status=completed)"}'
```

### Update

```bash
# Update a row by index (partial updates supported)
tql update --file data.tql --facet context --index 1 --data '{"value":"PST"}'

# Update multiple fields
tql update --file data.tql --facet meaning --index 2 --data '{"definition":"Updated definition"}'
```

### Delete

```bash
# Delete a single row by index
tql delete --file data.tql --facet context --index 1

# Delete multiple rows by indices
tql delete --file data.tql --facet context --indices 1,3,5
```

## API Reference

### Core Functions

**Reading & Parsing:**
- `readCsv(filePath: string)` - Read CSV file
- `parseTql(filePath: string)` - Parse TQL file to JSON
- `parseTqlFromString(content: string)` - Parse TQL content string to JSON (in-memory)

**Generating & Writing:**
- `generateTql(input, options?)` - Generate TQL string from CSV data (in-memory)
- `generateTqlFromJson(doc: TqlDocument)` - Convert JSON to TQL string (in-memory)
- `writeTql(filePath: string, doc: TqlDocument)` - Write TQL document to .tql file
- `writeTqlJson(filePath: string, doc: TqlDocument)` - Write TQL document to .json file

**In-Memory CRUD Operations (First-Class):**
- `insertRowInMemory(doc, facet, data)` - Insert a row (mutates doc, no I/O)
- `insertRowsInMemory(doc, facet, dataArray)` - Insert multiple rows (mutates doc, no I/O)
- `updateRowInMemory(doc, facet, index, data)` - Update a row by index (mutates doc, no I/O)
- `deleteRowInMemory(doc, facet, index)` - Delete a row by index (mutates doc, no I/O)
- `deleteRowsInMemory(doc, facet, indices)` - Delete multiple rows (mutates doc, no I/O)

**File-Based CRUD Operations (Convenience Wrappers):**
- `insertRow(filePath, facet, data)` - Parse → insert → write
- `insertRows(filePath, facet, dataArray)` - Parse → insert multiple → write
- `updateRow(filePath, facet, index, data)` - Parse → update → write
- `deleteRow(filePath, facet, index)` - Parse → delete → write
- `deleteRows(filePath, facet, indices)` - Parse → delete multiple → write

**Diff Operations (In-Memory):**
- `diffTqlDocuments(before, after)` - Compute diff between two documents
- `diffConversationStep(conversation, fromIndex, toIndex)` - Diff documents in conversation
- `formatDiffAsMarkdown(diff, useColors?)` - Format as markdown with terminal colors
- `formatDiffAsJson(diff)` - Format as JSON string

### Types

All types exported: `TqlDocument`, `TqlConversation`, `TqlDiff`, `FacetDiff`, `RowChange`, `TableRow`, `MeaningRow`, `StructureRow`, etc.

See `src/lib/parser/types.ts` for complete type definitions.
