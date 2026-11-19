---
slug: designcollectors
title: Designcollectors
kicker: Web Design · UX/UI · E-commerce · Front-end · Freelance
subtitle: Redesign and front-end for an online store of design classics, with product photos at the center of the experience
seoTitle: "Designcollectors: redesign and front-end for a design e-commerce"
description: Redesign and front-end case study for a design classics store: less color, photos at the center, horizontal scrolling, visible filters and one-page checkout.
card: Redesign and front-end for a design classics e-commerce, with photos at the center and one-page checkout.
cover: d_cover
coverAlt: Line illustration of design classics such as chairs, lamps, stools and objects, linked by dotted lines
skills: [Web Design, UX/UI, E-commerce, Front-end, Webflow, Responsive]
company: Freelance, with a partner design agency
role: Designer and Front-end
period: 2022, third version of the site
team: Design and front-end, with a partner design agency
stat1: ~14 | brands in the catalog
stat2: 1 | checkout page
stat3: 2015 → 2022 | from the previous version to the new one, live since August 2022
---

## About the project

Designcollectors is an online store specializing in classic, timeless furniture and accessories for homes and offices, with brands such as Vitra, Artek and Thonet. This is the third version of the site, live since August 2022, with the redesign and front-end built by the designer who has worked on the store since it launched in 2009.

## Challenges

- Put product photos at the center, with a cleaner identity.
- Keep the layout scalable as brands and products keep growing.
- Browse many categories without weighing the layout down, with always-visible filters.
- Simplify checkout within the technical limits of the e-commerce system.

<!-- fim-topo -->

## Business context

### The store’s story

The site has followed the store since it launched in 2009, in partnership with a design agency. At first, Designcollectors sold only Vitra furniture. Artek, Thonet and other brands followed, and today the catalog brings together about 14 brands and a much wider range of products.

In 2015, the site got a redesign that stayed live until the end of August 2022. That version’s home page shows the identity of the time, with one color for each section.

![Designcollectors home page in the 2015 version, with one color and one icon per section](img:d14)

### The previous design

The 2015 design had its own color scheme for each section, with matching icons. The result was vibrant and full of personality. On mobile, each section had its own color too.

![Designcollectors site on a phone, in the 2015 version, with each section’s colors](img:d13)

As the catalog grew, the colors started to compete with the product photos. On the product list, filters were hidden at the top and only appeared after a click.

![Product list in the old version, with the colored section and filters hidden at the top](img:d3)

## Kick-off

The project’s starting point:

- **Goal:** a third version of the site, with the products at the center and a layout that can handle a growing catalog.
- **Scope:** visual direction, navigation, checkout structure, filters, front-end and a logo update, together with the client.
- **Responsibilities:** design and front-end by the designer, in partnership with the agency; the technical limitations of the e-commerce system were the client’s.

## Team and timeline

- **Type:** freelance, in partnership with a design agency.
- **Timeline:** 2022. The previous version, from 2015, stayed live until the end of August 2022, when this one replaced it.
- **Tools:** Milanote for the moodboard and Webflow for the front-end.

## Hypothesis

With less color and more room for photos, the products become the center of the experience, and the layout can handle a growing catalog.

## Research

### Concept: fewer colors, more photos

The new version dropped the many colors for a minimalist approach: black, red and a few light grays. The intent was to put the product photos in the spotlight. Beautiful interior photos persuade people to buy, and the store had plenty of them.

The moodboard was built in Milanote, which brings inspiration, ideas and to-do lists into one board and set the tone for the project.

![Milanote moodboard with the site’s overall look: interior photos, colors and the brand](img:d11)

> **Where AI comes in today:** at this stage, generative AI helps explore visual directions before looking for real references, with palette, composition and typography variations generated in minutes to bring into the conversation with the client.

### Just enough white space

To keep the look clean, the work was finding the right balance of white space: a layout that is pleasant, but also flexible and scalable on desktop and mobile. With the number of products and brands growing in recent years, the layout had to fit that content without losing clarity. The new home page puts interior photos at the center.

![New Designcollectors home page with large photos of interiors and classic furniture in a minimalist layout](img:d12)

