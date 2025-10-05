# Week 2 SEO Optimization - Implementation Guide

## 🎯 Overview

This guide provides step-by-step instructions to efficiently update all 42+ Gas Trade training unit pages with SEO-optimized content, proper navigation, and improved user experience.

## ✅ What's Already Complete

- [x] Unit content mapping document (`unit-content-map.md`)
- [x] CSS stylesheet for all new sections (`assets/css/unit-pages-seo.css`)
- [x] G3 units index page (`tssa-g3-units-index.html`)
- [x] G2 units index page (`tssa-g2-units-index.html`)
- [x] Homepage updated with links to unit index pages
- [x] Reusable template (`UNIT_PAGE_TEMPLATE.html`)

## 📋 Remaining Work

**42 unit pages** need to be updated with:
1. SEO-optimized title and meta tags
2. Breadcrumb navigation
3. Training navigation menu
4. Unit header with introduction
5. Related units section
6. Next steps CTAs
7. Study resources links
8. Standard disclaimer

---

## 🚀 Quick Start - 3 Step Process

### Step 1: Update Title and Meta Tags (in `<head>`)

Find these lines in each unit page:
```html
<title>CSA Unit [#] - [Name]</title>
```

**Replace with:**

**For G3 Units (1-9):**
```html
<title>Gas Trade Unit [#] - [Unit Name] | TSSA G3 Practice Test | CSA B149.1-25</title>
<meta name="description" content="Free Gas Trade Unit [#] practice questions for TSSA G3 certification. Study [brief topic] based on CSA B149.1-25 requirements. Ontario gas technician G3 exam prep.">
<meta name="keywords" content="TSSA G3 Unit [#], Gas Trade Unit [#], CSA B149.1-25, Ontario gas technician, G3 practice test, [topic keywords]">
```

**For G2 Units (10+):**
```html
<title>Gas Trade Unit [#] - [Unit Name] | TSSA G2 Advanced Exam Prep | CSA B149.1-25</title>
<meta name="description" content="Advanced Gas Trade Unit [#] for TSSA G2 certification. Master [brief topic] with CSA B149.1-25 compliant materials. Ontario G2 gas technician exam preparation.">
<meta name="keywords" content="TSSA G2 Unit [#], advanced gas technician, CSA B149.1-25, Ontario G2 certification, [topic keywords]">
```

**Also add CSS link in `<head>`:**
```html
<link rel="stylesheet" href="assets/css/unit-pages-seo.css">
```

### Step 2: Add Header Section (BEFORE existing `<h1>`)

1. Find the existing `<h1>` tag in the page (usually after logo/container div)
2. **INSERT** the entire header section from `UNIT_PAGE_TEMPLATE.html` **BEFORE** the `<h1>`
3. Replace all `[PLACEHOLDERS]` with actual content
4. **DO NOT DELETE** the existing `<h1>` - the template adds a new `<h1>` that will replace it visually

### Step 3: Add Footer Section (BEFORE `</body>`)

1. Scroll to the bottom of the page
2. Find the `</body>` tag
3. **INSERT** the entire footer section from `UNIT_PAGE_TEMPLATE.html` **BEFORE** `</body>`
4. Replace all `[PLACEHOLDERS]` with actual content

---

## 📝 Placeholder Reference Guide

### Universal Placeholders (All Units)

| Placeholder | Description | Example |
|-------------|-------------|---------|
| `[UNIT_NUMBER]` | Unit number | `1`, `2`, `13` |
| `[UNIT_NAME]` | Full unit name | `Safety`, `Tools, Fasteners and Testing Equipment` |
| `[UNIT_DESCRIPTION]` | Brief summary of unit | `essential safety protocols and procedures for gas technician work` |
| `[CSA_SECTIONS]` | Relevant CSA code sections | `B149.1-25 Section 2, 3` |

### G3-Specific Placeholders (Units 1-9)

| Placeholder | Value |
|-------------|-------|
| `[CERT_LEVEL]` | `G3` |
| `[CERT_LEVEL_LOWERCASE]` | `g3` |
| `[CERT_NAME]` | `Gas Technician 3 - Basic` |

### G2-Specific Placeholders (Units 10+)

| Placeholder | Value |
|-------------|-------|
| `[CERT_LEVEL]` | `G2` |
| `[CERT_LEVEL_LOWERCASE]` | `g2` |
| `[CERT_NAME]` | `Gas Technician 2 - Intermediate` |

### Navigation Placeholders

