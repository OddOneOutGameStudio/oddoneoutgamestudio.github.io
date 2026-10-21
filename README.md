# Odd One Out — portfolio

Statyczna strona (HTML + CSS, bez builda) hostowana na GitHub Pages.

```
index.html                     strona główna: hero + ticker, lista gier („Select your game”), pitch deck, O nas, toolbox, kontakt
projects/dreamwell.html        01 DreamWell (praca inżynierska) — trailer z Drive, trzy światy, systemy, deck, showcase reel, role
projects/pirate-cove.html      02 Pirate Cove (6 week) — film z Drive, systemy, galeria
projects/szczury.html          03 Szczury (3D tower defense, Unity 6)
projects/bananas-era-shift.html 04 Banana's Era Shift (game jam, 2. miejsce)
projects/frontend.html         05 Sloth + 06 Halloween Escape Room (web, bez silnika) — media do uzupełnienia
projects/cats.html             07 Koty Julii (gra bez silnika) — media do uzupełnienia
assets/css/style.css           cały wygląd (kolory i fonty na górze, w :root); styl arcade: scanlines, glitch, pixelowe rogi
assets/js/main.js              rok w stopce, pętle wideo w kadrze, reveal przy scrollu, losowe glitche
assets/js/deck.js              odtwarzacz prezentacji (deck.json)
assets/img/                    kadry z gier (nazwa-sekunda.jpg), avatar zespołu, grafika Team 04
assets/video/                  pętle gameplayu (~1–2 MB, 720p, bez dźwięku) + dreamwell-showreel.mp4 (6 MB)
assets/decks/bunker/           pitch deck DreamWell (z pptx_to_deck.py)
```

## Cache przeglądarki

GitHub Pages każe przeglądarkom trzymać pliki przez 10 minut. Po zmianie `style.css` albo plików
w `assets/js/` podbij numer `?v=` przy ich linkach we wszystkich plikach `.html` (np. `?v=4` → `?v=5`),
żeby odwiedzający od razu dostali nową wersję.

## Teksty

Do uzupełnienia (szukaj `[` w `index.html`): e-mail studia, link LinkedIn, link itch.io. Poza tym treści są gotowe — nazwy gier
i opisy w `projects/*.html` można dowolnie przeredagować.

## Efekty i animacje

- **Glitch** — każdy element z klasą `glitch` i atrybutem `data-text="ten sam tekst"` co jakiś czas (i po najechaniu) dostaje
  rozwarstwienie RGB (różowy/niebieski). Działa na nagłówkach i tytułach gier.
- **Reveal** — elementy z klasą `rv` wjeżdżają przy scrollu (`rv-d1`…`rv-d3` = opóźnienie w kaskadzie).
- **Pętle wideo** — `<video class="clip" autoplay muted loop playsinline>` grają tylko, gdy są na ekranie.
- **CRT** — ramka `.crt` wokół `.media` (poświata + winieta), `.media__badge--rec` = migający znaczek REC.
- **Zamknięte poziomy** — karta `.lvl--locked` dostaje naklejkę LOCKED i przyciemniony kadr (dla gier bez mediów).
- Wszystko wyłącza się przy `prefers-reduced-motion`.

## Jak zrobić pętlę gameplayu z nagrania

```bash
ffmpeg -ss 18 -t 12 -i nagranie.mp4 -vf "scale=-2:720" -c:v libx264 -preset slow -crf 27 -pix_fmt yuv420p -movflags +faststart -an assets/video/nazwa-loop.mp4
ffmpeg -ss 20 -i nagranie.mp4 -frames:v 1 -vf "scale=1280:-2" -q:v 4 assets/img/nazwa-20.jpg
```

(`-ss` = od której sekundy, `-t` = ile sekund; plakat `poster=` do `<video>` to kadr z tej samej sceny).

## Media

Puste miejsca na media to `div`-y z klasą `media--empty` i podpisem w `data-label`.
Żeby wstawić prawdziwy plik, zamień taki `div` na jeden z wariantów (przykłady są też w komentarzach w HTML):

**Obraz**

```html
<div class="media media--16x9">
  <img src="assets/img/nazwa.jpg" alt="Co widać na obrazku" loading="lazy">
</div>
```

