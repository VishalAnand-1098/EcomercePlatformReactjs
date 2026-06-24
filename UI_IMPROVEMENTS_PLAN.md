# UI Improvements Implementation Plan

## Overview hy
Five targeted improvements for the GiftsBhejo storefront: cleaner product cards, HTML descriptions, premium mobile filters, category-only mega menu with slug URLs, and simplified navigation.

---

## 1. Product Card — Hide Description & Fix Add to Cart Visibility

**Problem:** Long descriptions push the Add to Cart button off-screen on mobile and desktop grids.

**Solution:**
- Remove description from `ProductCard.jsx` (description stays on product detail page only)
- Use flex column layout with `flex-1` so price + Add button always sit at the bottom
- Keep image aspect ratio square (`aspect-square`) for consistent card height
- Match bakingo-style cards: image → title → price → Add button

**Files:** `src/components/product/ProductCard.jsx`

---

## 2. HTML Description on Product Detail Page

**Problem:** Admin enters HTML in description field but it renders as plain text.

**Solution:**
- Install `dompurify` for safe HTML sanitization
- Create `ProductDescription` component that renders sanitized HTML
- Add scoped CSS for lists, bold, links, paragraphs inside description
- Keep admin textarea unchanged (admins can paste HTML)

**Files:**
- `src/components/product/ProductDescription.jsx` (new)
- `src/pages/ProductDetails.jsx`
- `package.json` (add dompurify)

---

## 3. Premium Mobile Filters on Products Page

**Problem:** Filter sidebar takes full width on mobile and looks basic.

**Solution:**
- Desktop (lg+): keep sidebar filters as today
- Mobile: hide sidebar; show sticky **"Filters"** button with active-count badge
- Tapping opens a bottom-sheet drawer with smooth animation
- Premium styling: rounded-xl, shadow-xl, pink accent border, better spacing
- Apply / Reset buttons fixed at bottom of drawer
- Backdrop overlay when open

**Files:**
- `src/components/product/ProductFilter.jsx`
- `src/pages/Products.jsx`

---

## 4. Category Mega Menu & Slug URLs

**Problem:**
- Mega menu shows individual product names (cluttered)
- URLs use UUID: `?category=5e127aec-b654-4f2c-a047-796bce55d925`
- User wants: `?category=chocolate-cake`

**Solution:**
- Create `categoryHelpers.js` with `categoryNameToSlug()` and `findCategoryBySlug()`
- Mega menu shows **only parent category + subcategories** (no product names)
- All category links use slug: `/products?category=chocolate-cake`
- `Products.jsx` reads slug from URL and resolves to category ID for API
- When user changes category filter, URL updates with slug (not UUID)
- Remove product fetching from Header (no longer needed for mega menu)
- Backward compatible: if URL contains UUID, still resolve it

**URL examples:**
| Action | URL |
|--------|-----|
| All products | `/products` |
| Cake category | `/products?category=cake` |
| Chocolate Cake subcategory | `/products?category=chocolate-cake` |

**Files:**
- `src/utils/categoryHelpers.js` (new)
- `src/components/layout/Header.jsx`
- `src/components/layout/MegaMenu.jsx`
- `src/pages/Products.jsx`
- `src/components/product/ProductFilter.jsx`

---

## 5. Hide Home / Products / Contact from User Navbar

**Problem:** User wants category bar only; no Home, Products, Contact links in header.

**Solution:**
- Remove desktop center nav links (Home, Products, Contact)
- Remove same links from mobile hamburger menu
- Add **category accordion** in mobile menu so users can still browse on phone
- Footer links remain unchanged

**Files:** `src/components/layout/Header.jsx`

---

## Execution Order

1. Create utility helpers (`categoryHelpers.js`, `ProductDescription.jsx`)
2. Install `dompurify`
3. Update `ProductCard.jsx`
4. Update `ProductDetails.jsx`
5. Redesign `ProductFilter.jsx` (mobile drawer)
6. Update `Products.jsx` (slug URL sync)
7. Update `Header.jsx` (nav + mega menu + mobile categories)
8. Update `MegaMenu.jsx` (slug URLs)

---

## Test Checklist

- [ ] Product cards show image, title, price, Add button — no description
- [ ] Add to Cart visible on mobile without scrolling
- [ ] HTML in description renders (bold, lists, links) on product detail page
- [ ] Mobile filter opens as bottom drawer with Apply/Reset
- [ ] Clicking CAKE shows only subcategories (no product names)
- [ ] URL shows `?category=chocolate-cake` not UUID
- [ ] Home / Products / Contact not visible in header (desktop + mobile)
- [ ] Mobile menu still has category links
