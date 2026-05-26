# Content Pipeline

v0.2 content pipeline scripts live here.

## Scripts to implement

```text
ingest-url.ts
ingest-daily.ts
fetch-article.ts
clean-article.ts
call-ai.ts
classify-source.ts
build-lesson.ts
validate-lesson.ts
select-daily-sources.ts
```

## package.json scripts

Add:

```json
{
  "scripts": {
    "ingest:url": "tsx tools/content-pipeline/ingest-url.ts",
    "ingest:daily": "tsx tools/content-pipeline/ingest-daily.ts",
    "validate:lessons": "tsx tools/content-pipeline/validate-lesson.ts",
    "export:anki": "tsx tools/content-pipeline/export-anki.ts"
  }
}
```

## dependencies

Suggested:

```bash
npm i jsdom @mozilla/readability cheerio zod yaml
npm i -D tsx
```

## AI provider

Default: GitHub Models in GitHub Actions.

Required workflow permission:

```yaml
permissions:
  models: read
```
