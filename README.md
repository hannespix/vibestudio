# Vibe Studio · Vibecoding

Eine kurze Reveal.js-Präsentation von Hannes Pix (dreizehn Folien, ungefähr sieben Minuten) und der zugehörige Browser-Editor **Vibe Studio**: Texte, Logos, Medien, Schriften, Hintergrundbewegung, Anordnung. Alles läuft ohne Server, Build-Tool oder Internet direkt im Browser.

**Live:** https://hannespix.github.io/vibestudio/ · **Zum Herunterladen:** https://hannespix.github.io/vibestudio/Vibecoding.html

## Repo-Aufbau

| Pfad | Inhalt |
| --- | --- |
| `index.html` | Folien, Sprechernotizen und Einbindung aller Skripte (Entwicklerfassung, benötigt die Nachbardateien) |
| `style.css` | Layout der Folien |
| `deck.js` | Navigation, Tastatur, automatischer Durchlauf |
| `editor.js` / `editor.css` | Textbearbeitung, Griffe, Drehung, Rückgängig, HTML-Export |
| `arrange.js` / `arrange.css` | Fanglinien, Raster, Ausrichten am Folienrand, Inspektor-Tab „Objekt“ |
| `design.js` / `design.css` | Design-Dialog: Größe, Laufweite, Zeilenabstand, Schnitt und Versalien je Feldtyp; individuelle Textmaße im Objekt-Tab |
| `studio.js` / `studio.css` | Folienleiste, Eigenschaften, Hintergründe, Übergänge |
| `fonts.js` / `fonts.css` | Schriftvererbung, Vorschau, eigene Schriftdateien |
| `logos.js`, `media.js`, `motion.js` | Logos, Medienbestand, Hintergrundbewegung |
| `assets/` | Reveal.js, DM Sans, Motive und Screenshots |
| `build.mjs` | Baut die Ein-Datei-Fassung nach `dist/` |
| `tools/smoke-test.mjs` | Headless-Prüfung in Chromium (Playwright) |
| `tools/scene-network.html`, `tools/scene-dawn.html`, `tools/render-scene.mjs` | Generatoren und Renderer für die prozeduralen Motive (Netzknoten der Danke-Folie, Morgenlicht der Ermöglichen-Folie) |
| `.github/workflows/` | `ci.yml` prüft Pull Requests, `pages.yml` veröffentlicht `main` auf GitHub Pages |
| `demo/pflanzenlernen.html` | Kleines zusätzliches Übungsbeispiel, nicht Teil des Decks |
| `QUELLEN.md` | Quellen und Bildnachweise |

## Entwickeln und veröffentlichen

- **Lokal öffnen:** `index.html` direkt im Browser öffnen, oder im Projektordner einen kleinen Server starten (`python3 -m http.server 8000` oder `npx serve`), damit Schriften und Medien sicher geladen werden.
- **Ein-Datei-Fassung bauen:** `node build.mjs` schreibt `dist/index.html` und `dist/Vibecoding.html`. Darin sind alle Stylesheets, Skripte, Schriften und Bilder als Data-URIs eingebettet. Nur diese Fassung erzeugt beim **HTML speichern** eine vollständig eigenständige Datei; die Entwicklerfassung verweist auf ihre Nachbardateien.
- **Prüfen:** `node build.mjs && node tools/smoke-test.mjs` (einmalig `npm install --no-save playwright && npx playwright install chromium`). Der Test öffnet Quell- und Ein-Datei-Fassung, prüft Schriften, Drehung, Ausrichtung, Fanglinien, Raster, Export und Konsolenfehler und legt Screenshots unter `dist/smoke/` ab.
- **Arbeitsweise:** Änderungen entstehen auf einem Arbeits-Branch, gehen als Pull Request nach `main` und werden nach bestandener Prüfung gemergt. Jeder Stand auf `main` baut die Ein-Datei-Fassung über GitHub Actions und veröffentlicht sie auf GitHub Pages (`pages.yml`). Der Workflow lässt sich unter „Actions“ auch von Hand starten.

## Öffnen

`Vibecoding.html` (aus `dist/` oder von der Pages-Adresse oben) ist die komplette Präsentation in einer Datei. Herunterladen und mit Chrome, Edge oder Firefox öffnen. Sie benötigt weder Internet noch Installation.

Im Repo lässt sich auch `index.html` direkt öffnen. Den Ordner dabei vollständig behalten, damit Bilder, Schriften und Reveal.js zusammenbleiben.

## Vorführen

