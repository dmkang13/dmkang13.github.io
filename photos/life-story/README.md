# Dale's Life Story photos

There is one folder for each main topic:

```text
baby-pictures/
texas/
music/
korea/
high-school/
college/
post-grad-austin/
post-grad-houston/
```

Drop photos directly into the matching folder. They are sorted naturally by
filename, so numeric names remain an easy way to control presentation order:

```text
1.jpg
2.jpg
3.jpg
4.jpg
5.jpg
...
```

JPEG, PNG, WebP, AVIF, and SVG files are supported. Gaps and mixed extensions
are fine: the presentation reads the files that are actually in each folder.
It displays three at a time and brings in the next three in filename order every
30 seconds. The **Shuffle** button advances immediately and **Back** restores
the prior set.

When the total is not divisible by three, the next set wraps to the beginning to
fill every position. For example, seven photos display as `1–3`, then `4–6`,
then `7, 1, 2`, then `3–5`. Back still returns to the exact set that was shown
previously.