| Placeholder | Description | Where to Find |
|-------------|-------------|---------------|
| `[PREVIOUS_UNIT_URL]` | Link to previous unit | See Unit Order below |
| `[PREVIOUS_UNIT_NAME]` | Previous unit name | See unit-content-map.md |
| `[NEXT_UNIT_URL]` | Link to next unit | See Unit Order below |
| `[NEXT_UNIT_NAME]` | Next unit name | See unit-content-map.md |
| `[RELATED_UNIT_URL]` | Link to topically related unit | See Suggested Relations below |
| `[RELATED_UNIT_NAME]` | Related unit name | See unit-content-map.md |

---

## 📚 Unit Order and File Names

### G3 Units (Sequential Order 1-9)

| Unit | File Name | Previous Unit | Next Unit |
|------|-----------|---------------|-----------|
| 1 | `CSA_Unit_1_Safety_Chapter_Reviews.html` | None | Unit 2 |
| 2 | `CSA_Unit_2_Chapter_Reviews.html` | Unit 1 | Unit 3 |
| 3 | `CSA_Unit_3_Chapter_Reviews.html` | Unit 2 | Unit 4 |
| 4 | `CSA_Unit_4_&_4a_Chapter_Reviews.html` | Unit 3 | Unit 4a |
| 4a | `CSA_Unit_4_&_4a_Chapter_Reviews.html` | Unit 4 | Unit 5 |
| 5 | `CSA_Unit_5_Basic_Electricity_Chapter_Reviews.html` | Unit 4a | Unit 6 |
| 6 | `CSA_Unit_6_Technical_Drawing_Manuals_Graphs_Reviews.html` | Unit 5 | Unit 7 |
| 7 | `CSA_Unit_7_Customer_Relations_Chapter_Reviews.html` | Unit 6 | Unit 8 |
| 8 | `CSA_Unit_8_Intro_to_Piping_Reviews.html` | Unit 7 | Unit 9 |
| 9 | `CSA_Unit_9_Intro_to_Gas_Appliances_Reviews.html` | Unit 8 | Unit 10 |

### G2 Units

| Unit | File Name | Previous Unit | Next Unit |
|------|-----------|---------------|-----------|
| 10 | `CSA_Unit_10_Chapter_Reviews.html` | Unit 9 | Unit 11 |
| 13 | Located in `/training/g2/g2/` subdirectory | Unit 12 | Unit 14 |

---

## 🔗 Suggested Related Unit Relationships

### Thematic Connections

| Unit | Related Units (by topic) |
|------|-------------------------|
| Unit 1 (Safety) | Unit 2 (Tools) - safety equipment |
| Unit 2 (Tools) | Unit 8 (Piping) - piping tools |
| Unit 3 (Venting) | Unit 9 (Appliances) - appliance venting |
| Unit 4/4a (Codes) | Unit 8 (Piping) - code applications |
| Unit 5 (Electricity) | Unit 13 (Controls) - electrical controls |
| Unit 6 (Technical Drawing) | Unit 8 (Piping) - piping diagrams |
| Unit 8 (Intro Piping) | Unit 10 (Advanced Piping) - progression |
| Unit 9 (Intro Appliances) | Unit 13 (Controls) - appliance controls |
| Unit 10 (Advanced Piping) | Unit 8 (Intro Piping) - builds on |

---

## 🎨 Example: Complete Unit 1 Update

### BEFORE (Original)
```html
<title>CSA Unit 1 - Safety</title>
</head>
<body>
    <div class="container">
        <h1>Unit 1 - Safety</h1>
        <p class="subtitle">Chapter Review Questions</p>
        <!-- existing quiz content -->
    </div>
</body>
```