- Pfeiltasten oder Leertaste: nächste / vorherige Folie
- F oder der Vollbild-Knopf unten rechts: Vollbild an und aus
- Esc oder O: Folienübersicht
- N: kurze Sprechernotizen zur aktuellen Folie
- E: Bearbeiten / Präsentieren
- M: Hintergrundbewegung pausieren / fortsetzen
- P: automatischer Durchlauf
- Home: zum Anfang

Die Steuerung unten rechts erscheint bei Mausbewegung. Die Titel bleiben statisch. Nur die Kapitelhintergründe bewegen sich. Die Kamerafahrt läuft direkt im Browser mit kontinuierlicher Subpixel-Bewegung. Die Grundeinstellung ist bewusst kräftig: deutlicher Ken-Burns-Zoom mit leichter Drehung, sichtbares weiches Licht, Staub und Körnung, ein 28-Sekunden-Zyklus. Wer es ruhiger mag, wählt im Editor das Preset **Ruhig · warm** oder senkt die Effektstärke. Wasserringe verformen sich leicht; Licht, Staub und Körnung bleiben sehr dezent. Es werden keine Einzelbilder mit Zufallszittern versetzt. Die Systemeinstellung für reduzierte Bewegung wird berücksichtigt.

## Direkt in der HTML bearbeiten

1. `Vibecoding.html` herunterladen und im Browser öffnen.
2. Unten rechts **Bearbeiten** anklicken oder **E** drücken.
3. Einen Text anklicken und direkt schreiben. Größe, Farbe, Fett und Ausrichtung stehen oben.
4. **＋ Text** legt ein neues Textfeld auf der aktuellen Folie an.
5. Das ausgewählte Feld am Griff **Verschieben** ziehen; dabei rastet es an Fanglinien ein (siehe unten). Mit dem Griff rechts unten lässt sich seine Breite ändern, mit dem runden Griff darüber wird es gedreht. Der Verschiebegriff unterstützt auch Pfeiltasten; mit Umschalt geht es in 10-Pixel-Schritten. **Ausrichtung** bietet Links, Mitte, Rechts und **Blocksatz**.
6. Über **Logo** ein globales PNG, JPG, WebP oder SVG auswählen. Größe, Position, Originalfarben, einfarbig Hell/Dunkel und eine helle Unterlage sind einstellbar. Ohne Logo erscheint das Platzhalterfeld nur beim Bearbeiten. Pro Folie sind eigene Einstellungen möglich (siehe unten).
7. **HTML speichern** lädt eine vollständige, erneut bearbeitbare Datei mit allen Änderungen, Bildern und Logo herunter. Alternativ: Strg/Cmd + S im Bearbeitungsmodus.
8. **Präsentieren** blendet die Werkzeuge aus. Folienwechsel erfolgt mit den Pfeilen unten rechts; im Bearbeitungsmodus funktionieren auch Bild auf / Bild ab außerhalb eines Textfelds.

Der Browser überschreibt die ursprüngliche Datei nicht automatisch. Ein lokaler Entwurf wird, soweit verfügbar, im Browser zwischengespeichert. Für ein dauerhaftes, übertragbares Ergebnis immer **HTML speichern** verwenden. Die neue Datei öffnet im Präsentationsmodus. Rückgängig/Wiederholen steht für Text, Position, Format und Logo in der aktuellen Sitzung zur Verfügung. Bei aktivem Textcursor betrifft Strg/Cmd + Z die Texteingabe; die Pfeilknöpfe oben betreffen die Bearbeitungsschritte.

Eingefügter Text wird ohne fremde Formatierung übernommen. Die Schrift in Screenshots ist Teil des Bilds und lässt sich nicht direkt ändern. Zusätzliche Texte können darübergelegt werden. Der Editor ist für Desktop-Browser gestaltet, passt sich aber kleineren Fenstern an: Unter 1100 px Breite werden Folienleiste und Eigenschaften zu Schubladen, die sich über **☰ Folien** und **⚙ Eigenschaften** in der Werkzeugleiste ein- und ausblenden lassen; ein Tipp auf die Folie schließt sie wieder. Die Werkzeugleiste bricht bei Bedarf um, die Folie nutzt die volle Breite. Auf Tablets funktionieren Verschieben, Breite und Drehung über die Griffe auch per Touch. Reveals automatischer Scroll-Modus für schmale Bildschirme ist abgeschaltet: Er baut das Folien-DOM beim Umschalten neu auf und würde Editor- und Animationszustand verwerfen. Auch auf dem Smartphone bleibt die Präsentation deshalb eine skalierte Folie mit Wischnavigation.