**Wideo z kontrolkami (showreel, trailer)**

```html
<div class="media media--16x9">
  <video src="assets/video/showreel.mp4" poster="assets/img/showreel-poster.jpg"
         controls playsinline preload="metadata"></video>
</div>
```

**Pętla gameplayu zamiast GIF-a** (bez dźwięku, gra tylko gdy jest na ekranie)

```html
<div class="media media--16x10 media--flat">
  <video class="clip" src="assets/video/petla.mp4" autoplay muted loop playsinline></video>
</div>
```

**YouTube**

```html
<div class="media media--16x9">
  <iframe src="https://www.youtube-nocookie.com/embed/ID_FILMU" title="Tytuł"
          allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe>
</div>
```

Proporcje: `media--16x9`, `media--16x10`, `media--4x3`, `media--4x5`.

### Rozmiary plików

GitHub odrzuca pliki powyżej 100 MB, a duże pliki spowalniają stronę. Dobrze się sprawdza:

- pętle gameplayu: MP4 (H.264), 5–15 s, 720p, bez dźwięku, do ~5 MB,
- showreel / trailer: dłuższe filmy najlepiej na YouTube i osadzić iframe,
- obrazy: JPG/WebP, szerokość ~1920 px dla pełnej szerokości, ~1200 px dla kafelków.

## Prezentacja (pitch deck) z animowanymi GIF-ami

`tools/pptx_to_deck.py` zamienia plik `.pptx` w pokaz slajdów na stronę: obrazki zostają
dokładnie tam, gdzie były, tekst zostaje tekstem, a GIF-y dalej się ruszają (duże nagrania
zamieniane są na MP4, duże przezroczyste GIF-y na animowane WebP, żeby strona się nie dławiła).

Potrzebne: Python 3 z Pillow (`pip install pillow`) i `ffmpeg` (`brew install ffmpeg`).

```bash
python3 tools/pptx_to_deck.py ~/Downloads/prezentacja.pptx assets/decks/nazwa-gry
```

Potem na stronie projektu:

```html
<div class="deck" data-deck="../assets/decks/nazwa-gry/deck.json" aria-label="Pitch deck"></div>
<script src="../assets/js/deck.js" defer></script>
```

**Filmik na slajdzie** — dodaj `--video NUMER_SLAJDU=plik_lub_link`, np.:

```bash
python3 tools/pptx_to_deck.py prezentacja.pptx assets/decks/nazwa-gry --video 11=~/Downloads/gameplay.mp4
python3 tools/pptx_to_deck.py prezentacja.pptx assets/decks/nazwa-gry --video 11=https://youtu.be/ID_FILMU
```

**Slajd jako ekran monitora** — `--fit-frame`: jeśli na wierzchu slajdu leży ramka większa
niż slajd (z przezroczystym „ekranem” w środku), treść zostanie wpasowana w ekran, a całość
przybliżona tak, że ekran wypełnia slajd i z ramki zostaje tylko wąski pasek przy krawędziach
(szerokość paska: `FRAME_BEZEL` w skrypcie).

**Usuwanie tekstu** — `--remove-text REGEX` pomija każdy akapit pasujący do wzorca, np. imiona
i numery indeksów:

```bash
python3 tools/pptx_to_deck.py ~/Downloads/2526L_Pitch_Team04.pptx assets/decks/bunker --fit-frame --remove-text '^S\d{5} ' --remove-text '^Team 04$'
```

Plik `.mp4` zostanie skopiowany obok prezentacji; link do YouTube lub Google Drive zostanie osadzony
(plik na Drive musi być udostępniony „każdy z linkiem”). Obrazek na slajdzie, który w PowerPoincie
linkował do filmu, bez tej opcji pokazuje przycisk ▶ otwierający link w nowej karcie.

## Nowa gra

Skopiuj jedną z podstron `projects/*.html` (np. `szczury.html`) jako `projects/nazwa-gry.html`, uzupełnij treść
i dodaj kartę `.lvl` w `index.html` (sekcja „Select your game”) oraz wpis w tickerze.

## Podgląd lokalnie

```bash
python3 -m http.server 8000
```

i otwórz http://localhost:8000.