### AFTER (SEO Optimized)
```html
<title>Gas Trade Unit 1 - Safety | TSSA G3 Practice Test | CSA B149.1-25</title>
<meta name="description" content="Free Gas Trade Unit 1 practice questions for TSSA G3 certification. Study safety protocols and procedures based on CSA B149.1-25 requirements. Ontario gas technician G3 exam prep.">
<meta name="keywords" content="TSSA G3 Unit 1, Gas Trade Unit 1 safety, CSA B149.1-25, Ontario gas technician safety, G3 practice test">
<link rel="stylesheet" href="assets/css/unit-pages-seo.css">
</head>
<body>
    <div class="container">
        <!-- NEW: Header Section -->
        <div class="unit-header-section">
            <nav aria-label="breadcrumb" class="breadcrumb-nav">
                <a href="/">Home</a> >
                <a href="/tssa-g3-exam-prep.html">TSSA G3 Exam Prep</a> >
                <span>Gas Trade Unit 1: Safety</span>
            </nav>

            <div class="training-navigation">
                <a href="/">Home</a> |
                <a href="/tssa-g3-exam-prep.html">G3 Exam Prep</a> |
                <a href="/tssa-g2-exam-prep.html">G2 Exam Prep</a> |
                <a href="/tssa-g3-units-index.html">All G3 Units</a> |
                <a href="/tssa-g2-units-index.html">All G2 Units</a> |
                <a href="https://codecompassapp.netlify.app/" target="_blank">CSA Code Search</a>
            </div>

            <h1>Gas Trade Unit 1: Safety</h1>
            <h2 class="unit-subtitle">TSSA G3 Certification - Practice Questions & Chapter Reviews</h2>

            <div class="unit-intro-content">
                <p class="lead-text">Master Gas Trade Unit 1 with free CSA B149.1-25 compliant practice questions for the TSSA G3 certification exam. This unit covers essential safety protocols, workplace hazards, and emergency procedures for gas technician work.</p>

                <div class="certification-badge">
                    <strong>📋 Certification Level:</strong> TSSA G3 (Gas Technician 3 - Basic)
                </div>

                <div class="code-compliance-badge">
                    <strong>✅ Code Compliance:</strong> Aligned with CSA B149.1-25 and TSSA G3 requirements
                </div>
            </div>

            <!-- ... rest of header content ... -->
        </div>

        <!-- EXISTING: Keep original h1, subtitle, quiz content -->
        <h1>Unit 1 - Safety</h1>
        <p class="subtitle">Chapter Review Questions</p>
        <!-- existing quiz content stays unchanged -->
    </div>

    <!-- NEW: Footer Section (before </body>) -->
    <div class="unit-footer-sections">
        <!-- Related units, CTAs, resources, disclaimer -->
    </div>
</body>
```

---

## ⚡ Efficiency Tips

### Batch Processing Strategy

**Phase 1 - High Priority (Do First):**
1. Unit 1 (Safety) - Most fundamental
2. Unit 2 (Tools) - High traffic
3. Unit 4/4a (Codes) - SEO critical
4. Unit 3 (Venting) - Frequently searched

**Phase 2 - Core G3:**
5. Unit 5 (Electricity)
6. Unit 6 (Technical Drawing)
7. Unit 8 (Piping)
8. Unit 9 (Appliances)
9. Unit 7 (Customer Relations)

**Phase 3 - G2 Units:**
10. Unit 10 (Advanced Piping)
11. Unit 13 (Controls)
12. Additional G2 units as needed

### Quick Workflow

1. **Open Files:**
   - `UNIT_PAGE_TEMPLATE.html` (copy from)
   - `unit-content-map.md` (reference)
   - Target unit page (paste to)

2. **Find & Replace (use editor):**
   - Find: `[UNIT_NUMBER]` → Replace: `1` (or appropriate number)
   - Find: `[UNIT_NAME]` → Replace: `Safety` (or appropriate name)
   - Find: `[CERT_LEVEL]` → Replace: `G3` or `G2`
   - Continue for all placeholders

3. **Copy-Paste Sections:**
   - Header section → Insert before existing `<h1>`
   - Footer section → Insert before `</body>`

4. **Test:**
   - Open in browser
   - Check all links work
   - Verify responsive design on mobile

5. **Git Commit:**
   - Commit each unit or batch of units
   - Use descriptive commit messages

---

## 🧪 Testing Checklist

For each updated page, verify:

- [ ] Page loads without errors
- [ ] Title shows in browser tab with proper format
- [ ] Breadcrumb navigation links work
- [ ] Training navigation menu links work
- [ ] All internal links (Previous/Next/Related units) work
- [ ] External links open in new tabs
- [ ] CSS styles load correctly
- [ ] Mobile responsive (test on phone or narrow browser)
- [ ] All quiz/test functionality still works
- [ ] No duplicate headings or content

---

## 📊 Progress Tracking

Create a checklist file to track your progress:

```markdown
# Unit Page Update Progress

## G3 Units
- [ ] Unit 1: Safety
- [ ] Unit 2: Tools, Fasteners and Testing Equipment
- [ ] Unit 3: Venting and Combustion Air
- [ ] Unit 4: Codes and Regulations
- [ ] Unit 4a: Ontario Regulations
- [ ] Unit 5: Basic Electricity
- [ ] Unit 6: Technical Drawing, Manuals and Graphs
- [ ] Unit 7: Customer Relations
- [ ] Unit 8: Introduction to Piping
- [ ] Unit 9: Introduction to Gas Appliances

## G2 Units
- [ ] Unit 10: Advanced Piping Systems
- [ ] Unit 13: Controls
- [ ] (Additional G2 units as discovered)
```

