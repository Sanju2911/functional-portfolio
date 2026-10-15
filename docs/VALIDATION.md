# Release verification

Verified on **15 October 2026 (Asia/Kolkata)** against the deployed Firebase release and the existing Supabase backend.

| Check | Result |
| --- | --- |
| Firebase project/site | Deployment completed for `portfolio-0129`, Hosting only. |
| Custom domain | `https://portfolio.sathwiktadivaka.com/` serves the fresh portfolio. |
| Main CMS content | Four published projects load from Supabase; blog navigation reflects the saved setting. |
| Admin and blog routes | `/admin/` and `/blogs/` return successfully; slashless forms redirect correctly. |
| Resume download | DOCX returns successfully and matches the source file. |
| Missing pages | An unknown route returns 404. Hidden previous hosting metadata is not served. |
| Administrator access | Owner signed in on the Firebase custom domain; the protected studio loaded successfully. |
| Project editor | All five templates and the saved cover settings load; the preview image resolves. |
| Portrait editor | Frame, crop, zoom, and filter controls load with the saved settings. |
| Blog studio | Draft library and rich writing canvas load, including the wrapping title and shared site typography. |
| Authentication redirects | Canonical custom-domain callback plus both Firebase host callbacks are allowlisted; the previous preview callback is retained. |
| Source checks | Eleven browser JavaScript files parse, fifty local HTML references resolve, and the known private-credential pattern scan passes. |
| Template checks | Five layouts, legacy defaults, numeric bounds, safe image protocols, and escaped cover text pass. |
| Public access checks | Admin membership and private drafts are protected; anonymous project/settings writes and image upload are rejected. |
| GitHub | The public repository and its README, feature guide, deployment guide, Firebase configuration, and third-party notices resolve successfully. |

The Firebase migration smoke test inspected editors without changing portfolio content. The same Supabase backend had already passed the rich-text, inline-image upload, autosave, refresh recovery, publication, and private-revision checks during CMS implementation. Draft RLS SQL tests use transactions that roll back their test content.

The custom domain uses Cloudflare email protection, which can rewrite email links in delivered homepage HTML. That transformation explains why the homepage's delivered bytes differ from the source; the checked admin scripts, admin/blog HTML, and resume match the release files.

The local GitHub checkout is `functional-portfolio`. Its `dist/` directory matches the files prepared for Firebase deployment. Private CMS records, authentication users, browser drafts, and credential stores are not exported to GitHub.