## Vibe Studio: Folien, Medien und Hintergründe

Im Bearbeitungsmodus stehen links die Folien und rechts die Eigenschaften. Die Präsentation selbst bleibt unverändert groß: Der Editor verkleinert nur die Arbeitsansicht.

### Folien verwalten

- Links das Layout wählen: **Titelfolie**, **Textfolie** oder **Leere Folie**. Mit **+** direkt nach der aktuellen Folie einfügen.
- **Dupl.** dupliziert die aktuelle Folie inklusive ihrer Texte, Formatierungen, Bilder, Hintergrund-, Übergangs- und individuellen Logo-Einstellungen.
- **Entf.** entfernt die aktuelle Folie. Mindestens eine Folie bleibt erhalten. Mit **Rückgängig** lässt sich die Entfernung zurücknehmen.
- Folienvorschaubilder an eine andere Position ziehen. Alternativ die Pfeile **↑ / ↓** verwenden.
- Über den Namen rechts lässt sich eine Folie für die Übersicht benennen; der Titel im eigentlichen Bild bleibt separat editierbar.

### Hintergrund ändern

1. Rechts **Hintergrund** öffnen.
2. **Datei wählen** importiert ein Bild oder Video. **Medien wählen** öffnet den vorhandenen Bestand.
3. Bildfüllung (**Fläche füllen**, **ganzes Motiv**, **Strecken**), horizontalen/vertikalen Ausschnitt und Abdunklung einstellen.
4. Unter **Background Animation** Bewegung, Rotation, Tempo und Materialeffekte einstellen. **Bewegung hier abspielen** zeigt sie direkt im Editor.
5. Eine Flächenfarbe kann unter dem Bild liegen oder über **Nur Flächenfarbe verwenden** zum alleinigen Hintergrund werden. Die allgemeine Textfarbe der Folie lässt sich ebenfalls ändern; einzelne speziell formatierte Texte behalten ihre eigene Farbe.
6. **Original-Hintergrund wiederherstellen** setzt diese Änderungen zurück.
7. Unten im Tab unter **Bühne · Rand bei Breitbild** die Farbe der Fläche außerhalb der 16:9-Folie wählen: **Schwarz** (Standard), **Weiß**, **Anthrazit** oder eine eigene Farbe. **Pipette** nimmt in Chrome und Edge jede Farbe vom Bildschirm auf, in anderen Browsern die Farbe des Hintergrundbilds an der angeklickten Stelle; **Vom Bildrand** mittelt die Ränder des Hintergrundbilds der aktuellen Folie, damit die Balken nahtlos anschließen. Unter **Gilt für** lässt sich die Bühne wie Logo und Bewegung wahlweise als Standard für alle Folien oder nur für die aktuelle Folie setzen; beim Folienwechsel blendet die Randfarbe weich über, und **Globale Bühne übernehmen** entfernt eine eigene Folienfarbe wieder. Sie erscheint auf breiten oder hohen Bildschirmen und im Vollbild neben der Folie, gilt für die ganze Präsentation, wird mitgespeichert und ist im Editor um die Arbeitsfläche sichtbar.

Videos laufen stumm in Schleife. Nur das Video auf der aktuellen Folie spielt; beim Bearbeiten bleibt es stehen, bis **Bewegung hier abspielen** aktiviert wird. Bei aktivierter Bewegungspause bleibt es ebenfalls stehen. Das gilt auch für frei eingefügte Videos.

### Bewegung und Material

Unter **Gilt für** lässt sich wie beim Logo wählen, ob die Bewegungswerte **nur für diese Folie** oder als **Standard für alle Folien** gelten. Folien ohne eigene Werte folgen dem Standard; motivabhängige Voreinstellungen wie die Wellen der Wasserfolie bleiben, solange man sie nicht überschreibt. Hat eine Folie eigene Werte, zeigt der Inspektor das an, und **Globale Bewegung übernehmen** löscht sie wieder. Bild, Flächenfarbe und Ausschnitt gelten immer je Folie. Alle Werte werden beim Duplizieren, Rückgängigmachen und HTML-Export mitgenommen.

