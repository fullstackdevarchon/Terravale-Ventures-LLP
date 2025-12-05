# Styling Guide - Apply Admin-Frontend Styles to Other Frontends

This guide documents all styling improvements made to `admin-frontend` that should be applied to `labour-frontend` and `frontend` folders.

## 1. Font Implementation (Science Gothic)

### Files to Update:
- `index.html`
- `tailwind.config.js`
- `src/index.css`

### Changes:

#### **index.html:**
```html
<head>
  <!-- Add Google Fonts -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Science+Gothic:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
</head>
```

#### **tailwind.config.js:**
```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Science Gothic',
          'system-ui',
          '-apple-system',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
```

#### **src/index.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Science Gothic', system-ui, -apple-system, sans-serif;
  font-variation-settings: 'wght' 400;
}
```

---

## 2. Mobile Responsive Headers

### Pattern to Apply:

**Before:**
```jsx
<h1 className="text-5xl font-extrabold mb-4 ...">
  <Icon /> Title
</h1>
```

**After:**
```jsx
<h1 className="text-3xl md:text-5xl font-extrabold mb-6 md:mb-8 ... flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
  <Icon className="text-3xl md:text-5xl" />
  <span>Title</span>
</h1>
```

### Key Changes:
- Size: `text-5xl` → `text-3xl md:text-5xl`
- Layout: `flex` → `flex flex-col md:flex-row`
- Gap: `gap-3` → `gap-2 md:gap-3`
- Margin: `mb-4` → `mb-6 md:mb-8`
- Icon size: Add responsive sizing
- Wrap text in `<span>`

---

## 3. Grid Layouts

### Dashboard Cards:

**Before:**
```jsx
<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
```

**After:**
```jsx
<div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

### Product/Order Lists:

**Mobile:** 1 column  
**Tablet:** 2 columns  
**Desktop:** 3 columns

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
```

---

## 4. Card Styling

### Responsive Card Padding:

**Before:**
```jsx
<div className="p-6 rounded-2xl ...">
```

**After:**
```jsx
<div className="p-3 md:p-6 rounded-xl md:rounded-2xl ...">
```

### Card Content:

**Title:**
```jsx
<h3 className="text-sm md:text-lg font-bold truncate">
```

**Count/Value:**
```jsx
<p className="text-2xl md:text-3xl font-extrabold">
```

**Description:**
```jsx
<p className="text-xs md:text-sm font-medium line-clamp-2">
```

**Icons:**
```jsx
<Icon className="text-2xl md:text-3xl" />
```

---

## 5. Container Padding

### Page Containers:

**Before:**
```jsx
<div className="p-8">
```

**After:**
```jsx
<div className="p-4 md:p-8">
```

---

## 6. Search Bars

### Responsive Search:

```jsx
<div className="relative w-full md:w-96">
  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black z-10" />
  <input
    type="text"
    placeholder="Search..."
    className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/40 backdrop-blur-md border border-white/30 text-black placeholder-black/50 shadow-lg focus:ring-2 focus:ring-white focus:outline-none font-medium"
  />
</div>
```

---

## 7. 2x2 Grid Layout (Product Details)

### Pattern:

```jsx
<div className="grid grid-cols-2 gap-2">
  <div className="bg-white/20 p-2 rounded-lg border border-white/10 flex items-center justify-between">
    <span className="text-xs text-black/70 font-medium">Label:</span>
    <span className="text-sm font-bold text-black">Value</span>
  </div>
  {/* Repeat for other cells */}
</div>
```

---

## 8. Inventory/List Pages

### 2-Column Grid:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="p-3 md:p-6 rounded-xl md:rounded-2xl ...">
    {/* Card content */}
  </div>
</div>
```

### Truncated IDs:

```jsx
<span className="text-xs md:text-base truncate">
  ID: {item.id.slice(0, 8)}...
</span>
```

---

## 9. Order Cards

### Size Reductions:

| Element | Mobile | Desktop |
|---------|--------|---------|
| Padding | p-2 | p-3 |
| Image Height | h-32 | h-40 |
| Title | text-sm | text-base |
| Details | text-xs | text-sm |
| Gap | gap-2 | gap-3 |

---

## 10. Common Responsive Patterns

### Text Sizes:
```
Heading: text-3xl md:text-5xl
Subheading: text-xl md:text-2xl
Title: text-base md:text-lg
Body: text-sm md:text-base
Small: text-xs md:text-sm
```

### Spacing:
```
Padding: p-3 md:p-6
Margin: mb-4 md:mb-8
Gap: gap-2 md:gap-4
```

### Border Radius:
```
Small: rounded-lg md:rounded-xl
Large: rounded-xl md:rounded-2xl
```

---

## 11. Files to Update in Each Frontend

### labour-frontend:
- [ ] `index.html` - Add Science Gothic font
- [ ] `tailwind.config.js` - Configure font
- [ ] `src/index.css` - Set default font
- [ ] Dashboard pages - Apply responsive headers
- [ ] List pages - Update grid layouts
- [ ] Card components - Add responsive sizing
- [ ] Search components - Make responsive

### frontend:
- [ ] `index.html` - Add Science Gothic font
- [ ] `tailwind.config.js` - Configure font
- [ ] `src/index.css` - Set default font
- [ ] Buyer pages - Apply responsive headers
- [ ] Seller pages - Apply responsive headers
- [ ] Product lists - Update grid layouts
- [ ] Order pages - Add responsive sizing

---

## 12. Step-by-Step Application

### For Each Frontend:

1. **Install Font:**
   - Update `index.html`
   - Update `tailwind.config.js`
   - Update `src/index.css`

2. **Update Headers:**
   - Find all page headers
   - Apply responsive sizing pattern
   - Add flex-col on mobile

3. **Update Grids:**
   - Change to 1/2/3 column pattern
   - Add responsive gaps

4. **Update Cards:**
   - Add responsive padding
   - Add responsive text sizes
   - Add truncation where needed

5. **Update Containers:**
   - Add responsive padding

6. **Test:**
   - Check mobile view (< 768px)
   - Check tablet view (768px - 1024px)
   - Check desktop view (> 1024px)

---

## 13. Quick Reference

### Breakpoints:
- Mobile: `< 768px` (default)
- Tablet: `md:` (≥ 768px)
- Desktop: `lg:` (≥ 1024px)

### Common Classes:
```
text-3xl md:text-5xl
p-4 md:p-8
gap-4 md:gap-6
grid-cols-1 md:grid-cols-2 lg:grid-cols-3
flex flex-col md:flex-row
rounded-xl md:rounded-2xl
```

---

## 14. Testing Checklist

For each page:
- [ ] Mobile view looks good
- [ ] Tablet view looks good
- [ ] Desktop view looks good
- [ ] Text is readable at all sizes
- [ ] Cards don't overflow
- [ ] Grids adapt properly
- [ ] Headers stack on mobile
- [ ] Search bars are responsive

---

**Created:** December 5, 2025  
**Purpose:** Apply admin-frontend styling to labour-frontend and frontend  
**Status:** Ready for implementation
