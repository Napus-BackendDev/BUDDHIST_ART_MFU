# User-Facing UI Design & Layout Specification

This document provides a detailed specification of the visual identity, typography, color palettes, and layouts for the user-facing pages of the Buddhist Art MFU system.

---

## 1. Visual Identity & Style Systems

### Color Palette
The design leverages a premium, culturally rich color scheme representing the traditional Lanna arts combined with modern clean layouts:
* **Primary Brand Red**: `#612721` (A deep, regal burgundy representing Lanna lacquerware and traditional murals).
* **Accent/Action Red**: `#ac1515` (A brighter red used for highlights, important alerts, and primary buttons).
* **Accent Gold**: `#FEC260` (Used in gradients and borders to symbolize Buddhist enlightenment and gold leaf).
* **Deep Charcoal**: `#3c4b64` / `#172b4d` (Used for text readability and high contrast structural elements).
* **Off-White Canvas**: `#FAF9F6` (A warm white background texture reminiscent of traditional mulberry paper).
* **Pure White**: `#ffffff` (Used for cards and elevated components).

### Typography
* **Latin Headings**: `'Cinzel', serif` (Exudes classical, architectural structure ideal for historical art exhibitions).
* **Thai & Body Text**: `'Sarabun', sans-serif` (Clean, highly readable sans-serif typeface optimized for academic and general reading).

### Elevation & Shadows
* **Default Card Shadow**: `0 10px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)` (Provides a gentle floating appearance).
* **Hover State Shadow**: `0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)` (Accompanied by a `translateY(-4px)` shift for micro-animations).

---

## 2. Page Specifications & Layouts

### A. Cover / Hero Section (Landing Page Header)
* **Background**: A high-resolution background image (`home_hero_gen.png`) depicting temple architecture or artwork, layered with a linear-gradient dark overlay:
  ```css
  background: linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0.2) 100%);
  ```
* **Title**: Heavy uppercase text with `'Cinzel'` font, featuring a highlight text class:
  - Font Size: `4.5rem` (desktop), `2.5rem` (mobile).
  - Highlights use a subtle semi-transparent stroke: `-webkit-text-stroke: 1.5px rgba(255, 255, 255, 0.4)`.
* **Decorative Elements**: A soft, background radial blur blob (`rgba(97, 39, 33, 0.25)`) at the bottom right.
* **Call-to-Action (CTA)**: Two pill-shaped buttons:
  1. Primary filled button (`#612721`) for "View Artworks".
  2. Outlined white button for "News & Activities".

### B. Home Page Structure
The homepage is a modular landing experience composed of:
1. **SectionHeroHome**: The cover/hero header described above.
2. **SectionFeaturedHome**: A curated selection of highlight artworks displayed in a grid, showcasing title, artist name, and a visual link.
3. **SectionSubmissionHome**: An academic section highlighting course registration, student assignments, and certificate creation details.
4. **SectionNews**: A snapshot grid of the 3-4 most recent news articles and upcoming gallery events.

### C. Artworks Gallery Page (`/artworks`)
A modern, search-and-filter-focused interface displaying approved artworks:
* **SectionHeaderArtworks**: A modular banner displaying a matching background image and a section subtitle.
* **Filter Toolbar**:
  - **Search Box**: Rounded (`border-radius: 50px`) containing a magnifying glass icon and real-time input filtering.
  - **Price Range Filter**: An expandable slide-down panel containing dual range sliders (`minPrice` and `maxPrice`) with a custom track color (`#3b3dfa` / `#612721`).
* **Category Selection**: A scrollable horizontal list of "chips". Selected chips become active with high contrast coloring and show the item count for each category.
* **Gallery Grid**: A responsive grid containing cards with:
  - Large thumbnail image.
  - Title and Artist Badges.
  - Pricing and Reservation details.

### D. About Us Page (`/about`)
A content-driven informational layout outlining the center's background:
* **Hero Header Banner**: Shares the same structural overlay styling as the landing cover page with an `about_hero.png` background.
* **Vision & Mission Section**: A wide card (`p-4` with left accent bar) housing the core mission text.
* **Contact & Form Cards**: A split 2-column layout:
  - **Left Column**: Address, phone, and email details paired with modern shadow icon boxes and a watermark logo (`cil-institution`).
  - **Right Column**: A minimalist message-sending form featuring premium focus borders (`custom-input-premium`) and a "Submit" button.
* **Google Maps Embed**: A full-width interactive map card located at the footer.

### E. News Page (`/news`)
A chronological grid of news updates and announcements:
* **SectionHeaderNews**: Custom banner heading.
* **Layout**: A search box followed by a staggered grid containing:
  - Date and time badge overlay.
  - News cover photo.
  - Heading and short summary snippet.
  - "Load More" pagination pill button (`border-radius: 50px`).
