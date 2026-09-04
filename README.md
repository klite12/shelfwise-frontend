# Shelfwise Frontend

Static frontend for Shelfwise, ready to push to GitHub and deploy on Vercel.

## What's included
- index.html, courses.html, ebooks.html, software.html, reviews.html,
  comparison.html, review-template.html, blog.html, about.html, contact.html
- css/style.css
- js/script.js — shared UI behavior (nav, filters, forms)
- js/config.js — points the site at the live Render backend
- js/api.js — fetches live products (filterable by category or product type)
  and posts newsletter/contact forms

## How product grids pick their products
Grids marked [data-product-grid][data-api-source] are populated from
/api/products/ on page load:
- data-api-type="course" (or "ebook", "software,template" — comma-separated
  product_type values) filters by the product's type. Used on courses.html,
  ebooks.html, software.html.
- data-api-category="online-courses" filters by the exact Category slug from
  the backend. Not currently used by default, but available for future
  topic pages (e.g. a Data Analytics category page).
- data-api-featured="1" filters to is_featured products. Used on index.html.
- No filter at all (reviews.html) shows every product.
If a grid's filter returns zero live products, its static demo cards stay
in place as a fallback rather than showing an empty grid.

## Before deploying
- js/config.js currently points to https://shelfwise-admin.onrender.com — update this
  if your backend URL ever changes.
- The Render backend needs django-cors-headers configured to allow your Vercel domain,
  or fetch requests from this frontend will be blocked by the browser.
- contact.html posts to /api/contact/ via ShelfwiseAPI.submitContact — confirm
  submissions land in the admin's Contact Messages section after deploying.

## Not yet included
Category pages (business.html, digital-marketing.html, programming.html,
data-analytics.html) and legal pages (privacy-policy.html, terms.html,
affiliate-disclosure.html) are still linked from the nav/footer but not built —
those links will 404 until added.
