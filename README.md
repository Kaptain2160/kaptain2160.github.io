# Smoky Mountain Living with Debra — Website

## File Structure
```
smoky-site/
├── index.html          ← Home page
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Animations, nav, form
└── pages/
    ├── listings.html
    ├── about.html
    ├── resources.html
    └── contact.html
```

## How to publish on GitHub Pages (free)

1. Go to github.com and create a free account
2. Click "New repository"
3. Name it exactly: `yourusername.github.io`
4. Make it Public
5. Click "Create repository"
6. Click "uploading an existing file"
7. Drag ALL files from this folder into the upload area
   — include the css/ and js/ folders and pages/ folder
8. Click "Commit changes"
9. Your site is live at: https://yourusername.github.io

## To use your existing domain (smokymountainlivingwithdebra.com)

After publishing to GitHub Pages:
1. In your repository → Settings → Pages → Custom domain
2. Type your domain name and save
3. Log in to wherever your domain is registered (GoDaddy, Namecheap, etc.)
4. Add these DNS records:
   A records pointing to:
     185.199.108.153
     185.199.109.153
     185.199.110.153
     185.199.111.153
5. Wait up to 24 hours for DNS to propagate

## Adding your own photos

Replace placeholder images by uploading your photos to the /images folder
and updating the src="" in any <img> tag. The hero photo on the home page
already pulls from your Squarespace CDN — replace that with a local photo
once you have one saved.

## Adding real listings

In pages/listings.html, copy one of the <article class="listing-card"> 
blocks and update the price, address, and badge text. To add a real photo,
upload it to /images and set it as the src on a real <img> tag instead
of the placeholder div.

## Contact form

The form currently uses a mailto: action which opens the visitor's email app.
For a proper contact form that sends emails automatically, sign up for free at
Formspree.io and replace the form action with your Formspree endpoint.
