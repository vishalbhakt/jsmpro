# Dashboard Audit

## Overview

This document provides an audit of the current dashboard implementation, covering:

- **Data sources** used by each widget
- **Permissions** applied to view specific sections
- **Performance** considerations and load times
- **Visual consistency** with the design system (colors, typography, spacing)
- **Potential improvements** and open issues

---

### 1. Data Sources
| Widget | API Endpoint | Model(s) | Frequency |
|--------|--------------|----------|-----------|
| Student Count | `/api/students/summary/` | `StudentProfile` | Real‑time |
| Payment Summary | `/api/payments/summary/` | `Payment`, `FeePlan` | Every 5 min |
| Attendance Overview | `/api/attendance/overview/` | `AttendanceSession` | Real‑time |
| Recent Announcements | `/api/communication/announcements/` | `Announcement` | Real‑time |

---

### 2. Permissions
| Role | Accessible Widgets |
|------|--------------------|
| Admin | All widgets |
| Teacher | Student Count, Attendance Overview, Recent Announcements |
| Student | Payment Summary (own), Recent Announcements |

---

### 3. Performance
- **Average load time:** ~1.2 s on a fresh page load (Chrome, throttled network). 
- **Heavy queries:** Payment summary aggregates across all fee plans; consider caching results for 1 min.
- **Static assets:** All CSS/JS bundles are minified and served with `Cache‑Control: max‑age=31536000`.

---

### 4. Visual Consistency
- **Color palette:** Uses the global theme from `design_system.css` – primary `#0066ff`, secondary `#ff6600`.
- **Typography:** All headings use the Google Font **Inter** (weights 400/600).
- **Spacing:** 8 px grid system applied consistently across card components.

---

### 5. Open Issues & Recommendations
- **Caching:** Implement Redis cache for the payment summary endpoint to reduce DB load.
- **Lazy loading:** Defer loading of the **Recent Announcements** section until the user scrolls into view.
- **Accessibility:** Add ARIA labels to chart canvas elements for screen‑reader support.
- **Error handling:** Show a user‑friendly fallback UI when any API request fails (currently a plain stack trace is displayed).

---

*Prepared by the audit team on `2026-06-29`.*
