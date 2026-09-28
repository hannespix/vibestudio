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

## Eigene Illustrationen und Kapitelmotive

Die schematischen Grafiken zu Kontext, Werkzeugwechsel und Zielbetrieb sind eigenständige, editierbare HTML/CSS-Darstellungen. Sie sind keine Screenshots existierender LVM-Systeme. Die Naturhintergründe Keramikteller, Holzquerschnitt, Wasserringe, Pflanzenquerschnitt und Planetenkante wurden KI-generiert. Die Netzknoten der Danke-Folie im Vortrag rp (`assets/scene-network.jpg`) sind eine prozedural mit HTML-Canvas erzeugte Grafik aus `tools/scene-network.html`, kein Foto und kein KI-Bild. Die Fotomotive (Sonne, Mond, Erde, Erde bei Nacht, Tresortür, Wählscheibe, Astrolabium, Sonnenblume, Kanaldeckel) sind leicht bearbeitete gemeinfreie Fotos; welche Bearbeitung jeweils vorgenommen wurde, steht in der zugehörigen Datei `tools/scene-*.html`. Die Sonnenblume liegt derzeit auf keiner Folie. Der Vortrag katzen verwendet ausschließlich diese vorhandenen Motive. Die zusätzliche Pflanzen-App und ihre Screenshots sind eigens erstellte Lehrbeispiele.

## Frühere prozedurale Motive

Morgenlicht, Planstand, Lichtbogen, Materialfächer, Laufbahn, Schallplatte, Lupe und Torbogen (`assets/scene-*.jpg`, Generatoren `tools/scene-*.html`, Renderer `tools/render-scene.mjs`) sind prozedural erzeugte Grafiken, keine Fotos und keine KI-Bilder. Sie liegen derzeit auf keiner Folie und bleiben als Vorlagen erhalten.

## Zitate und Fakten im Vortrag vave

- Andrej Karpathy, „The hottest new programming language is English.“, 24.01.2023: https://x.com/karpathy/status/1617979122625712128
- Andrej Karpathy, „vibe coding“, 02.02.2025: https://x.com/karpathy/status/1886192184808149383 · Collins Word of the Year 2025: https://www.collinsdictionary.com/woty
- Linus Torvalds, „Talk is cheap. Show me the code.“, LKML 25.08.2000: https://lkml.org/lkml/2000/8/25/132
- Git-Entstehung (3. April 2005, erster Commit 7. April 2005 „the information manager from hell“, Name): https://git-scm.com/book/de/v2 · https://github.com/git/git/commit/e83c5163316f89bfbde7d9ab23ca2e25604af290 · https://en.wikipedia.org/wiki/Git#Naming · Handbuchseite: https://git-scm.com/docs/git
- GitHub Arctic Code Vault (Schnappschuss 02.02.2020, 186 Filmrollen, 21 TB, Svalbard): https://archiveprogram.github.com/arctic-vault/
- GitHub: 100 Millionen Entwickler (Januar 2023): https://github.blog/news-insights/company-news/100-million-developers-and-counting/ · Microsoft übernimmt GitHub (2018): https://news.microsoft.com/2018/06/04/microsoft-to-acquire-github-for-7-5-billion/
- Agenten-Definition: Anthropic, „Building effective agents“, Dezember 2024: https://www.anthropic.com/research/building-effective-agents · Claude Code: https://www.anthropic.com/news/claude-3-7-sonnet
- Transformer-Architektur: Vaswani u. a., „Attention Is All You Need“, Juni 2017: https://arxiv.org/abs/1706.03762 · ChatGPT, 30.11.2022: https://openai.com/index/chatgpt/
- Die Aufträge auf den Folien „Eine Runde“ und „Mein Auftrag, wörtlich“ stammen aus der Entstehung dieses Repos (Pull Requests #11, #12 und #13), sprachlich nur geglättet; die Diff-Zeilen sind echte Änderungen aus `studio.css` in diesen Pull Requests.

## Fakten im Vortrag katzen

Stand der Prüfung: 28.09.2026. Die Zahlen stehen mit Fundstelle auch in den Sprechernotizen.

- Heimtierbestand 2025 (15,7 Millionen Katzen in 24 Prozent der Haushalte, 10,0 Millionen Hunde), IVH/ZZF: https://www.zzf.de/marktdaten/heimtiere-in-deutschland
- Abstammung von der Falbkatze, Domestikation im Nahen Osten vor rund 10 000 Jahren: Driscoll u. a., Science 2007: https://doi.org/10.1126/science.1139518
- Grab auf Zypern, rund 9 500 Jahre alt: Vigne u. a., Science 2004: https://doi.org/10.1126/science.1095335
- Ankunft in Europa vor rund 2 000 Jahren, aus Nordafrika: Science 2025: https://doi.org/10.1126/science.adt2642
- Sehen mit etwa einem Sechstel des Lichts, Tapetum lucidum, Jacobson-Organ, Tasthaare: https://en.wikipedia.org/wiki/Cat_senses
- Hörbereich 48 Hz bis 85 kHz: Heffner und Heffner 1985: https://pubmed.ncbi.nlm.nih.gov/4066516/
- Kein Süß-Rezeptor (Tas1r2 als Pseudogen): Li u. a., PLoS Genetics 2005: https://doi.org/10.1371/journal.pgen.0010003
- Schnurren zwischen 25 und 150 Hz, auch bei Geparden, Pumas, Ozelots und Servalen: von Muggenthaler, JASA 2001: https://doi.org/10.1121/1.4777098
- Erwachsene Katzen miauen untereinander kaum: https://en.wikipedia.org/wiki/Meow
- Langsames Blinzeln: Humphrey u. a., Scientific Reports 2020: https://www.nature.com/articles/s41598-020-73426-0
- Futter, Wasser und Toilette getrennt anbieten: AAFP/ISFM Feline Environmental Needs Guidelines 2013: https://doi.org/10.1177/1098612X13477537
- Stellreflex ab drei bis vier Wochen, sicher mit sechs bis neun Wochen: https://en.wikipedia.org/wiki/Cat_righting_reflex
- Schlaf 12 bis 16 Stunden, Kätzchen bis zu 20: https://www.petmd.com/cat/behavior/why-do-cats-sleep-so-much · Nickerchen und Dämmerungsaktivität: https://www.sleepfoundation.org/animals-and-sleep/how-much-do-cats-sleep