- **Hintergrundeffekte aktiv** schaltet die erzeugten Effekte ein oder aus. Ein Video behält seine eigene Bewegung.
- **Effektstärke gesamt** dosiert Kamera, Rotation, Jiggle, Wellen, Licht, Staub, Körnung und Farbverstärkung gemeinsam. 0 ergibt einen unveränderten Hintergrund; native Videos laufen weiter.
- **Bewegungsstärke / Ken Burns** steuert Zoom und Kamerafahrt. **Rotation** ergänzt langsame Drehungen um das Motiv.
- **Geschwindigkeit** reicht von 0,25× bis 2×. Sie steuert erzeugte Bewegungen und die Wiedergabegeschwindigkeit von Hintergrundvideos.
- **Handycam / Jiggle** ergänzt weiche, leicht unregelmäßige Kamerabewegungen. 0 = aus; geringe Werte wirken ruhig und handgeführt. Es gibt keine zufälligen Sprünge zwischen Bildern.
- **Wellenbewegung** verformt den unteren Bildbereich fließend. Das passt besonders gut zu den Wasserringen; bei anderen Motiven nach Geschmack nutzen. Der Effekt benötigt WebGL; ohne WebGL bleibt das Bild mit den übrigen Effekten sichtbar.
- **Weiches Licht / DOF** fügt sanft wandernde, unscharfe Lichtflecken hinzu. **Schwebender Staub** ergänzt wenige weiche Partikel. Das ist eine gestalterische Lichtsimulation, keine aus dem Motiv berechnete Tiefenkarte.
- **Material / Körnung** ergänzt eine feine, ruhige Textur ohne flackerndes Rauschen. **Lebendigkeit / Farbe** erhöht die Farbsättigung behutsam.
- Presets: **Ruhig · warm**, **Lebendig · organisch** und **Handycam · weich**. Die Einzelwerte bleiben anschließend frei einstellbar.
- Unter **Zyklus & Zurücksetzen** lässt sich die Dauer eines ganzen Hin- und Rückwegs bei Tempo 1× verändern.

Die Vorschau wird beim Folienwechsel und beim Verlassen des Editors beendet. In der Präsentation laufen nur die Medien der aktuellen Folie. **M** pausiert Bildbewegung, Effekte und Videos gemeinsam. Titel bleiben immer unbewegt.

### Schriften: global, je Feldtyp und individuell

Die aktuelle **DM Sans** bleibt unverändert der Standard und ist eingebettet. Zusätzlich stehen Sans Serif, Serif und Monospace als Systemschriften zur Auswahl. Ihre genaue Darstellung hängt vom Gerät ab.

Lizenzierte Hausschriften wie **BaWue Sans** und **BaWue Serif** (Luzi Type, lizenziert für das Land Baden-Württemberg) sind aus urheberrechtlichen Gründen nicht im öffentlichen Repo und nicht in der veröffentlichten Fassung enthalten. Wer die Schriftdateien aus dem eigenen Lizenzbestand hat, lädt sie im Schriftenfenster über **Eigene Schriften hochladen** ein (WOFF2 aus dem Web-Paket genügt). Sie werden dann in die eigene exportierte HTML eingebettet und stehen in allen Schriftauswahlen zur Verfügung.

1. Oben **Schriften** öffnen. **Standardschrift** legt die globale Schrift fest.
2. Unter **Je Feldtyp** kann man Kapitel-Titel, Überschriften, Untertitel, Fließtext/Prompts, Beschriftungen und freie Textfelder getrennt einstellen. **Global übernehmen** folgt wieder der Standardschrift. Diese Einstellungen gelten über alle Folien hinweg.
3. Einen Text auf der Folie anklicken und oben im Feld **Schrift** individuell formatieren. **Vom Feldtyp übernehmen** entfernt diese Ausnahme. Im Schriftenfenster lässt sich auch der Feldtyp des ausgewählten Textes ändern, beispielsweise ein freies Textfeld zum Titel machen. Der Feldtyp bestimmt hier die Schriftfamilie; Größe, Farbe und Position bleiben separat.
4. Es gilt immer: **individuelle Schrift → Schrift des Feldtyps → globale Schrift**. Die darunterliegende Einstellung bleibt erhalten und wird wieder wirksam, sobald eine Ausnahme zurückgesetzt wird.

**Eigene Schriften:** Im Schriftenfenster auf **Eigene Schriften hochladen** klicken oder Dateien auf das gestrichelte Feld ziehen. WOFF, WOFF2, TTF und OTF sind möglich, mehrere Dateien zugleich, maximal 15 MB je Datei. Der Browser prüft die Schrift vor der Aufnahme. Nicht lesbare Dateien verändern die bisherigen Einstellungen nicht.