## Decisions and trade-offs

### An updated logo

While designing the home page, the logo got an update. The cart icon was handy on buttons, favicons and other elements, but it looked dated and limited alignment with the new layout. The revision was proposed to the client and settled in a joint brainstorming session, and the new logo took on the tagline “only classics”.

![Old and new Designcollectors logo, with the tagline only classics](img:d10)

### The logo at the center of the top bar

The logo moved to the center of the top bar, even though that left less room for search, section navigation, cart, account and the language switcher. The solution kept the logo centered on desktop. On mobile, the menu becomes a hamburger icon, with the logo on the left, next to account and cart.

![Designcollectors navigation on a phone: hamburger menu, categories and a featured product](img:d8)

### Subtle animations

In the top bar, a down arrow moves slightly on hover, signaling a menu. On click or tap, the menu opens and the arrow turns 180 degrees. At the bottom of each menu, three special links have an arrow that slides right on hover. On the right, two featured products reveal their price in a semi-transparent white box that slides up from the bottom.

![Top bar menu open, with categories, the special links and two featured products](img:d9)

On smaller phones, the featured products left the menu for lack of space. Product photos and brand logos get a subtle zoom on hover.

> **Where AI comes in today:** micro-interactions like these can be prototyped directly in code with AI, to test the pace and duration of the animations before taking them to the front-end.

### Horizontal scrolling

With many categories, subcategories and products to show, stacking everything vertically would make the layout heavy. The answer was keeping each group in a single row, with horizontal scrolling or swiping, already common on mobile. Photos stay large instead of turning into thumbnails, and the row hints at what comes next.

![Horizontal scrolling of categories: furniture, lighting, outdoor and accessories](img:d7)

The same pattern applies to featured products and leaves room for the catalog to grow. Brand logos follow the same logic: they show in full and wrap into several rows on smaller screens.

![Horizontal scrolling of featured products, with large photos and prices](img:d6)

### Hiding long content

Every brand and every designer has a story, and all of them appear on the home page with a link to their pages. With about 14 brands, showing them all at once would clutter the screen: the home page shows a selection and a “show all” link. On each brand page, “continue reading” expands the text, and “hide”, with an up arrow that moves on hover, collapses it again.

![Vitra brand text collapsed, with the continue reading link](img:d5)

> **Where AI comes in today:** long brand and designer texts are a good starting point for AI, with short summaries for the home page and full versions for the pages, always reviewed before publishing.

## Solution

### One-page checkout

In the previous version, checkout had numbered steps at the top, but part of the proposal was lost in implementation because of technical limits in the system. In the new version, checkout was condensed into a single page. To keep it light, what isn’t essential (account details, company details or promo codes) stays hidden until the customer asks for it.

![One-page checkout template: order summary, delivery, shipping and payment](img:d4)

### Always-visible filters

In the previous design, filters were hidden at the top and needed a click to appear, and the list often took up more than one row. In the new design, sorting and filters sit on the left. On mobile, they collapse at the top: on tablets they fit in one row, and on phones they sit in separate rows. Sorting stays a simple dropdown, and the filter became a custom checklist.

![Product list on a phone, with sorting and filters collapsed at the top](img:d2)

### Zoom on the product photo

A zoom on the main photo of the product detail page was also proposed, to see the product up close. The proposal had not been implemented yet when the project was documented.

![Product detail page with the proposed zoom on the main photo](img:d1)

### Front-end in Webflow

Design and front-end were done by the same person, and Webflow saved many hours of coding.

> **Where AI comes in today:** on a project like this, AI also speeds up the front-end, with drafts of components and responsive states that are then reviewed and adjusted by hand.

## Validation

Decisions were discussed with the client throughout the project. The new logo, for example, was settled together, replacing the cart icon with the tagline “only classics”.

## Post-launch results

At the end of August 2022, the new version replaced the site that had been live since 2015, with photos at the center, always-visible filters and one-page checkout.

## Learnings

- With an e-commerce system that limited checkout, the answer was to reorganize what already existed (a single page, with show and hide for anything non-essential) instead of depending on changes to the system.
