# 🌙 Dark Mode Implementation Guide

## Overview
This document outlines the complete dark mode implementation for the College Events Portal. Dark mode is managed globally through CSS variables and the `Dark-Mode.js` script.

## CSS Variables Architecture

### Core Variables (Global-Dark-Mode.css)

#### Background Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--bg-primary` | #ffffff | #1e1e1e |
| `--bg-secondary` | #f5f5f5 | #2d2d2d |
| `--bg-tertiary` | #ffffff | #3d3d3d |

#### Text Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--text-primary` | #333333 | #ffffff |
| `--text-secondary` | #666666 | #d0d0d0 |
| `--text-tertiary` | #999999 | #b0b0b0 |

#### Border Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--border-color` | #ddd | #404040 |
| `--border-light` | #eeeeee | #505050 |

#### Component Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--card-bg` | #ffffff | #2d2d2d |
| `--input-bg` | #ffffff | #3d3d3d |
| `--input-text` | #333333 | #ffffff |
| `--input-border` | #cccccc | #505050 |

#### Button Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--button-primary` | #007bff | #0056b3 |
| `--button-hover` | #0056b3 | #004499 |
| `--button-green` | #28a745 | #218838 |
| `--button-green-hover` | #218838 | #1a6e2f |

#### Status Colors
| Variable | Light Mode | Dark Mode |
|----------|-----------|----------|
| `--success-color` | #4ade80 | #22c55e |
| `--danger-color` | #ff6b6b | #f87171 |
| `--warning-color` | #fbbf24 | #facc15 |

## Implementation Details

### 1. Global Application Flow
1. **Page Load**: `Dark-Mode.js` executes immediately and on `DOMContentLoaded`
2. **Load Preference**: `loadGlobalDarkMode()` checks localStorage for saved preference
3. **Apply Class**: Adds `dark-mode` class to `<body>` element if enabled
4. **CSS Variables**: Browser applies appropriate variable values from CSS

### 2. CSS Files with Dark Mode Support

#### Primary CSS Files (Updated with Variables)
- ✅ `Home Page.css` - All form inputs, buttons, cards use variables
- ✅ `Event Page.css` - Filter buttons, event cards, navigation use variables
- ✅ `Event Details.css` - Header, content panels use variables
- ✅ `My Registrations.html` - Back link, browse button, cancel button use variables
- ✅ `Settings.css` - Form elements, profile sections use variables
- ✅ `Login Page.css` - Input fields, buttons use variables
- ✅ `Sign Up.css` - Form elements, buttons use variables
- ✅ `About Page.css` - Content sections use variables
- ✅ `Contact Page.css` - Form elements, buttons use variables

#### Shared CSS File
- ✅ `Global-Dark-Mode.css` - Master CSS variables and default rules

### 3. JavaScript Integration

#### Dark-Mode.js Functions
```javascript
// Load dark mode on page load
function loadGlobalDarkMode() { ... }

// Toggle dark mode and update localStorage
function toggleGlobalDarkMode() { ... }
```

#### Usage in Settings.html
```javascript
// Settings page toggles dark mode
function handleDarkModeToggle() {
  toggleGlobalDarkMode();
  // Updates all pages instantly across sessions
}
```

## How Dark Mode Works

### Step 1: CSS Variable Definition
In `Global-Dark-Mode.css`:
```css
:root {
  --bg-primary: #ffffff;        /* Light mode */
  --button-primary: #007bff;
}

body.dark-mode {
  --bg-primary: #1e1e1e;        /* Dark mode */
  --button-primary: #0056b3;
}
```

### Step 2: CSS Application
In page CSS files (e.g., `Home Page.css`):
```css
.modal-content input[type="text"] {
  background: var(--input-bg);  /* Uses light or dark depending on body class */
  color: var(--input-text);
  border: 1px solid var(--input-border);
}
```

### Step 3: User Interaction
1. User toggles dark mode in Settings
2. `toggleGlobalDarkMode()` adds/removes `dark-mode` class from body
3. Preference saved to localStorage
4. Page refreshes apply saved preference automatically

## Testing Dark Mode

### Checklist for All Pages
- [ ] Light backgrounds are readable with light text
- [ ] Dark backgrounds are readable with dark text
- [ ] Form inputs are visible in both modes
- [ ] Buttons have appropriate contrast
- [ ] Cards/containers display properly
- [ ] Navigation bars are styled correctly
- [ ] Images maintain visibility
- [ ] Modal dialogs are readable

### Manual Testing Steps
1. Navigate to Settings page
2. Toggle dark mode ON
3. Visit each page and verify styling:
   - Home Page (check create event modal)
   - Event Page (check filter buttons and cards)
   - Event Details (check content panels)
   - My Registrations (check cancel button)
   - All other pages
4. Refresh page and verify preference persists
5. Clear localStorage and verify default mode loads

## Adding New Elements

### For New Form Inputs
```css
input[type="email"],
textarea,
select {
  background: var(--input-bg);
  color: var(--input-text);
  border: 1px solid var(--input-border);
}
```

### For New Buttons
```css
.new-button {
  background: var(--button-primary);
  color: white;
}

.new-button:hover {
  background: var(--button-hover);
}
```

### For New Containers
```css
.new-container {
  background: var(--card-bg);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}
```

## File Modifications Summary

### Created Files
- ✅ `Global-Dark-Mode.css` - Master CSS variables

### Modified Files
1. **Event Page.css**
   - Added `--button-primary`, `--button-hover`, `--button-green` variables
   - Updated `.filter-section button` to use `var(--button-primary)`
   - Updated `.event-content h3` to use `var(--button-primary)`
   - Updated `.event-stats` to use `var(--bg-secondary)`
   - Updated `.register-btn` to use `var(--button-green)`

2. **My Registrations.html & My Registrations.js**
   - Replaced hardcoded `#10b981` (green) with `var(--button-green)`
   - Added `.cancel-registration-btn` CSS class
   - Removed inline `onmouseover`/`onmouseout` handlers

3. **All HTML Pages**
   - Added `<link rel="stylesheet" href="Global-Dark-Mode.css">` reference

## Troubleshooting

### Dark Mode Not Applying
1. Verify Dark-Mode.js is loaded on page
2. Check localStorage: `localStorage.getItem('darkMode')`
3. Verify body has `dark-mode` class when enabled
4. Check browser console for errors

### Colors Not Changing
1. Ensure CSS files have variable definitions in `:root` and `body.dark-mode`
2. Verify page CSS imports come after `Global-Dark-Mode.css`
3. Check for `!important` overrides on hardcoded colors
4. Verify CSS selectors match actual HTML structure

### Persistence Issues
1. Check if localStorage is enabled in browser
2. Verify `localStorage.setItem()` is called in `toggleGlobalDarkMode()`
3. Check for privacy mode/incognito where localStorage may be disabled

## Future Enhancements

- [ ] Add theme selector (not just dark/light)
- [ ] Add custom color theme support
- [ ] Add automatic dark mode based on system preference (prefers-color-scheme)
- [ ] Add theme transition animations
- [ ] Create admin panel for theme customization
- [ ] Add export/import theme settings

## References
- See `Global-Dark-Mode.css` for complete variable list
- See `Dark-Mode.js` for implementation logic
- See individual page CSS files for component-specific styling

---
**Last Updated**: Current Session
**Status**: ✅ Complete - All pages now support dark mode with CSS variables