Jede Datei erscheint als eigene Auswahl. Die Schriftübersicht rechts zeigt eine Vorschau; ein Klick dort ändert nur die Vorschau. Zum Verwenden die Schrift links global, für einen Feldtyp oder für den ausgewählten Text zuweisen. Identische Dateien werden wiederverwendet.

Hochgeladene Schriften werden vollständig in **HTML speichern** eingebettet. Eine Installation auf dem Präsentationsrechner oder eine Internetverbindung ist nicht erforderlich. Schriften funktionieren auch auf gebogenen Texten und bleiben beim Duplizieren und erneuten Öffnen erhalten. Rückgängig/Wiederholen betrifft die Zuweisungen; importierte Schriftdateien bleiben in der Übersicht verfügbar. Die Studio-Bedienelemente behalten ihre bisherige Schrift.

### Anordnen: Fanglinien, Raster, Ausrichten und Drehung

Alle Werte gelten in Folienpixeln (1600 × 900) und werden mit Rückgängig, Duplizieren und HTML-Export mitgenommen. Sie funktionieren für vorhandene Texte, neue Textfelder und frei eingefügte Bilder oder Videos.

- **Fanglinien:** Beim Ziehen am Griff **Verschieben** rasten Kanten und Mitte des Felds an der Folienmitte, an den Folienrändern (bei Inhaltsfolien am inneren Rand), an anderen Texten, Bildern und am Logo ein. Eine rosa Linie zeigt die getroffene Kante. **Alt** gedrückt halten schaltet das Einrasten beim Ziehen vorübergehend aus; der Knopf **Fanglinien** oben schaltet es ganz ab.
- **Raster:** **Raster** oben zeigt ein Gitter über der Folie, an dessen Linien Kanten einrasten. Die Rastergröße (20 bis 100 px) steht im Inspektor unter **Objekt**. Fanglinien haben Vorrang vor dem Raster.
- **Ausrichten:** Die sechs Symbole in der Formatzeile setzen das Feld linksbündig, zentriert oder rechtsbündig sowie oben, mittig oder unten auf die Folie. Inhaltsfolien nutzen dabei ihren inneren Rand, Kapitelfolien die Folienkante.
- **Drehen:** Der runde Griff über dem Feld dreht es per Ziehen um seine Mitte. Umschalt rastet in 15°-Schritten; nahe 0°, 90° und 180° rastet die Drehung von selbst ein, mit Alt nicht. Doppelklick auf den Griff oder **0°** stellt gerade. Pfeiltasten auf dem fokussierten Griff drehen um 1° (Umschalt: 15°). Genaue Werte stehen im Feld **Drehung** oben und im Inspektor.
- **Objekt-Tab:** Rechts unter **Objekt** lassen sich X, Y, Breite und Drehung als Zahl eingeben, die Ausrichtungsknöpfe erneut aufrufen sowie Fanglinien, Raster und Rastergröße einstellen. Diese Einstellungen merkt sich der Browser, sie gehören nicht zur Datei.
- **Blocksatz:** Unter **Ausrichtung** steht neben Links, Mitte und Rechts auch Blocksatz. Blocksatz aktiviert automatische Silbentrennung (deutsch), damit die Zeilen ruhig bleiben.

### Design: Größen, Laufweite und Zeilenabstand

**Design** oben öffnet eine Tabelle mit einer Zeile **Global** und je einer Zeile pro Feldtyp (Kapitel-Titel, Überschriften, Untertitel, Fließtext & Prompts, Beschriftungen, freie Textfelder). Fünf Maße stehen zur Verfügung:

- **Größe** in Prozent der gestalteten Vorlage. 100 % ist der Ausgangszustand; 120 % vergrößert alle Texte des Feldtyps im Verhältnis, die Hierarchie bleibt erhalten. Die Spalte **Beispiel** zeigt für den Feldtyp eine typische Größe vor und nach der Skalierung.
- **Laufweite** in em, zusätzlich zur Vorlage. 0,05 em ergeben bei 22 px etwa 1 px mehr Buchstabenabstand; negative Werte verdichten.
- **Zeilenabstand** in Prozent der Vorlage.
- **Schnitt** (Leicht bis Fett) und **Versalien** (Versalien, Kleinbuchstaben, Kapitälchen, wie geschrieben).

Es gilt dieselbe Vererbung wie bei den Schriften: **einzelner Text → Feldtyp → global → Vorlage**. Leere Felder bei einem Feldtyp übernehmen die globale Zeile. Einzeln formatierte Texte behalten ihre eigenen Werte: Größe, Farbe und Fett stehen oben in der Formatzeile; **Laufweite** (in Folienpixeln), **Zeilenabstand** (in Prozent der Schriftgröße) und **Versalien** für den ausgewählten Text stehen rechts im Tab **Objekt** unter **Text**, mit einem Knopf zurück zum Feldtyp. Alle Werte werden mit Rückgängig, Duplizieren und HTML-Export mitgenommen.

