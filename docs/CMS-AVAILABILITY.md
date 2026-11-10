# Portfolio CMS availability

The GitHub Actions workflow reads the same public Supabase project data as the homepage, up to three times per day. It checks for a valid response without printing content. The publishable key already ships with the website; the workflow has no admin credentials or repository write permissions.

See the Actions tab for failures and to run the check manually. GitHub can disable scheduled workflows after 60 days of repository inactivity. Re-enable the schedule from Actions if that happens.

Supabase can still pause Free projects. Resume a paused project in the Supabase dashboard before expecting checks to pass again. The static portfolio and résumé are served separately by Firebase.
