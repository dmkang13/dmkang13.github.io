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

Drop supported image files into a topic folder. The deck lists the files that
are actually present and sorts their names naturally, so numbering can contain
gaps and extensions can be mixed. It accepts `.jpg`, `.jpeg`, `.png`, `.webp`,
`.avif`, and `.svg`. See
`photos/life-story/README.md` for the complete folder map.
