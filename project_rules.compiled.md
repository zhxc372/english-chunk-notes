# project_rules.compiled.md

## Mission

Build a static, exam-oriented and technical-English chunk learning site.

## Non-negotiable Constraints

- Static-first.
- No login.
- No database.
- No backend in v1.
- No online AI calls at runtime.
- No online TTS calls at runtime.
- Content must live in JSON / Markdown.
- Audio must be pre-generated static MP3.
- Favorites must use localStorage.

## Core Loop

Article → Audio → Chunks → Favorites → Flashcards → Retelling / Writing.

## MVP Pages

- Home
- Theme lesson page
- Favorites
- Flashcards
- Technical English index
- Exam tag index

## MVP Components

- LessonList
- ChunkCard
- FavoriteButton
- AudioPlayer
- FlashcardTrainer

## MVP Data Fields

Every chunk needs:

- id
- chunk
- meaning_cn
- collocations
- sentence
- sentence_cn
- rewrite_prompt_cn
- retelling_prompt
- tags
- exam_tags

## Forbidden Feature Creep

Do not implement:

- auth
- DB
- sync
- scoring
- payment
- social
- full exam question bank
- runtime AI
- runtime TTS