### Titel als Bogen

Text anklicken, dann oben **Bogen** einstellen. 0 bedeutet gerade; positive Werte wölben nach oben, negative nach unten. **Gerade** setzt die Biegung direkt zurück. So lässt sich der Titel an die runden Motive anlegen, ohne dass er sich mit dem Hintergrund bewegt.

Der Bogen gilt pro Textfeld und funktioniert auch für neu eingefügte Texte. Breite, Schriftgröße, Farbe und Position bleiben bearbeitbar. Während man direkt in den Text schreibt, erscheint er für die Eingabe gerade; nach dem Verlassen des Felds wird der Bogen wieder angezeigt. Mehrzeilige Texte werden im Bogen als eine Zeile dargestellt. Bei sehr langen Texten wird die Schrift auf die verfügbare Breite eingepasst. Biegung und Text werden mit der Folie dupliziert und in der HTML gespeichert.

### Logos: global und pro Folie

- **Logo** oben öffnet den globalen Standard. Alle Folien übernehmen ihn zunächst.
- Rechts unter **Folie → Logo dieser Folie** oder durch Klicken auf das Logo lassen sich einzelne Folien anpassen. Unter **Gilt für** kann man jederzeit zwischen globalem Standard und aktueller Folie wechseln.
- **Individuell anpassen** übernimmt den aktuellen Stand als eigene Kopie. Danach sind ein anderes Bild, die Darstellung **Originalfarben / Hell / Dunkel**, Größe, Position und helle Unterlage unabhängig einstellbar. Hell und Dunkel färben das ganze Bild einfarbig; für Logos mit Hintergrund am besten eine transparente PNG- oder SVG-Datei verwenden.
- **Bild auswählen** lädt ein neues Logo; **Aus Medien wählen** verwendet ein bereits vorhandenes Bild. Für jede Folie ist ein anderes Logo möglich.
- **X / Y** bestimmen die linke obere Ecke, **Breite / Höhe** den frei einstellbaren Rahmen in Folienpixeln (1600 × 900). Das Bild wird proportional in diesen Rahmen eingepasst und nicht verzerrt.
- Direkt auf der Folie das Logo ziehen; mit dem Griff rechts unten die Größe ändern. **Ziehen betrifft immer nur die aktuelle Folie** und erzeugt bei Bedarf eine individuelle Einstellung. Die globalen Werte stellt man im Dialog ein.
- **Globales Logo übernehmen** entfernt die individuelle Abweichung. **Logo ausblenden** versteckt es nur auf dieser Folie. Der globale Standard bleibt erhalten.
- Individuelle Logos bleiben beim Duplizieren, Umsortieren, Rückgängigmachen und HTML-Export erhalten. In den Folienminiaturen sieht man die tatsächliche Variante.

### Medienübersicht

**Medien** oben zeigt vorhandene Hintergrundmotive, Screenshots, importierte Bilder/Videos und alle eigenen Logos. Suche und Filter helfen beim Wiederfinden.

- **Dateien hinzufügen** oder Dateien in die Übersicht ziehen; Mehrfachauswahl ist möglich.
- Ein Medium auswählen und als Hintergrund verwenden, frei auf die Folie einfügen oder als globales Logo einsetzen (Bilder).
- Frei eingefügte Bilder und Videos lassen sich auswählen, am Griff verschieben und in der Breite skalieren. Das Seitenverhältnis bleibt erhalten.
- **Datei speichern** lädt das ausgewählte Medium separat herunter.
- Bereits identische Dateien werden wiederverwendet. Importierte Medien bleiben im Bestand, auch wenn ein Bearbeitungsschritt rückgängig gemacht wird.

