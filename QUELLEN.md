# Quellen und Medienherkunft

## Fachliche Grundlage

Geprüft am 25.09.2026. Produktoberflächen und Funktionsumfang können sich ändern. Die LVM-Zielarchitektur und Priorisierung sind ein Vorschlag für diese Präsentation, keine dokumentierte Bestandsarchitektur.

- Git und Versionsgeschichte: https://docs.github.com/en/get-started/using-git/about-git
- Claude-Code-Architektur, Harness und Kontextverdichtung: https://code.claude.com/docs/en/how-claude-code-works
- Persistente Projektanweisungen: https://code.claude.com/docs/en/memory
- Claude Code im Web, Einstieg: https://code.claude.com/docs/en/web-quickstart
- Cloud-Arbeitsweise: https://code.claude.com/docs/en/claude-code-on-the-web
- OpenCode, unterstützte Anbieter und lokale Modelle: https://opencode.ai/docs/providers/
- OpenCode, Projektanweisungen: https://opencode.ai/docs/rules/
- GitLab-Projekte: https://docs.gitlab.com/user/project/
- GitLab Merge Requests: https://docs.gitlab.com/user/project/merge_requests/
- GitHub Review: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request
- GitHub Merge: https://docs.github.com/en/pull-requests/how-tos/merge-and-close-pull-requests/merging-a-pull-request
- Repository anlegen: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository

## Echte öffentliche Screenshots

Keine der folgenden Aufnahmen ist eine KI-generierte Nachbildung. Die PNGs aus GIFs sind unveränderte Einzelbilder des jeweiligen öffentlich veröffentlichten Mediums. UI-Texte wurden nicht übersetzt, übermalt oder auf ein anderes Projekt umgeschrieben. Die Präsentation skaliert Bilder proportional. Sichtbar sind öffentliche Beispielprojekte; kein Zugriff auf Konten oder Daten von Hannes oder dem LVM.

### Claude Code und GitHub – öffentliche Produktdemo

Veröffentlichung: Paul Sawers / Tessl, 22.10.2025, „Anthropic brings Claude Code to the web and mobile“.
https://tessl.io/blog/anthropic-brings-claude-code-to-the-web-and-mobile

- `claude-web-start.png`: Frame 0 (nullbasiert) aus „Claude Code’s web app in action“, 751 × 422 px. Startansicht.
  Original: https://cdn.sanity.io/images/ojuglg5y/production/0f9ee0002779cf138c3721e4a70b35bfcdf4aba1-751x422.gif
- `claude-web-result.png`: Frame 0 aus „Creating a PR in Claude Code“, 800 × 450 px. Ergebnis, Branch, Testausgabe und Create PR. **In der Präsentation verwendet.**
- `github-public-pr.png`: Frame 85 derselben GIF-Demo, 800 × 450 px. Geöffneter GitHub Pull Request. **In der Präsentation verwendet.**
- `github-create-pr.png`: Frame 60 derselben GIF-Demo, 800 × 450 px. Formular zur Erstellung eines Pull Requests.
  Original für diese drei Bilder: https://cdn.sanity.io/images/ojuglg5y/production/bca5e2aef52d889bc554ecf873850abb7f5a70f8-800x450.gif

Die Bilder dokumentieren den Veröffentlichungsstand von Oktober 2025. Sie sind keine Behauptung über das heutige Aussehen der Oberfläche. Zugehörige offizielle Produkteinführung: https://claude.com/blog/claude-code-on-the-web

### GitHub Docs – Originalbilder

- `github-diff.png`, 980 × 608 px: Änderungen und Inline-Kommentar.
  Seite: https://docs.github.com/en/pull-requests/how-tos/review-pull-requests/reviewing-proposed-changes-in-a-pull-request
  Original: https://docs.github.com/assets/cb-44227/images/help/commits/hover-comment-icon.png
- `github-create-repository.png`, 1528 × 350 px: Name eines neuen Repositorys.
  Seite: https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
  Original: https://docs.github.com/assets/cb-89988/images/help/repository/create-repository-name.png

Die Rechte an Produktoberflächen, Marken und veröffentlichten Medien verbleiben bei den jeweiligen Rechteinhabern. Dieser Nachweis behauptet keine neue freie Lizenz für die Bilder.

