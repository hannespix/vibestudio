# Vibe Studio – Hinweise für Claude Code

## Projekt

- Reveal.js-Vorträge und der Browser-Editor Vibe Studio, Vanilla JS ohne Build-Tool und ohne Abhängigkeiten. Jeder Vortrag liegt unter `decks/<kurzname>/` (`slides.html`, `state.json`, `deck.json`); `build.mjs` baut daraus die Entwicklerfassung `decks/<kurzname>/index.html` und die Ein-Datei-Fassung in `dist/`.
- Die Live-Ideen-Folie (`live.js`, `live.css`) holt die Ideen des Publikums aus der Firebase Realtime Database von pix·el; das Präsentationstool selbst liegt im Repo `hannespix/pix-el`.
- Mehr Hintergrund: `README.md` (Aufbau, Bedienung, Arbeitsweise), Quellen und Lizenzen in `QUELLEN.md`.

## Prüfen

- `node build.mjs && node tools/smoke-test.mjs` muss grün sein. Einmalig: `npm install --no-save playwright@1.56.1 jsqr@1.4.0`, dazu Chromium für Playwright.
- Für das Aussehen: Screenshots unter `dist/smoke/` ansehen, oder `python3 -m http.server` im Projektordner und `decks/<kurzname>/index.html` im Browser öffnen.

## Fester Arbeitsablauf (von Hannes festgelegt am 02.11.2026)

Nach **jeder** Änderung automatisch und ohne Rückfrage:

1. Auf einem Arbeitsbranch arbeiten, nie direkt auf `main` committen.
2. Vor dem Push bauen und den Smoke-Test laufen lassen. Nur grün pushen.
3. Pull Request gegen `main` öffnen (kein Draft), die Prüfung (`.github/workflows/ci.yml`) abwarten und bei grün sofort mergen: als Merge-Commit mit dem Titel „<PR-Titel> (#<Nummer>)“, wie bei allen bisherigen PRs.
4. Der Merge auf `main` startet `.github/workflows/pages.yml` und veröffentlicht alle Vorträge auf GitHub Pages. Den Lauf abwarten und prüfen. Schlägt er fehl, sofort nachbessern: neuer Branch, PR, Merge.
5. Zum Abschluss live prüfen (https://hannespix.github.io/vibestudio/ und die geänderten Vorträge) und kurz berichten: PR-Nummer, Merge-Commit, Workflow-Status, Live-URL.

Jede Änderung bekommt einen eigenen PR, auch kleine.
