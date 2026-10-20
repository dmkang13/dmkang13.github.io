# Dale Kang — Personal site

A lightweight, responsive portfolio built with semantic HTML, CSS, and a small amount of vanilla JavaScript.

## Run locally

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Classical music talk + Mentimeter

Edit `classical-music-content.md` to change the presentation text slide by
slide. Each `## slide-N` section contains named fields for its headings,
prompts, track labels, era character, and Mentimeter copy. YouTube URLs and
clip start/end seconds also live in this file. Add presenter guidance under
each slide's `speaker-notes` field. Presenter notes stay in the Markdown and do
not appear in the presentation interface or its HTML. The current visible
Markdown content is also mirrored in the HTML so the deck has a complete
fallback if the content file cannot be loaded. No build or compile step is
required—reload the page after editing the Markdown.

Open `classical-music.html` and select **Menti setup** in the header. Add the
join code, audience participation link, and optional presenter/results link
from Mentimeter's Share menu. The settings stay in that browser and update the
persistent QR code in the presentation, giving anyone who gets disconnected a
quick way back. Audience-response buttons are intentionally omitted from the
slides. Press `M` at any time to reopen the presenter setup screen.

## Life Story photos

> **Privacy note:** The Life Story contains personal information and is not
> intended for the public internet. Its link has been removed from the main
> website. Its photos remain available locally but are ignored by Git so they
> are not included in future commits or public deployments. The presentation
> code remains as a reusable skeleton for private or local use.

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