## Eigene Illustrationen

Die schematischen Grafiken zu Kontext, Werkzeugwechsel und Zielbetrieb sind eigenständige, editierbare HTML/CSS-Darstellungen. Sie sind keine Screenshots existierender LVM-Systeme. Dekorative Naturhintergründe wurden KI-generiert. Die Motive der Folien „Ermöglichen“ (`assets/scene-dawn.jpg`, Morgenlicht über Hügelketten) und „Danke“ (`assets/scene-network.jpg`, Netzknoten auf einem Kreisbogen) sind prozedural mit HTML-Canvas erzeugte Grafiken aus `tools/scene-dawn.html` und `tools/scene-network.html`; sie sind keine Fotos, keine KI-Bilder und keine Darstellungen realer Orte oder Systeme. Die zusätzliche Pflanzen-App und ihre Screenshots sind eigens erstellte Lehrbeispiele.

## Weitere prozedurale Motive (Vortrag vave)

Die Kapitelmotive **Planstand** (`assets/scene-plan.jpg`, Bogen einer technischen Zeichnung mit Schraffur, Maßkette und Änderungswolke), **Lichtbogen** (`assets/scene-light.jpg`, gebogene Lichtwand aus Lamellen mit Spiegelung) und **Materialfächer** (`assets/scene-fan.jpg`, aufgefächerte Materialmuster) sind wie Netzknoten und Morgenlicht prozedural erzeugte Grafiken aus `tools/scene-plan.html`, `tools/scene-light.html` und `tools/scene-fan.html` (Renderer `tools/render-scene.mjs`). Dazu kommen **Laufbahn** (`assets/scene-track.jpg`, sechs Bahnen einer Laufbahn mit Ziellinie und Bahnnummern), **Stollen** (`assets/scene-vault.jpg`, Stollenportal im Fels unter kaltem Himmel, angelehnt an die Idee eines Archivs im Berg, keine Darstellung des realen Arctic World Archive), **Schallplatte** (`assets/scene-record.jpg`, oberer Bogen einer Schallplatte mit Rillen und Lichtreflexen), **Lupe** (`assets/scene-lens.jpg`, Lupe mit Messingfassung über einer Seite mit Textzeilen und Diff-Block) und **Torbogen** (`assets/scene-arch.jpg`, Rundbogen in einer Putzwand mit Licht dahinter) aus `tools/scene-track.html`, `tools/scene-vault.html`, `tools/scene-record.html`, `tools/scene-lens.html` und `tools/scene-arch.html`. Keine Fotos, keine KI-Bilder, keine Darstellung realer Objekte oder Orte.

## Zitate und Fakten im Vortrag vave

- Andrej Karpathy, „The hottest new programming language is English.“, 24.01.2023: https://x.com/karpathy/status/1617979122625712128
- Andrej Karpathy, „vibe coding“, 02.02.2025: https://x.com/karpathy/status/1886192184808149383 · Collins Word of the Year 2025: https://www.collinsdictionary.com/woty
- Linus Torvalds, „Talk is cheap. Show me the code.“, LKML 25.08.2000: https://lkml.org/lkml/2000/8/25/132
- Git-Entstehung (3. April 2005, erster Commit 7. April 2005 „the information manager from hell“, Name): https://git-scm.com/book/de/v2 · https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290 · https://en.wikipedia.org/wiki/Git#Naming · Handbuchseite: https://git-scm.com/docs/git
- GitHub Arctic Code Vault (Schnappschuss 02.02.2020, 186 Filmrollen, 21 TB, Svalbard): https://archiveprogram.github.com/arctic-vault/
- GitHub: 100 Millionen Entwickler (Januar 2023): https://github.blog/news-insights/company-news/100-million-developers-and-counting/ · Microsoft übernimmt GitHub (2018): https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/
- Agenten-Definition: Anthropic, „Building effective agents“, Dezember 2024: https://www.anthropic.com/research/building-effective-agents · Claude Code: https://www.anthropic.com/news/claude-3-7-sonnet
- Die Screenshots der Workflow-Folie: siehe oben (Tessl, öffentliche Produktdemo). Preise, Module und Zahlen im Beispielauftrag sind erfunden.