Die Dateiauswahl ist nicht nach Endungen eingeschränkt. Der Browser prüft, ob er die Datei dekodieren kann. Übliche Bildformate sind JPG, PNG, WebP, GIF, SVG, AVIF und BMP; übliche Videoformate MP4, WebM und OGV. Weitere Formate hängen vom Browser und vom enthaltenen Codec ab. Nicht darstellbare Dateien ersetzen den bisherigen Hintergrund nicht. PSD, AI, Office-Dateien und nicht unterstützte Foto-/Videoformate bitte vorher in ein kompatibles Bild oder Video exportieren. Maximal 100 MB je Datei. Fotos mit mehr als 3200 px auf der langen Seite (JPG, PNG, BMP) werden beim Import auf 3200 px verkleinert: Die Folie ist 1600 × 900 px groß, ein 12-Megapixel-Handyfoto kostet sonst nur Speicher, bremst den ersten Folienwechsel und bläht die exportierte HTML auf. Die Medienübersicht zeigt die ursprüngliche Größe mit an. GIF, APNG, WebP, AVIF und SVG bleiben unverändert; Transparenz und Animationen unterstützter Bilddateien bleiben erhalten; der direkte Logo-Upload erzeugt weiterhin ein kompaktes PNG.

### Übergänge, Zeit und Notizen

Rechts unter **Folie**: Überblenden, Schieben, Zoom, Konvex, Konkav oder kein Übergang. Die **Übergangsdauer** wird in Millisekunden angegeben. Die **Anzeigedauer** steuert den automatischen Durchlauf mit **P** und ist davon unabhängig. **Übergang & Timing auf alle** wendet diese drei Einstellungen auf alle Folien an.

Die Sprechernotizen können direkt im rechten Feld geändert werden. Während der Präsentation zeigt **N** die Notizen der aktuellen Folie. Zur Prüfung von Übergängen oder Videos **Präsentieren** anklicken.

Beim Überblenden bleibt die verlassene Folie bis zum Ende der Überblendung sichtbar und in Bewegung; erst danach wird sie unsichtbar geschaltet und ihre Animation pausiert. Verlassene Folien belegen so keinen Grafikspeicher mehr, was auf schwächeren Grafikkarten flackernde Kacheln beim Folienwechsel vermeidet. Die Hintergrundfotos der Nachbarfolien werden vorab dekodiert, damit der erste Wechsel auf eine neue Folie nicht stockt.

Die Hintergrundeffekte sind so gebaut, dass sie die Grafikkarte wenig belasten: Bild, Farbkraft-Filter und Körnung liegen in einer gemeinsamen animierten Ebene (`.motion-camera`) und werden zusammen gerastert. Lichtflecken und Staub sind einfache Verläufe ohne Filter und ohne Mischmodus. Damit braucht eine bewegte Folie keine Render-Oberflächen pro Bild, nur eine Bildebene und kleine Partikelebenen, die der Compositor allein über ihre Animationen führt.

### Speichern mit Medien

**HTML speichern** sichert die komplette Präsentation einschließlich Folienstruktur, importierter Medien und Schriften, Logos, Texten und Einstellungen in einer wieder bearbeitbaren Datei. Das Herunterladen kann bei großen Videos entsprechend länger dauern. Große Medien werden nicht im begrenzten Browser-Zwischenspeicher gesichert: In diesem Fall zeigt die Statuszeile ausdrücklich den Hinweis auf **HTML speichern**. Der Export funktioniert weiterhin.

Zum Bearbeiten und Exportieren die vollständige **Vibecoding.html** (Pages-Adresse oder `dist/`) verwenden. Die `index.html` im Repo benötigt ihre benachbarten Assets und dient als Entwicklerfassung.

## Inhalt

Der Schwerpunkt ist **LLM + Git als Grundlage für eigene Verwaltungsprojekte**. Die Präsentation führt zu einer konkreten Entscheidung: internes GitLab und – mit höherer Dringlichkeit – eine betreute Container- und Datenbankumgebung im LVM. Sie beschreibt ein vorgeschlagenes Zielbild, keine bereits bestätigte Infrastruktur oder Datenfreigabe.

Sechs Kapitelpaare, jeweils **Titelfolie → Inhaltsfolie**, mit knappen Aussagen und ausführlicheren Sprechernotizen, dazu eine **Danke-Folie** zum Abschluss:

1. **Vibecoding:** LLM/Agent entwickelt, Git hält Fortschritt fest.
2. **Festhalten:** Begrenzter Chatkontext versus versionierter Code und dokumentiertes Projektwissen.
3. **Frei bleiben:** Agent, Harness und unterstütztes Modell wechseln; am selben Repository weiterarbeiten.
4. **Bauen:** Auftrag, Branch, Ausprobieren, Review – an öffentlichen Claude-Code-/GitHub-Aufnahmen.
5. **Betreiben:** vorgeschlagene interne Architektur mit GitLab, Anwendungscontainern und Datenbankdienst.
6. **Ermöglichen:** Priorität für Container + Datenbank, internes GitLab als gemeinsame Grundlage, ein Pilot mit klarer Verantwortung.
7. **Danke:** Raum für Fragen, Ideen und nächste Schritte, vor einem Netz aus Knoten und Verbindungen auf einem Kreisbogen.

