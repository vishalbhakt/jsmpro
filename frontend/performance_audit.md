# Performance Audit Report

## 1. Summary
- **Project**: `jsm-erp-frontend` (Next.js 16, Turbopack) 
- **Current state**: Development server and backend are running. A production build (`npm run build`) is in progress; bundle size metrics will be added once the build completes.
- **UI components** added recently: LoadingSpinner, EmptyState, ConfirmationDialog, Toast (context based), Modal, FormField. All are lightweight and rely on **framer‑motion**, which is tree‑shakable and only loads the animation runtime when used.

## 2. Build & Bundle Analysis (Pending)
| Metric | Current Value | Target / Recommendation |
|--------|---------------|--------------------------|
| Total JavaScript bundle size | *awaiting build* | < 2 MB (gzipped) for initial page; split large libraries (e.g., `framer‑motion`) into separate chunks.
| Largest individual chunk | *awaiting build* | Keep under 300 KB (gzipped). Use dynamic imports for heavy components.
| Lighthouse Performance Score | *awaiting run* | Aim > 90.
| First Contentful Paint (FCP) | *awaiting run* | < 1 s on typical 3G.
| Largest Contentful Paint (LCP) | *awaiting run* | < 2.5 s.

**Next steps** once the build finishes:
1. Open the build log (`.next/trace`) or run `next build && next export && npx next-bundle-analyzer` to generate a detailed bundle‑size report.
2. Capture Lighthouse metrics (`next start` → Chrome DevTools) and add them to this report.

## 3. Component‑Level Performance Review
### 3.1 LoadingSpinner
- Uses `framer-motion` for a pure CSS‑like spin animation. No heavy images, minimal DOM.
- **Recommendation**: Export it as a **dynamic component** (`React.lazy`) if used only on a few pages, reducing its code from the main bundle.

### 3.2 EmptyState
- Simple markup, optional icon, uses `framer-motion` for fade‑in.
- **Recommendation**: Keep the icon as an SVG component to avoid extra network requests. If an icon library is used, import only the needed icons.

### 3.3 ConfirmationDialog & Modal
- Built on top of a shared `Modal` using `framer-motion` for overlay animation.
- **Recommendation**: Ensure the modal is **portal‑rendered** (already) to avoid re‑rendering large DOM trees. Consider lazy‑loading the modal component if it is rarely used.

### 3.4 Toast
- Context provider adds a global overlay (fixed). Uses `framer-motion` for entry/exit.
- **Recommendation**: Keep the provider at the top level (already) and ensure the toast container has `pointer-events:none` to avoid blocking clicks.

### 3.5 FormField components
- Simple, no extra dependencies. Use `clsx` for conditional classes (already in project).
- **Recommendation**: Re‑use the same component across all forms to reduce duplicated markup.

## 4. Asset & Image Optimization
- Switch static images to **Next.js `next/image`** for automatic lazy‑loading and WebP/AVIF conversion.
- Enable **image‑optimization** in `next.config.js` (set `images.domains` if external).
- Use **SVGO** to compress SVG assets used in EmptyState/Modals.

## 5. Code‑Splitting & Lazy Loading
- Add `dynamic` imports for **heavy UI parts** (e.g., dashboards, reports) that are not needed on the initial load.
```tsx
import dynamic from "next/dynamic";
const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <LoadingSpinner />, // show spinner while loading
});
```
- Leverage **React Server Components** for data‑heavy pages (Next 16 supports them) to reduce client bundle size.

## 6. Caching & CDN
- Configure **Cache‑Control** headers for static assets (`/static/**`) – `max‑age=31536000, immutable`.
- Deploy on a CDN (e.g., Vercel, Cloudflare) to serve static files with HTTP/2 push.
- Enable **gzip** and **Brotli** compression in the server (Node/Express) for all responses.

## 7. Font Loading
- Fonts are loaded via `@font-face` in `globals.css`. Use `font-display: swap` to avoid FOIT.
- Subset the fonts (only required glyphs) using tools like **glyphhanger**.

## 8. Runtime Performance
- **Avoid unnecessary re‑renders**: memoize heavy components (`React.memo`) and use Zustand selectors for shallow updates.
- **Avoid large objects in state**: keep Zustand store minimal; derive derived data in components.
- **Use `useCallback`/`useMemo`** for functions passed to child components (e.g., toast callbacks).

## 9. Monitoring & Continuous Auditing
- Integrate **Lighthouse CI** or **Web Vitals** library to collect real‑user metrics.
- Add a CI step that runs `next build && next lint && next build && next-bundle-analyzer` and fails if bundle size exceeds thresholds.
- Track **CLS, FID, TTFB** via `next/script` with `web-vitals` package.

---
**Next Action**: Once the build task completes, revisit this report, capture actual bundle size numbers and Lighthouse scores, and update the pending sections.
