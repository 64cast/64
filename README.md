# 64CAST — Deploy Package (deploy-latest/) — changed files only

Only these 2 files differ from what's live in `64cast/64` (main). Commit to the same paths.

| Package file | Repo destination | What changed |
|---|---|---|
| index.html | index.html | Homepage — live New Arrivals / Current Stock / Pre-Order sections from admin API, menu links route to real pages instead of in-page anchors |
| current-stock/index.html | current-stock/index.html | Status → Brand → Price → Vehicle Brand filter order, live `?q=` search, product drawer image-count fix, mobile bottom-sheet filter, embedded demo fallback, TDZ crash fix |

## After deploying, test
1. Homepage: New Arrivals / Current Stock / Pre-Order load from live data (or demo fallback if API is down); menu links go to real pages.
2. `/current-stock/`: filters in Status → Brand → Price → Vehicle Brand order; `?q=` search works; product drawer image dots match real image count; mobile filter opens as a bottom sheet.
