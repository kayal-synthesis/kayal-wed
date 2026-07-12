# KAYAL SoulPath Website — cPanel Deployment Guide

## Complete Folder Structure

```
kayal-website/
├── index.html                        ← Homepage
├── about.html                        ← About the Institute
├── tools.html                        ← Free Tools page
├── insights.html                     ← Blog/Insights listing
├── contact.html                      ← Contact page (redirect to pages/contact.html)
├── 404.html                          ← Custom error page
│
├── css/
│   ├── global.css                    ← Design system (ALL pages load this)
│   ├── index.css                     ← Homepage only
│   ├── tools.css                     ← Tools page only
│   ├── insights.css                  ← Insights page only
│   ├── about.css                     ← About page only
│   ├── course.css                    ← All course pages
│   └── contact.css                   ← Contact page
│
├── js/
│   ├── global.js                     ← All pages load this (nav, widgets, helpers)
│   ├── index.js                      ← Homepage only
│   └── tools.js                      ← Tools page only
│
├── images/
│   ├── favicon.ico                   ← Add your favicon here
│   ├── og-image.jpg                  ← 1200x630px social share image
│   └── (your own photos go here)
│
└── pages/
    ├── contact.html                  ← Full contact page
    │
    ├── courses/
    │   ├── numerology-foundation.html   ← Complete ✅
    │   ├── numerology-mastery.html      ← Copy & customise template
    │   ├── astrology-foundation.html    ← Copy & customise template
    │   ├── astrology-mastery.html       ← Copy & customise template
    │   ├── mind-development.html        ← Copy & customise template
    │   ├── spirit-science-foundation.html ← Copy & customise template
    │   └── spirit-science-mastery.html  ← Copy & customise template
    │
    └── insights/
        ├── life-path-relationships.html
        ├── timing-window.html
        ├── mind-development.html
        └── spirit-science.html
```

---

## Step 1 — Configure Before Uploading

### A. Formspree (Enrolment Forms → diannj189@gmail.com)
1. Go to https://formspree.io
2. Sign up with diannj189@gmail.com
3. Create a new form → name it "KAYAL Course Enquiries"
4. Copy your form ID (looks like: xpzgkpwn)
5. Find and replace ALL instances of `YOUR_FORM_ID` in every HTML file:
   - index.html (newsletter)
   - pages/contact.html (3 forms)
   - pages/courses/numerology-foundation.html (enrol form)
   - All other course pages

   **Replace:** `https://formspree.io/f/YOUR_FORM_ID`
   **With:**    `https://formspree.io/f/xpzgkpwn` (your actual ID)

### B. Tawk.to (Live Chat)
1. Go to https://tawk.to
2. Sign up free
3. Create a new property → name it "KAYAL SoulPath Website"
4. Copy the embed code — it contains your Property ID and Widget ID
5. In index.html, find:
   ```
   s1.src='https://embed.tawk.to/YOUR_TAWK_PROPERTY_ID/YOUR_WIDGET_ID';
   ```
   Replace with your actual IDs from the Tawk.to dashboard.
6. Copy the same script to every other page (about.html, tools.html, etc.)

### C. WhatsApp Number (optional — for admin/internal use)
If you want to add a WhatsApp contact button anywhere:
Replace `2348012345678` with your actual WhatsApp number in international format.

### D. Social Media Links
In the footer of each page, replace `href="#"` on social links with your actual URLs:
- Instagram: https://instagram.com/kayalsoulsync
- YouTube: https://youtube.com/@kayal
- etc.

### E. LifeOS App URL
Replace `https://app.kayallifeos.com` with your actual app URL when it is live.

---

## Step 2 — Duplicate Course Pages

The file `pages/courses/numerology-foundation.html` is the complete template.
To create the other 6 course pages:

1. Copy `numerology-foundation.html`
2. Rename to: `numerology-mastery.html`, `astrology-foundation.html`, etc.
3. In each copy, change:
   - `<title>` and `<meta name="description">`
   - The course hero pillar text (`The First/Second/Third/Fourth Pillar`)
   - The `eyebrow` duration text
   - `h1` course title
   - `course-hero-desc` paragraph
   - `course-hero-meta` values (duration, level, format)
   - `<input type="hidden" name="course"` value
   - All 6 learn cards (title + desc)
   - All curriculum weeks (weeks, title, desc)
   - Who It's For items
   - Testimonial quote and attribution
   - Next-course widget link and description
   - Unsplash image URL

### Unsplash images for each course:
```
Numerology Foundation:   photo-1507003211169-0a1dd7228f2d (contemplation)
Numerology Mastery:      photo-1456406644174-8ddd4cd52a06 (books/study)
Astrology Foundation:    photo-1532110093739-9470acff878f (stars/night)
Astrology Mastery:       photo-1519681393784-d120267933ba (galaxy)
Mind Development:        photo-1544367567-0f2fcb009e0b (meditation)
Spirit Science Fdn:      photo-1506905925346-21bda4d32df4 (mountain)
Spirit Science Mastery:  photo-1532094349884-543bc11b234d (cosmos)
```

---

## Step 3 — Upload to cPanel

1. Log in to your cPanel
2. Open **File Manager**
3. Navigate to `public_html/` (this is your website root)
4. Upload the entire contents of `kayal-website/` into `public_html/`
   - NOT the `kayal-website/` folder itself — its CONTENTS
   - So `public_html/index.html` should exist (not `public_html/kayal-website/index.html`)

5. Set 404 custom error page:
   - In cPanel → Error Pages → 404 Not Found
   - Set to: `/404.html`

---

## Step 4 — Go Live Checklist

- [ ] Formspree form ID replaced in all files
- [ ] Tawk.to embed code added to all pages
- [ ] Social media URLs updated in all footers
- [ ] favicon.ico added to /images/
- [ ] og-image.jpg added to /images/
- [ ] LifeOS app URL updated
- [ ] All 7 course pages created and customised
- [ ] 404 custom error page set in cPanel
- [ ] Test all enrolment forms (submit a test to verify diannj189@gmail.com receives it)
- [ ] Test on mobile devices

---

## Blog AI Drafting Tool (Future)

The AI blog drafting tool (for you as admin) requires an Anthropic API key.
Since this is a static site, do NOT put the key directly in the HTML.

**Safe approach:** Use a Vercel or Netlify serverless function (free tier):
1. Create a free account at https://vercel.com
2. Deploy a 1-file API route that proxies requests to Anthropic
3. Store your API key in Vercel's environment variables
4. Point the blog tool's fetch() call to your Vercel function URL

I can build this proxy function whenever you are ready.

---

## Path Reference for Cross-Linking

When linking between pages, use these relative paths:

| From                          | To index.html | To pages/contact.html | To pages/courses/X.html |
|-------------------------------|---------------|-----------------------|------------------------|
| Root (index.html)             | ./index.html  | ./pages/contact.html  | ./pages/courses/X.html |
| pages/ level                  | ../index.html | ./contact.html        | ./courses/X.html       |
| pages/courses/ level          | ../../index   | ../contact.html       | ./X.html               |
| pages/insights/ level         | ../../index   | ../contact.html       | ../courses/X.html      |
