# PNS Management Dashboard - Design System

## Overview
A comprehensive design system for the PNS (Pegawai Negeri Sipil) management dashboard. Built with vanilla HTML, CSS, and JavaScript with Firebase/Firestore backend. Designed for government employee management with role-based access control, real-time data synchronization, and responsive mobile support.

**Tech Stack:** Firebase Compat API v12.11.0, Bootstrap Icons v1.11.3, XLSX v0.18.5, Vanilla JS

---

## Color Palette

### Primary Colors
- **Brand Blue:** `#1e40af` - Primary branding color
- **Cyan Blue:** `#0ea5e9` - Secondary accent, hover states
- **White:** `#ffffff` - Background, text on dark
- **Off-white:** `#f8fafc` - Subtle backgrounds

### Status Colors
- **Success (Aktif):** `#22c55e` - Active/operational status
- **Error (Meninggal):** `#ef4444` - Critical/deceased status
- **Warning (Pensiun):** `#f59e0b` - Cautionary/retired status

### Neutral Palette
- **Dark Text:** `#1f2937` - Primary text
- **Medium Text:** `#4b5563` - Secondary text
- **Light Text:** `#94a3b8` - Tertiary text, disabled
- **Light Gray:** `#cbd5e1` - Placeholders, borders
- **Border:** `#e2e8f0` - Card borders, dividers
- **Hover Gray:** `#f1f5f9` - Hover backgrounds

### CSS Variables (in main.css)
```css
:root {
  --brand: #1e40af;
  --brand-light: #0ea5e9;
  --success: #22c55e;
  --error: #ef4444;
  --warning: #f59e0b;
  --text: #1f2937;
  --text-secondary: #4b5563;
  --text-tertiary: #94a3b8;
  --border: #e2e8f0;
  --bg-light: #f8fafc;
  --card: #ffffff;
}
```

---

## Typography

### Font Stack
- **Primary Font:** Nunito (sans-serif)
- **Monospace Font:** DM Mono (for IDs, codes)
- **Fallback:** System fonts (Arial, sans-serif)

### Font Sizes & Weights
| Element | Size | Weight | Line-height |
|---------|------|--------|-------------|
| Page Title (h1) | 1.8rem | 600 | 1.3 |
| Section Title (h2) | 1.5rem | 600 | 1.3 |
| Subsection (h3) | 1.2rem | 600 | 1.3 |
| Label/Bold Text | 1rem | 600 | 1.5 |
| Body Text | 1rem | 400 | 1.5 |
| Small Text | 0.875rem | 400 | 1.4 |
| Extra Small | 0.75rem | 400 | 1.3 |
| Monospace (NIP) | 0.72rem | 400 | 1.3 |

---

## Spacing System

Use consistent spacing multiples of 0.25rem (4px base unit):

| Variable | Value | Usage |
|----------|-------|-------|
| xs | 0.25rem | Minimal gaps |
| sm | 0.5rem | Component padding |
| md | 1rem | Standard padding |
| lg | 1.5rem | Card padding, section gaps |
| xl | 2rem | Page margins, major gaps |

**Grid Gaps:**
- Dashboard grid: `gap: 0.4rem` (compact blocks)
- Cards: `gap: 1.5rem` (breathing room)
- Form blocks: `gap: 1rem` (section separation)

---

## Component Library

### Buttons

**Primary Button**
```html
<button class="btn-primary">
  <i class="bi bi-plus-circle"></i> Tambah
</button>
```
```css
.btn-primary {
  padding: 0.75rem 1.5rem;
  background: #1e40af;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: #1e3a8a;
  box-shadow: 0 4px 12px rgba(30, 64, 175, 0.3);
}

.btn-primary:active {
  transform: translateY(1px);
}
```

**Secondary Button**
```html
<button class="secondary">
  <i class="bi bi-download"></i> Export
</button>
```
```css
.secondary {
  padding: 0.75rem 1.5rem;
  background: #f1f5f9;
  color: #1e40af;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-family: 'Nunito', sans-serif;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.secondary:hover {
  background: #e2e8f0;
  border-color: #1e40af;
}
```

**Small Button (Table Actions)**
```html
<button class="secondary" style="padding: 0.38rem 0.6rem; font-size: 0.75rem;">
  <i class="bi bi-pencil"></i> Edit
</button>
```

### Cards & Containers

**Dashboard Block (Stats Card)**
```html
<div class="dashboard-block">
  <div class="block-header">
    <h2>Total PNS</h2>
  </div>
  <div class="block-body">
    <div class="block-count" id="stat-total-pns">0</div>
  </div>
</div>
```
```css
.dashboard-block {
  background: var(--card);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.9rem 1.2rem 0.8rem;
  border-bottom: 1px solid var(--border);
  background: var(--brand);
}

.block-header h2 {
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: #ffffff;
  margin: 0;
}

.block-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.block-count {
  font-size: 2.5rem;
  font-weight: 700;
  color: var(--brand);
  text-align: center;
}
```

