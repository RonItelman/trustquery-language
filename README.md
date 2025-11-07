# TQL Format (Trust Query Language)

## What is TQL?
When users upload a CSV, or use a dataset, there can be ambiguity which creates risk of misunderstanding.

.tql format is a working document that a System, User, and LLM can all share for more precise shared understanding.

Using .tql allows for a methodical, standard, step-by-step process to score the range of financial and/or answers based on possible interpretations of the query and/or data that are unresolved.

For any given dataset part of a conversation, a .tql file has:
- @data: The dataset
- @meaning: A list of the column names so that each column's definition can be explicitly stated for the user to confirm.
- @structure: A list of column names so any constraints or validating properties of columns can be shown and/or confirmed by the user.
- @context: Information about the conversation, such as the User's timezone, system timezone, etc.
- @ambiguity: A list of possible issues in a query or data, that a System can deterministically parse, or LLM can pre-fill.
- @intent: Any questions a System or LLM can ask a user in order to better understand the user's intent.
- @query: A log of queries asked against this dataset, with user and timestamp.
- @tasks: Computational tasks that can be performed on the data with formulas.
- @score: Calculations of the range of possible answers based on remaining ambiguity.

By standardizing the approach of calibrating mutual understanding, this format can be distributed, and can create "memory" for systems, so that when someone else encounters the same dataset, some of the column names, etc., can be disambiguated, and over time, from a bottoms-up-approach data is cleaned, conflicts are surfaced, and recommendations may be made.

When a user answers a question, the working .tql document can be updated.

The tql-cli tool gives developers a basic set of tools to create .tql files, parse them, update them, and convert them to other formats, like JSON.

## The Problem TQL Solves

When someone asks "How much money was transferred yesterday?", there are multiple valid interpretations:
- Which timezone defines "yesterday"?
- Are amounts in dollars or thousands of dollars?
- Does "transferred" mean sent, received, or both?

**TQL makes ambiguity explicit and resolvable.**

## File Structure

A `.tql` file contains 9 sections:

### 1. `@data[N]`
The actual tabular data (CSV-style or table format)

```
@data[25]:
| transfer_id  | timestamp            | amount_usd | status    |
|--------------|----------------------|------------|-----------|
| TXN-2024-001 | 2024-11-04T08:15:23Z | 250000     | completed |
| TXN-2024-002 | 2024-11-04T14:42:11Z | 500000     | completed |
...
```

### 2. `@meaning[N]`
Business definitions for each column
- What does this column represent?
- Has the user confirmed this definition?

```
@meaning[9]:
| column               | definition                                              | user_confirmed |
|----------------------|---------------------------------------------------------|----------------|
| transfer_id          | Unique identifier for each stablecoin transfer          |                |
| timestamp            | ISO 8601 format with timezone                           |                |
| amount_usd           | Transfer value in US Dollars, scaled in thousands       |                |
| status               | Current state of the transfer transaction               |                |
```

### 3. `@structure[N]`
Technical constraints (inspired by JSON Schema)
- Data types, null handling, formats, min/max values
- Has the user confirmed these constraints?

```
@structure[9]:
| column      | nullAllowed | dataType | minValue | maxValue | format      | user_confirmed |
|-------------|-------------|----------|----------|----------|-------------|----------------|
| transfer_id | false       | string   | -        | -        |             |                |
| timestamp   | false       | datetime | -        | -        | ISO8601+TZ  |                |
| amount_usd  | false       | decimal  | 0        | -        | -           |                |
| status      | false       | enum     | -        | -        | completed|pending|failed |  |
```

### 4. `@context[N]`
Query execution context
- Current user, timezone, date/time
- Any other relevant environmental info

```
@context[4]:
| key                  | value                         |
|----------------------|-------------------------------|
| user                 | jon@citi.com                  |
| user_timezone        | America/New_York              |
| current_time_utc     | 2024-11-05T23:00:00Z          |
| current_time_local   | 2024-11-05T18:00:00-05:00     |
```

### 5. `@ambiguity[N]`
Known ambiguities that affect queries
- What triggers the ambiguity (e.g., "yesterday", "profit")
- What type of ambiguity (temporal, directional, scope)
- What's at risk if not resolved

