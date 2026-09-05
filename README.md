# Shelfwise Frontend

Static frontend for Shelfwise, ready to push to GitHub and deploy on Vercel.

## Real content (not demo/placeholder)
- python-for-everybody-review.html — an original, fact-checked review of Coursera's
  Python for Everybody Specialization. Links out to the real course page (not yet
  an affiliate link — see the disclosure note on that page).
- choosing-an-online-programming-course.html — an original evergreen advice article,
  linking to the review above.
Both are linked from blog.html, and featured (outside the API-driven product grid,
so api.js never overwrites them) on courses.html and reviews.html.

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
