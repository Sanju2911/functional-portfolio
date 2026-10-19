# Deployment and maintenance

## Local preview

Use Node.js 20 or later:

```sh
npm start
```

Open `http://127.0.0.1:4173/`. No package install or compilation is needed. Internet access is required for Supabase and Google Fonts. The public client build of Supabase is vendored under `dist/vendor/`.

## Check the release

```sh
npm run check
npm run test:public
```

`check` verifies JavaScript syntax, local HTML file references, known private credential patterns, cover rendering safeguards, and the Firebase target. `test:public` verifies anonymous reads and rejected writes against the configured Supabase project. Transactional SQL checks and the browser rich-format harness are in `database/`.

## Firebase Hosting

The existing target is explicit in both configuration files:

- Firebase project and Hosting site: `portfolio-0129`
- Public directory: `dist`
- Custom domain: `https://portfolio.sathwiktadivaka.com`
- Default domains: `https://portfolio-0129.web.app` and `https://portfolio-0129.firebaseapp.com`

Install the official Firebase CLI if necessary, sign in with an account that owns this project, then deploy:

```sh
npm install -g firebase-tools
firebase login
firebase projects:list
npm run deploy
```

Only Hosting is deployed. This does not replace Supabase data, change authentication memberships, or deploy Firestore/Storage rules. The release replaces the existing Hosting files while retaining Firebase's previous release history for rollback. Routes `/admin/` and `/blogs/` are real static directories; an unknown route should return 404 rather than the homepage.

The Hosting configuration revalidates files to prevent stale admin scripts after updates. It also adds MIME-sniffing protection, a referrer policy, and frame protection. Hidden metadata and credentials are excluded from the deployed directory.

## Supabase configuration

The existing backend is `https://wgyxeqpnitgxhytvmztg.supabase.co`. Keep the current backend for this portfolio; do not rerun installation SQL against its populated database.

In Authentication → URL Configuration, set the canonical Site URL and allow the sign-in return URLs:

```text
https://portfolio.sathwiktadivaka.com/admin/
https://portfolio-0129.web.app/admin/
https://portfolio-0129.firebaseapp.com/admin/
```

Retain any old preview callback that is still used. The studio computes email-link redirects from its current origin, so each supported host must be allowlisted. Authentication sessions and unsynced device drafts are scoped to a browser origin; signing into one host does not sign into another.

For a separate, empty Supabase project only: run `database/schema.sql`, then optionally `database/seed.sql`, change the public URL/key in `dist/cms-client.js`, create an Auth user, and add that user's UUID to `portfolio_admins` through a trusted dashboard session. Never place a service-role key in browser code. Existing installations can use the additive migration files. Historical reset scripts are not part of the GitHub release.

## Content updates

- Use `/admin/` for projects, covers, galleries, portrait settings, blogs, drafts, and blog visibility.
- Replace `dist/assets/Sathwik-Tadivaka-Resume.pdf` and redeploy to update the resume.
- Edit source for base portfolio copy, experience, research, social links, and the contact address.
- Keep image source files modest; uploads are resized and converted to WebP by the studio.

## GitHub source

Repository: `Sanju2911/functional-portfolio`. The GitHub release contains current website source, Firebase configuration, schema/migrations, tests, and documentation. It excludes the previous Sites identity, Git internals, credential stores, local environment files, generated archives, and historical destructive reset scripts.

Publishing source does not copy private CMS content or Auth users into GitHub. The resume and project screenshots under `dist/assets/` are intentionally part of the public website and source release.

## Resume preview updates

The current supplied PDF is served unchanged at `dist/assets/Sathwik-Tadivaka-Resume.pdf`. `/resume/` previews every page as a high-resolution WebP, includes accessible extracted text, and offers the original PDF for viewing and download. After replacing the PDF, regenerate all `resume-page-N.webp` assets and the preview HTML/text so they stay in sync. The homepage links lead to the preview, not an automatic download.