```
@ambiguity[2]:
| query_trigger | ambiguity_type       | ambiguity_risk                              |
|---------------|----------------------|---------------------------------------------|
| yesterday     | temporal_perspective | user's timezone vs UTC (data timezone)      |
| amount_usd    | unit_scale           | User may be unaware units are in thousands  |
```

### 6. `@intent[N]`
Pre-defined clarifying questions
- The question to ask the user
- Available options
- Space to record user responses

```
@intent[2]:
| query_trigger | clarifying_question                            | options                                   | user_response | user_confirmed |
|---------------|------------------------------------------------|-------------------------------------------|---------------|----------------|
| yesterday     | Which timezone should I use to define 'yesterday'? | [Your timezone (EST), UTC]            |               |                |
| amount_usd    | The amounts are in thousands. Show as-is or converted? | [Show as-is (250), Convert to dollars ($250,000)] | | |
```

### 7. `@score[N]`
A standard way to score the precision of the query and data
- range-values: What is the range, min to max in values, for example $50,000 to $3,500,000
- number-of-interpretations: If there are 4 answers, such as $50,000 |  $95,000 | $1,125,0000 | $3,500,000 that are valid based on unresolved ambiguity
- Uncertainty Ratio: How wide the range is relative to the average. Formula: (max - min) / mean. Higher values indicate greater uncertainty
- Missing Certainty Ratio: The percentage reduction in uncertainty achieved by answering the most valuable clarifying question. A value of 1.00 (100%) means this question eliminates all uncertainty


```
@score[4]:
| measure                   | value |
|---------------------------|-------|
| range-values              |       |
| number-of-interpretations |       |
| Uncertainty Ratio (UR)    |       |
| Missing Certainty Ratio   |       |
```

### 8. `@query[N]`
Query history log
- The message/query text from the user
- When it was asked (ISO 8601 UTC timestamp)

```
@query[2]:
| user_message                                    | timestamp_utc        |
|-------------------------------------------------|----------------------|
| How much was transferred yesterday?             | 2024-11-05T23:15:42Z |
| What's the average settlement time?             | 2024-11-05T23:20:11Z |
```

### 9. `@tasks[N]`
Computational tasks that can be performed on the data
- Task name
- Description of what it calculates
- Formula or expression to compute it

```
@tasks[2]:
| name              | description                           | formula                                    |
|-------------------|---------------------------------------|--------------------------------------------|
| total_transferred | Sum of all completed transfers        | SUM(amount_usd WHERE status='completed')   |
| avg_settlement    | Average settlement time in minutes    | AVG(settlement_time_mins)                  |
```

---

## TQL CLI

CLI for Trust Query Language

## Installation

```bash
npm install -g tql-cli
```

## Usage

Create a TQL file from a CSV data source:

```bash
tql create --source csv --in examples/stablecoin.csv
```

This will generate a TQL file with 9 facets: @data, @meaning, @structure, @ambiguity, @intent, @context, @query, @tasks, @score

## Local Development

```bash
git clone https://github.com/RonItelman/tql-cli.git
cd tql-cli
npm install
npm run build
npm link
```

Then use the CLI directly:

```bash
tql create --source csv --in examples/stablecoin.csv
```

## Conclusion

### Key Features

Each section serves a specific purpose in the disambiguation process:
- **@data** - What we have (raw information)
- **@meaning** - What it means (business semantics)
- **@structure** - How it's validated (technical constraints)
- **@context** - When/where we're asking (situational awareness)
- **@ambiguity** - What's unclear (risk identification)
- **@intent** - What to ask (clarification pathway)
- **@query** - Who asked what and when (query audit trail)
- **@tasks** - What computations to perform (calculable metrics)
- **@score** - How uncertain we are (quantified risk)

Together, these sections create a complete picture of both the data and the uncertainty around it.


### Use Cases

**For Analysts:** Answer "what does this column mean?" once, benefit forever  
**For Auditors:** See all possible interpretations and their risk levels before signing off  
**For Teams:** Build shared understanding of datasets through collaborative disambiguation  
**For Systems:** Automatically detect and flag ambiguous queries before executing them