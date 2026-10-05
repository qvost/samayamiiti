<div align="center">

<img src="./favicon.svg" alt="Samayamiiti Logo" width="88" height="88" />

# Samayamiiti · समयमिति

A quiet, minimal dark-themed Nepali calendar, precision clock, date converter, and world time dashboard.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-samayamiiti.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://samayamiiti.vercel.app)
[![React](https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-0B1120?style=for-the-badge&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-1B1035?style=for-the-badge&logo=vite&logoColor=BD34FE)](https://vite.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-09090b?style=for-the-badge)](./LICENSE)

<br />

**[🌐 Experience the Live App →](https://samayamiiti.vercel.app)**

</div>

---

## ✨ Features

- **⏱ Precision Clock (नेपाल समय)**  
  Real-time Nepal Standard Time (**UTC+5:45**) with smooth second tracking, optional device-local timezone mode, 12-hour/24-hour switching, and full Nepali Devanagari numerals support (`२०८३`).
- **🔔 Ambient Soundscapes**  
  Synthesized Tibetan singing bowl chime on the hour and soft mechanical tick audio.
- **📅 Bikram Sambat (B.S.) Calendar**  
  Accurate Bikram Sambat monthly calendar grid featuring Hindu tithis, national holidays, festivals, and fast navigation across months and years.
- **🔄 Dual Date Converter**  
  Instant bi-directional conversion between Bikram Sambat (B.S.) and Gregorian (A.D.) calendar dates, complete with real-time relative distance calculation (*"X days ago"* or *"in X days"*).
- **🌍 Global World Clock**  
  Monitor simultaneous live times across key timezones (Kathmandu, New York, London, Tokyo, Sydney, Dubai) with offset calculations.
- **🌌 Immersive Ambient Fullscreen**  
  Hit <kbd>F</kbd> to immerse into a pure, distraction-free clock face featuring interactive dust particle physics that subtly react to cursor movement.
- **🖤 Refined Dark Aesthetics**  
  Crafted with an OLED pure black palette, GPU-rendered grain fields, frosted glassmorphism, and Apple-inspired spring physics.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| --- | --- |
| <kbd>F</kbd> | Toggle immersive fullscreen clock mode |
| <kbd>Esc</kbd> | Exit fullscreen mode |

---

## 🛠 Tech Stack

- **Framework:** [React 19](https://react.dev)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **Animation & Physics:** [Motion (Framer Motion)](https://motion.dev) & GSAP
- **Calendar & Conversion:** `nepali-date-converter` with custom Bikram Sambat ephemeris
- **Icons:** [Lucide Icons](https://lucide.dev)
- **Typography:** Geist & Geist Mono Variable
- **Tooling:** [Vite 8](https://vite.dev)
- **Hosting:** [Vercel](https://vercel.com)

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/qvost/samayamiiti.git
   cd samayamiiti
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

4. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🚢 Deployment

### Deploy with Vercel

The easiest way to deploy this project is via the [Vercel Platform](https://vercel.com/new?utm_source=github&utm_medium=readme&utm_campaign=samayamiiti):

1. Push your repository to GitHub.
2. Import the project on [Vercel](https://vercel.com/new).
3. The framework preset is automatically detected as **Vite**:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Click **Deploy**.

Alternatively, deploy directly from the command line:

```bash
npx vercel --prod
```

---

## 📄 License

This project is licensed under the [MIT License](./LICENSE).