Git vergrößert kein Kontextfenster. Dauerhafte Ziele, Entscheidungen und nächste Schritte müssen als Dateien gesichert und in neuen Sitzungen gelesen werden. Die unterstützten Modelle und Anweisungsdateien unterscheiden sich nach Agent. Die Abbildung der Zielarchitektur ist bewusst vereinfacht; technische Auswahl, Zugriffe, Datenfreigaben und Betrieb müssen vereinbart werden.

Die beiden sichtbaren UI-Aufnahmen stammen aus einer veröffentlichten Produktdemo von Oktober 2025. Sie zeigen `acme/tea-sales`, **kein LVM-Projekt und keine LVM-Daten**. Die heutige Oberfläche kann anders aussehen. Der separate Screenshot-Download enthält außerdem unveränderte Originalbilder aus GitHub Docs. Details stehen in `QUELLEN.md`.

Die bisherige kleine Pflanzen-App bleibt als zusätzliches Übungsbeispiel unter `demo/pflanzenlernen.html` im Quellpaket enthalten. Sie ist kein Bestandteil des neuen roten Fadens.

## Anpassen

Texte und Sprechernotizen stehen in `index.html`. `style.css` enthält das Layout. `motion.js` animiert die Motive mit der Web Animations API und erzeugt die Wellen über einen WebGL-Shader. `editor.js` und `editor.css` enthalten die Textbearbeitung, die Griffe für Verschieben, Breite und Drehung sowie den HTML-Export. `arrange.js` / `arrange.css` liefern Fanglinien, Raster, Ausrichten und den Inspektor-Tab „Objekt“. `design.js` / `design.css` enthalten den Design-Dialog mit Größe, Laufweite, Zeilenabstand, Schnitt und Versalien je Feldtyp. `logos.js` verwaltet globale und individuelle Logos. `fonts.js` / `fonts.css` ergänzen Schriftvererbung, Vorschau und eingebettete Schriftdateien. `studio.js` / `studio.css` verwalten Folien und Eigenschaften; `media.js` enthält die Medienübersicht und den Dateiimport. Unter `assets/scene-*.jpg` liegen die fertig gesetzten Hintergrundmotive ohne Titel. `scene-network.jpg` (Danke-Folie) und `scene-dawn.jpg` (Ermöglichen) entstehen prozedural aus `tools/scene-network.html` und `tools/scene-dawn.html`; `node tools/render-scene.mjs network|dawn [seed] [scale] [quality]` rendert sie neu, andere Seeds ergeben andere Bilder. `deck.js` enthält Navigation und Tastatursteuerung. Die Bibliotheken und Bilder befinden sich unter `assets/`.

Die Ein-Datei-Fassung entsteht mit `node build.mjs` aus diesen Dateien; sie wird nicht im Repo gepflegt, sondern bei jedem Stand auf `main` automatisch gebaut und veröffentlicht.

## Quellen und Bildnachweise

Fachlicher Stand: 25.09.2026. Medienherkunft und offizielle Quellen: siehe `QUELLEN.md`.

- Visuelle Inspiration: https://www.reddit.com/r/unixporn/comments/1wps5f4/hyprland_tacit_i_ported_linux_to_my_snapdragon/ . Keine Videoausschnitte übernommen.
- Kapitelmotive: fünf eigens KI-generierte Bilder (Keramikteller, Holzquerschnitt, Wasserringe, Pflanzenquerschnitt im Mikroskopiestil und Planetenkante) sowie zwei prozedural erzeugte Motive, Morgenlicht über dem Horizont für „Ermöglichen“ und Netzknoten auf einem Kreisbogen für die Danke-Folie (`tools/scene-dawn.html`, `tools/scene-network.html`, keine KI-Bilder). Jede Kapitelfolie hat damit ein eigenes Motiv. Dekorative Motive, keine wissenschaftlichen Referenzaufnahmen. Bewegung erfolgt im Browser; Titel bleiben statisch.
- Reveal.js 5.2.1, MIT: `assets/reveal-LICENSE`, https://revealjs.com
- DM Sans, SIL Open Font License 1.1: `assets/font-LICENSE.txt`
- Technische Referenzen zu Editor-Funktionen: https://revealjs.com/transitions/ ; https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Formats/Containers ; https://developer.mozilla.org/en-US/docs/Web/API/FontFace ; https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
