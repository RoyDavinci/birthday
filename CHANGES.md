# RoyDavinci Birthday Quiz — correction bundle

Apply these files to the existing project root, preserving the directory structure.

## Replace
- `src/App.tsx`
- `src/data/questions.ts`
- `src/types/quiz.ts`
- `src/utils/scoring.ts`
- `index.html`
- `package.json`
- `README.md`

## Add
- `src/components/QuizAppContext.ts`
- `src/components/QuizAppProvider.tsx`
- `src/components/WelcomeScreen.tsx`
- `src/components/RoundIntroScreen.tsx`
- `src/components/QuizScreen.tsx`
- `src/components/ResultsScreen.tsx`
- `src/hooks/quizReducer.ts`
- `src/hooks/useQuizSession.ts`
- `src/hooks/useQuizTimer.ts`
- `src/utils/formatting.ts`
- `src/data/questions.test.ts`
- `src/utils/scoring.test.ts`
- `public/og-image.svg`

## Delete these unused template files
- `src/App.css`
- `src/assets/hero.png`
- `src/assets/react.svg`
- `src/assets/vite.svg`
- `public/icons.svg`

Keep `public/favicon.svg`; `index.html` still uses it.

## Install and verify

Run from the project root:

```bash
npm install
npm run lint
npm test
npm run build
```

`npm install` will synchronize `package-lock.json` with the new Vitest dependency. The lockfile is not included in this changed-files-only bundle.

The generated `dist/` directory is deliberately excluded. Rebuild it before deployment. macOS `__MACOSX` files are also excluded.

## What this bundle changes

- Shuffles choice options for each new attempt and stores their order with the saved session.
- Uses an absolute deadline for the 30-second timer and submits any entered response on timeout.
- Adds Enter-to-submit for typed answers.
- Tightens number scoring for small counts and parses commas, naira symbols, and `k`/`m`/`bn` shorthand.
- Accepts multi-part text answers in either order, with synonyms, partial credit, and one-character typo tolerance.
- Hides the dream-house budget range in its prompt.
- Removes the fraud-related question and replaces it with a confirmed, non-sensitive personal question.
- Removes difficulty labels, varies repeated answers, and adds a fun fact to each question.
- Adds an optional answer/fun-fact review, WhatsApp birthday-message button, WhatsApp score sharing, toast notifications, and improved results-image sharing.
- Splits the four main screens into components and moves core quiz state into a reducer plus timer/session hooks.
- Adds Vitest tests for scoring and question-bank integrity.
- Adds `noindex` and Open Graph/Twitter metadata.

This remains a casual frontend-only quiz. The questions ship in the JavaScript bundle and local storage is editable, so scores are not tamper-proof. No leaderboard or backend is included.

After deploying, update `og:image` and `twitter:image` in `index.html` to the absolute URL of `og-image.svg` for reliable chat previews.
