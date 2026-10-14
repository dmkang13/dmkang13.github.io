# Dale Kang — Personal site

A lightweight, responsive portfolio built with semantic HTML, CSS, and a small amount of vanilla JavaScript.

## Run locally

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Life Story photos

`life-story.html` is a full-screen photo presentation with button, keyboard,
touch-swipe, slide overview, fullscreen, and photo-lightbox controls. Each major
topic has one folder in `photos/life-story/` and appears as a three-photo carousel.
The carousel advances in a fixed order every 30 seconds or on demand. Its Back
control restores the previously displayed set.

Name files consecutively (`1.jpg`, `2.jpg`, `3.jpg`, and so on). The deck also
accepts `.jpeg`, `.png`, `.webp`, and `.avif`. See
`photos/life-story/README.md` for the complete folder map.
