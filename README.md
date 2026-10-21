# Odd One Out — portfolio

Statyczna strona (HTML + CSS, bez builda) hostowana na GitHub Pages.

```
index.html              strona główna (showreel, gry, jamy, kontakt)
studio.html             o studiu, zespół, wyróżnienia
projects/project-01.html  szablon case study jednej gry
assets/css/style.css    cały wygląd (kolory na górze, w :root)
assets/js/main.js       rok w stopce + odtwarzanie pętli wideo
assets/img/             obrazy (screeny, key arty, zdjęcia)
assets/video/           filmiki (showreel, trailery, pętle gameplayu)
```

## Teksty

Wszystko w `[NAWIASACH]` to miejsce do uzupełnienia — wystarczy wyszukać `[` w plikach `.html`.

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

**Ramka monitora na całym slajdzie** — `--fit-frame`: jeśli na wierzchu slajdu leży ramka większa
niż slajd (z przezroczystym „ekranem” w środku), zostanie dopasowana do slajdu, a reszta treści
zmniejszona tak, żeby zmieściła się w ekranie.

**Usuwanie tekstu** — `--remove-text REGEX` pomija każdy akapit pasujący do wzorca, np. imiona
i numery indeksów:

```bash
python3 tools/pptx_to_deck.py ~/Downloads/2526L_Pitch_Team04.pptx assets/decks/bunker --fit-frame --remove-text '^S\d{5} '
```

Plik `.mp4` zostanie skopiowany obok prezentacji; link do YouTube lub Google Drive zostanie osadzony
(plik na Drive musi być udostępniony „każdy z linkiem”). Obrazek na slajdzie, który w PowerPoincie
linkował do filmu, bez tej opcji pokazuje przycisk ▶ otwierający link w nowej karcie.

## Nowa gra

Skopiuj `projects/project-01.html` jako `projects/nazwa-gry.html`, uzupełnij treść i podlinkuj kafelek w `index.html`.

## Podgląd lokalnie

```bash
python3 -m http.server 8000
```

i otwórz http://localhost:8000.
