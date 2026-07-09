# Gotmends Spec Reader

## Purpose

Этот skill помогает AI или разработчику читать specs, пользовательские сценарии и планы Nova Agent перед работой, чтобы не гадать и не писать код без source-of-truth.

## When To Use

Использовать перед:

- planning;
- implementation;
- specs audit;
- active/completed plan audit;
- roadmap/changelog update;
- handoff/submission review.

## Source Order

Читать источники в таком порядке:

1. `AGENTS.md`
2. `docs/бизнес-контекст.md`
3. `docs/глобальная-спецификация.md`
4. `docs/roadmap.md`
5. `docs/пользовательские-сценарии.md`
6. `docs/specs/`
7. `plans/active/`
8. `plans/completed/`
9. `changelog/`

## Rules

- Не писать код без связанного active plan.
- Не менять архитектуру без specs update.
- Не закрывать plan без evidence и checks.
- Не делать fake AI/OpenAI claims.
- Не утверждать, что Supabase, auth или persistence реализованы, если runtime code отсутствует.
- Не трогать secrets.
- `.env.local` never committed.
- Service role key never used in frontend repo.
- Если контекст отсутствует или противоречит источникам, сообщить missing context instead of guessing.

## Output

Возвращать:

- relevant source files checked;
- missing/contradictory docs;
- required next plan;
- safe next action;
- blockers.
