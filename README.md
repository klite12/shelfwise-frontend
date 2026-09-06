# Shelfwise Frontend

Static frontend for Shelfwise, ready to push to GitHub and deploy on Vercel.

## Real content (not demo/placeholder)
- affiliate-disclosure.html — required now that a real Amazon affiliate link is live;
  linked from every page's footer
- python-for-everybody-review.html — Coursera's Python for Everybody Specialization
- google-data-analytics-review.html — Google's Data Analytics Professional Certificate
- grammarly-review.html — Grammarly's free vs Pro plans
- atomic-habits-review.html — Atomic Habits by James Clear (Kindle/ebook)
- choosing-an-online-programming-course.html — original evergreen advice article
All are fact-checked, original writing (not copied from any source). None have
real affiliate links yet — each has an honest disclosure note saying the link
goes directly to the merchant with no affiliate relationship yet. Update those
links once approved into an affiliate program.
Featured on courses.html, software.html, ebooks.html, reviews.html, and blog.html
— all placed OUTSIDE the API-driven product grids, so js/api.js never overwrites
them when it loads live products from the backend.

## What's included
- index.html, courses.html, comparison.html, review-template.html, blog.html
- css/style.css
- js/script.js — shared UI behavior (nav, filters, forms)
- js/config.js — points the site at the live Render backend
- js/api.js — fetches live products and posts newsletter/contact forms

## Before deploying
- js/config.js currently points to https://shelfwise-admin.onrender.com — update this
  if your backend URL ever changes.
- The Render backend needs django-cors-headers configured to allow your Vercel domain,
  or fetch requests from this frontend will be blocked by the browser.

## Not yet included
Several pages linked in the nav/footer (ebooks.html, software.html, reviews.html,
about.html, contact.html, category pages, legal pages) haven't been built yet —
those links will 404 until those pages are added.