---

## 🚨 Common Mistakes to Avoid

1. **Don't delete existing `<h1>` tags** - Template adds its own, but keep original for fallback
2. **Don't break existing quiz JavaScript** - Add sections around existing content
3. **Don't forget CSS link** - Page won't style correctly without it
4. **Don't use wrong cert level** - G3 vs G2 matters for SEO
5. **Don't skip testing links** - Broken links hurt SEO
6. **Check file paths** - Some G2 units may be in subdirectories

---

## 💡 Pro Tips

### SEO Optimization
- Use actual unit numbers in keywords (searches for "TSSA G3 Unit 2" are common)
- Include "practice test", "exam prep", "study guide" in descriptions
- Mention "Ontario" and "CSA B149.1-25" for local SEO
- Keep meta descriptions under 160 characters
- Use descriptive alt text if adding any images later

### Content Quality
- Be specific in chapter descriptions
- Link related units that genuinely help understanding
- Keep study tips practical and actionable
- Update exam coverage to reflect actual TSSA exams

### User Experience
- Ensure mobile navigation works smoothly
- Test on different browsers (Chrome, Firefox, Edge)
- Keep quiz functionality front and center
- Don't overwhelm with too many CTAs

---

## 📞 Need Help?

### Resources
- **Unit Content Mapping:** `unit-content-map.md`
- **CSS Styles:** `assets/css/unit-pages-seo.css`
- **Template:** `UNIT_PAGE_TEMPLATE.html`
- **G3 Index:** `tssa-g3-units-index.html`
- **G2 Index:** `tssa-g2-units-index.html`

### Common Questions

**Q: What if a unit has multiple chapter review files?**
A: Apply the template to the main "Chapter_Reviews.html" file first. Individual chapter files can be updated later with simplified headers.

**Q: What about units with "Complete_Training_Module.html" files?**
A: These can use the same template. They're comprehensive versions of the unit.

**Q: Some units don't have all chapters listed - what do I do?**
A: Check the actual page content for chapter titles, or list topics covered instead of formal chapters.

**Q: Unit 4 and 4a share the same file - how do I handle this?**
A: Make Unit 4 the "previous" for Unit 4a section, and Unit 4a the "next" for Unit 4 section. Both point to the same file but different content sections.

---

## 🎉 Success Metrics

After completion, you should have:

- ✅ 42+ unit pages with SEO-optimized content
- ✅ Consistent navigation across all pages
- ✅ Strong internal linking structure
- ✅ Improved Google search rankings for TSSA keywords
- ✅ Better user experience with clear next steps
- ✅ Professional disclaimer on all educational content

---

## 🔄 Git Workflow

### Recommended Commit Strategy

**Option 1 - Batch Commits (Faster):**
```bash
# After updating multiple units
git add CSA_Unit_1*.html CSA_Unit_2*.html CSA_Unit_3*.html
git commit -m "Week 2 SEO: Update Units 1-3 with navigation and CTAs"
git push
```

**Option 2 - Individual Commits (More detailed):**
```bash
# After each unit
git add CSA_Unit_1_Safety_Chapter_Reviews.html
git commit -m "Week 2 SEO: Update Unit 1 Safety with breadcrumbs, CTAs, and related units"
git push
```

**Final Commit After All Updates:**
```bash
git add -A
git commit -m "Week 2 SEO complete: All 42 unit pages updated with navigation, CTAs, and CSA compliance content

- Added breadcrumb navigation to all pages
- Added training navigation menu
- Updated all title/meta tags for TSSA SEO
- Added related units sections
- Added next steps CTAs
- Added study resources links
- Added standarddisclaimer to all pages
- Created unit index pages for G3 and G2
- Updated homepage with unit index links

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
git push
```

---

## 🎯 Final Checklist

Before considering Week 2 complete:

- [ ] All G3 units (1-9) updated
- [ ] All G2 units (10+) updated
- [ ] CSS file in place and linked
- [ ] Unit index pages created
- [ ] Homepage links to index pages
- [ ] All internal links tested
- [ ] Mobile responsive verified
- [ ] Quiz functionality still works
- [ ] Sitemap.xml updated (if applicable)
- [ ] Changes pushed to GitHub
- [ ] Live site tested

---

**Estimated Time:**
- Per unit: 15-20 minutes
- Total for 42 units: 10-14 hours
- Can be done over 2-3 days working 3-5 hours per day

**Good luck! You're building a comprehensive, SEO-optimized resource for Canadian gas technicians! 🚀**
