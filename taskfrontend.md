- `[x]` **Setup & Foundation**
  - `[x]` Install core animation and UI libraries (`framer-motion`, `lucide-react`, `recharts`, `sonner`)
  - `[x]` Update `globals.css` with Design System Tokens (Dark Theme Default, primary/accent colors)
  - `[x]` Add Glass System CSS classes (`.glass-card`, `.btn-primary` gradients, etc.)
  - `[x]` Configure Tailwind configuration (custom colors, animations, typography)

- `[x]` **Core Reusable Components (Micro-interactions)**
  - `[x]` Build **Button** components (Primary with sheen & hover translation, Ghost with faint fill)
  - `[x]` Build **Glass Card** container (backdrop-blur, subtle borders, shadows)
  - `[x]` Build **Input & Form** components (dark semi-transparent bg, focus rings, floating labels)
  - `[x]` Build **Status Badges** (Semantic colors, low-opacity bg, pulse animation for pending)
  - `[x]` Build **Page Transition Wrapper** (Framer Motion staggered fade-in)

- `[x]` **Layout Architecture**
  - `[x]` Create **Collapsible Sidebar** (`260px` to `72px`, active state glowing bar)
  - `[x]` Create **Sticky Topbar** (Glass background, profile dropdown, notification bell)
  - `[x]` Implement **Command Palette** (Cmd+K global search modal)

- `[x]` **Authentication Flow**
  - `[x]` Build **Login Page** with animated radial glow background
  - `[x]` Implement Login Form inside a Glass Card
  - `[x]` Add form validation shakes and button loading spinners

- `[x]` **Dashboard (Bento Box Interface)**
  - `[x]` Implement **Bento Box Grid Layout** for widgets
  - `[x]` Build **Metric Widgets** (Total, Pending, etc.) with skeleton shimmer loading states
  - `[x]` Implement **Leave Trends Area Chart** using `recharts` (gradient fill, glass tooltips)
  - `[x]` Implement **Analytics Charts** (Pie/Bar charts for departmental breakdown)
  - `[x]` Build **Data Table** (uppercase headers, faint row hover, `tabular-nums`)

- `[x]` **Interactive Modals & Notifications**
  - `[x]` Build **Apply Leave Modal / Side Sheet** (keeps context in dashboard)
  - `[x]` Implement **Animated Number Counter** for remaining leave balance
  - `[x]` Integrate `sonner` for global transient toast notifications (bottom-right)

- `[x]` **Accessibility & Polish**
  - `[x]` Ensure WCAG AA contrast ratios (muted text > `#64748B`)
  - `[x]` Implement keyboard focus rings (`outline-ring`)
  - `[x]` Add `prefers-reduced-motion` fallbacks for animations
