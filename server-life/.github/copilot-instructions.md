# Project rules
- This is a Vite + TypeScript (vanilla) game: HTML5, CSS3, Canvas, LocalStorage. No React, no Tailwind.
- NEVER edit, create, or delete anything inside /design-reference. It is a read-only visual reference (React export). Read it only to copy styling and markup structure.
- All code changes go in /src (and config files at the project root).
- The source of truth for game rules and numbers is docs/GDD.md. Do not invent numbers.
- Keep the game engine (src/engine) pure TypeScript with no DOM access.