**Generic Card**
```html
<div class="card">
  <div class="card-header">
    <h3>Card Title</h3>
  </div>
  <div class="card-body">
    Content here
  </div>
</div>
```
```css
.card {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.card-body {
  padding: 1.5rem;
}
```

### Form Elements

**Form Block Structure**
```html
<div class="form-block">
  <div class="form-block-title">Data Identitas</div>
  <div class="form-group">
    <label for="nip">NIP *</label>
    <input type="text" id="nip" maxlength="18" required>
  </div>
</div>
```
```css
.form-block {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.form-block:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-block-title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1e40af;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 1rem;
  font-family: 'Nunito', sans-serif;
  transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #0ea5e9;
  box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
}

.form-group input[readonly] {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
```

**Status Dropdown (Inline)**
```html
<select id="status-${id}" class="status-dropdown" 
  onchange="updatePnsStatus('${id}', this.value)" 
  style="padding: 0.4rem; border-radius: 4px; border: 1px solid var(--border); font-size: 0.85rem;">
  <option value="Aktif" selected>Aktif</option>
  <option value="Meninggal">Meninggal</option>
  <option value="Pensiun">Pensiun</option>
</select>
```

### Links & Actions

**Photo Link Button**
```html
<button onclick="showPhotoModal('${photoUrl}', '${nama}')" 
  title="Lihat Foto" 
  class="photo-link" 
  style="border: none; background: none; padding: 0; cursor: pointer;">
  <i class="bi bi-image"></i> Lihat
</button>
```
```css
.photo-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #eef2ff;
  color: #0ea5e9;
  border-radius: 4px;
  border: 1px solid #bfdbfe;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.photo-link:hover {
  background: #0ea5e9;
  color: white;
  border-color: #0284c7;
}
```

**WhatsApp Link**
```html
<a href="https://wa.me/${phoneNumber}" target="_blank" 
  title="Chat WhatsApp" 
  class="whatsapp-link">
  <i class="bi bi-whatsapp"></i> Chat
</a>
```
```css
.whatsapp-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: #dcfce7;
  color: #16a34a;
  border-radius: 4px;
  border: 1px solid #bbf7d0;
  text-decoration: none;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.whatsapp-link:hover {
  background: #16a34a;
  color: white;
  border-color: #15803d;
}
```

### Tables

**Table Structure**
```html
<div class="table-wrap">
  <div class="table-wrapper">
    <table>
      <thead>
        <tr>
          <th>Foto</th>
          <th>NIP</th>
          <th>Nama</th>
          <!-- more columns -->
        </tr>
      </thead>
      <tbody id="table-body">
        <!-- rows added dynamically -->
      </tbody>
    </table>
  </div>
</div>
```
```css
.table-wrap {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table-wrapper {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

table thead {
  background: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
}

table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #1f2937;
  white-space: nowrap;
}

table td {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e2e8f0;
  color: #4b5563;
}

table tbody tr:hover {
  background: #f8fafc;
}

table td.photo-cell {
  padding: 0.5rem !important;
  text-align: center;
}
```

### Modals

**Photo Modal**
```html
<div id="photo-modal" style="display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 9997; align-items: center; justify-content: center;">
  <div style="background: white; border-radius: 12px; padding: 2rem; max-width: 450px; width: 90%; box-shadow: 0 20px 60px rgba(0,0,0,0.3);">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
      <h2 id="photo-modal-name" style="color: #1e40af; margin: 0;">Foto</h2>
      <button onclick="closePhotoModal()" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #999;">&times;</button>
    </div>
    <img id="photo-modal-image" src="" alt="Foto" style="max-width: 100%; max-height: 500px; border-radius: 8px; object-fit: contain;">
  </div>
</div>
```

---

## Layout Patterns

### Dashboard Grid
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.4rem;
  align-items: start;
  margin-bottom: 2rem;
}

