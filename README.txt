64CAST — files changed this session (deploy delta)
Upload each to the SAME path in your repo / Pages project:

  index.html                     Homepage. Pre-Order "View All" now -> /current-stock/?status=preorder
  current-stock/index.html       Reads ?brand=<name> query param and auto-filters to that brand
                                 (case-insensitive reconcile against live data)
  shared/shop.js                 Removed ~715 lines (~33KB) of unreachable admin-panel code.
                                 Live paths (shop init, fetch, offline-fallback catalogue) untouched.
  functions/product/[model].js   OG-preview fallback (unchanged this session; included for completeness).
                                 Ensure the filename keeps the square brackets.

Not changed (do NOT need redeploy): brand folders, faq/, worker.js.