@media (max-width: 1200px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
```

### Sidebar Navigation
```css
.sidebar {
  width: 280px;
  background: #1e40af;
  color: white;
  overflow-y: auto;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
}

.app {
  display: flex;
  height: 100vh;
  background: #f8fafc;
}

.content {
  flex: 1;
  margin-left: 280px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .sidebar {
    position: absolute;
    left: -280px;
    transition: left 0.3s ease;
  }
  
  .sidebar.active {
    left: 0;
  }
  
  .content {
    margin-left: 0;
  }
}
```

---

## Responsive Breakpoints

| Device | Breakpoint | Columns | Actions |
|--------|-----------|---------|---------|
| Desktop | 1200px+ | 4 cols | Full layout |
| Tablet | 768px-1199px | 2-3 cols | Adjusted grid |
| Mobile | <768px | 1 col | Hamburger menu |

---

## Pagination Pattern

```html
<div id="pagination-controls">
  <div class="pagination-container">
    <button id="btn-prev-page" class="pagination-btn">← Sebelumnya</button>
    <span id="page-info" style="margin: 0 1rem;">Halaman 1</span>
    <button id="btn-next-page" class="pagination-btn">Berikutnya →</button>
  </div>
</div>
```

```javascript
const ROWS_PER_PAGE = 10;
let currentPage = 1;
let currentFilteredData = [];

function renderPaginatedData() {
  const start = (currentPage - 1) * ROWS_PER_PAGE;
  const end = start + ROWS_PER_PAGE;
  const pageData = currentFilteredData.slice(start, end);
  
  // Render pageData...
  
  const totalPages = Math.ceil(currentFilteredData.length / ROWS_PER_PAGE);
  document.getElementById('page-info').textContent = `Halaman ${currentPage} dari ${totalPages}`;
  document.getElementById('btn-prev-page').disabled = currentPage === 1;
  document.getElementById('btn-next-page').disabled = currentPage === totalPages;
}
```

---

## Common Patterns

### Real-time Data Loading
```javascript
function loadData() {
  if (!db) return;
  
  db.collection('collection-name').onSnapshot(function(snapshot) {
    let data = [];
    snapshot.forEach(function(doc) {
      data.push({ id: doc.id, ...doc.data() });
    });
    data.sort((a, b) => (a.field || '').localeCompare(b.field || ''));
    renderTable(data);
  });
}
```

### Form Submit Pattern
```javascript
form.addEventListener('submit', function(e) {
  e.preventDefault();
  
  const formData = {
    field1: document.getElementById('field1').value,
    field2: document.getElementById('field2').value,
  };
  
  if (editingId) {
    db.collection('name').doc(editingId).update(formData)
      .then(() => {
        form.reset();
        formCard.style.display = 'none';
        editingId = null;
      })
      .catch(err => alert('Error: ' + err.message));
  } else {
    db.collection('name').add(formData)
      .then(() => {
        form.reset();
        formCard.style.display = 'none';
      })
      .catch(err => alert('Error: ' + err.message));
  }
});
```

### Status/Role-Based Visibility
```javascript
function updateAdminUIVisibility() {
  const adminButtons = [
    document.getElementById('btn-add'),
    document.getElementById('btn-export'),
    document.getElementById('btn-import')
  ];
  
  adminButtons.forEach(btn => {
    if (btn) btn.style.display = currentUserIsAdmin ? 'inline-flex' : 'none';
  });
}
```

---

## Usage Guidelines

### When to Use Each Component
- **Primary Button:** Main actions (Save, Add, Submit)
- **Secondary Button:** Secondary actions (Cancel, Export, Import)
- **Photo Link:** Display image previews with modal
- **WhatsApp Link:** Contact actions with phone integration
- **Status Dropdown:** Inline editable fields with immediate save
- **Dashboard Block:** KPI/stat display with color coding
- **Card:** Container for grouped content
- **Table:** Paginated data display with actions

### Color Usage
- Use status colors consistently (Green=Aktif, Red=Meninggal, Orange=Pensiun)
- Primary blue for headings, primary buttons, links
- Cyan blue for secondary actions and hover states
- Neutral grays for borders, backgrounds, disabled states

### Spacing Rules
- Pad form groups with 1rem between inputs
- Separate major sections with 2rem
- Use 0.5rem gaps between compact elements
- Card padding should be 1.5rem minimum

### Typography Rules
- Use Nunito for all UI text
- Use DM Mono only for IDs and codes
- Titles should be uppercase with 0.09em letter-spacing
- Keep line-height at 1.3-1.5 for readability
- Maximum 65 characters per line for body text

---

## Implementation Checklist

- [ ] Include all CSS variables in :root
- [ ] Import Nunito and DM Mono fonts (via Google Fonts CDN)
- [ ] Include Bootstrap Icons v1.11.3
- [ ] Set up Firebase Compat API v12.11.0
- [ ] Implement responsive breakpoints for mobile
- [ ] Add transitions/animations for smooth UX (0.2s ease)
- [ ] Test on mobile, tablet, and desktop
- [ ] Verify color contrast (WCAG AA minimum)
- [ ] Test form validation and error states
- [ ] Implement accessibility features (labels, ARIA)

---

## Files Structure

```
public/
├── index.html          (All markup + inline styles + JS)
├── main.css            (Global styles + variables)
├── firebase-config.js  (Firebase initialization)
└── logotangsel.png     (Brand logo)
```

**Note:** For future projects, extract this design system to create a reusable template by:
1. Creating a base HTML template without specific data
2. Exporting CSS variables to a separate stylesheet
3. Creating component HTML snippets for each pattern
4. Documenting API integration points
