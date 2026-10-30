# FarsiMatrix 🚀
<div align="center">

<!-- FarsiMatrix Logo -->
<svg width="128" height="128" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect rx="6" width="24" height="24" fill="#006874" />
  <path d="M7 9h10M7 12h10M7 15h6" stroke="#ffffff" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>
  <circle cx="17" cy="15" r="1.5" fill="#4dd8ec" />
</svg>

### **Modern English ↔ Persian Vocabulary Learning & Spaced Repetition Platform**
**Designed with Google Material Design 3 (Material You) • Progressive Web App (PWA) • Zero DB Cost Architecture**

Over **250,000+ specialized terms** across **51 curated academic & technical domains**

[Live Web App](https://farsimatrix.ehsanjs.ir) • [Persian README (راهنمای فارسی)](README.fa.md) • [Developer Website](https://ehsanfazli.ir) • [GitHub Repository](https://github.com/TssHack/FarsiMatrix)

---

[![Next.js 16](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![Material Design 3](https://img.shields.io/badge/Material_Design-3-006874)](https://m3.material.io)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwind-css)](https://tailwindcss.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue?logo=typescript)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Offline_Ready-purple)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Database Cost](https://img.shields.io/badge/DB_Cost-Zero_Dollar-success)](#architecture--zero-db-cost)
[![License: MIT](https://img.shields.io/badge/License-MIT-lightgrey.svg)](LICENSE)

</div>

---

## 🌟 Overview

**FarsiMatrix** has evolved from a cloud-database dictionary API into an ultra-fast, local-first educational web application. By eliminating external cloud database dependencies (which historically caused heavy bandwidth bills and latency bottlenecks), FarsiMatrix now operates **100% serverless and offline** through optimized category chunking and client-side storage.

Equipped with an interactive **5-stage Leitner Box (Spaced Repetition)** system, instantaneous **native audio pronunciation**, and dynamic **4-option quiz generation**, FarsiMatrix empowers students, developers, and researchers to memorize and master English vocabulary effortlessly.

---

## ✨ Key Features

### 🎨 1. Google Material Design 3 (Material You)
- **Tonal Elevation System**: Replaces flat gray/white with expressive pastel surface layers (`surface-container-low`, `surface-container-high`, etc.).
- **Dynamic Dark & Light Mode**: Harmonious color palettes conforming strictly to WCAG 2.1 AA accessibility guidelines with a signature Teal/Cyan identity.
- **RTL & Typography First**: Premium Persian typography powered by Google’s **Vazirmatn** variable font paired seamlessly with clean Latin typefaces.
- **Responsive down to 360px**: Smooth experience on mobile phones, tablets, foldables, and large desktop screens.

### 📚 2. 51 Specialized Learning Domains (250K+ Words)
- **Computer Science & IT**: Computer Architecture, Algorithms & Data Structures, Information Technology, Internet & Protocols, Programming (VB/General), Computer Graphics, Domains, Modem Errors, Electronics 1-3.
- **Language & Conversation**: Essential English Words (504, 1100 Words TOEFL/IELTS), Everyday Idioms 1-3, Illustrated Idioms, Chat Slang, Common First Names.
- **Business & Leadership**: Management 1 & 2, Financial Accounting 1-3, Corporate Law & Jurisprudence.
- **Science & Medicine**: Mathematics, Statistics & Probability 1 & 2, Biology & Genetics, Astronomy, Physics & Chemistry, Dentistry, Medicinal Plants, Phobias.
- **Engineering**: Chemical, Industrial 1 & 2, Aviation & Aeronautics, Petroleum Drilling & Refining, Polymer, Textile, Soil Mechanics, Geology, Hydrogeology.
- **Arts & Media**: Cinema Production, Technical Cinematography, Screenwriting & Film Criticism.

### 🗂️ 3. Interactive 3D Leitner Box (Spaced Repetition System)
- **3D Card Flip**: Realistic perspective card animation triggered by click or keyboard `Space`.
- **Integrated Native Audio Engine**: Uses browser Web Speech API for real-time natural English pronunciation with zero network delay and zero API costs.
- **3-Tier Retention Rating**:
  - 🔴 **Hard / Forgot** (Key `1`) ➔ Returns to Box 1 for rapid review.
  - 🟡 **Medium / Unsure** (Key `2`) ➔ Retains current interval.
  - 🟢 **Easy / Mastered** (Key `3`) ➔ Promotes to higher Leitner boxes.
- **Keyboard Shortcuts**: `Space` (flip), `1`/`2`/`3` (rate), `S` (pronounce), `Arrow Keys` (next/prev).

### 🎯 4. Smart Quiz Generator
- Rapid 4-choice interactive tests: **English ➔ Persian** or **Persian ➔ English**.
- Realistic distractors dynamically pulled from the active category.
- Instant feedback, accuracy scoring, and celebration confetti on completion.
- Review incorrect answers with direct drill-down back into flashcards.

### 📱 5. Progressive Web App (PWA) & Local Storage
- Installable on Android, iOS, Windows, macOS, and Linux as a standalone desktop/mobile app.
- Full offline caching with custom service worker.
- Complete data privacy: All bookmarks, Leitner stages, and quiz history stay securely on the user's device with JSON backup/restore capability.

---

## 🏗️ Architecture & Zero DB Cost

```
┌────────────────────────────────────────────────────────┐
│                   FarsiMatrix Client                   │
│         (Next.js 16 + Tailwind CSS + Material 3)       │
└───────────────────────────┬────────────────────────────┘
                            │
            ┌───────────────┴───────────────┐
            ▼                               ▼
┌─────────────────────────┐     ┌────────────────────────┐
│  Chunked JSON Datasets  │     │   Client Local Store   │
│  (/public/data/groups/) │     │ (IndexedDB / LocalStg) │
│ • 51 Category files     │     │ • Leitner Box Stages   │
│ • Lightweight (~50KB)   │     │ • Starred Bookmarks    │
│ • Cached by ServiceWkr  │     │ • Daily Streak Tracker │
└─────────────────────────┘     └────────────────────────┘
```

1. **Category Chunking**: Instead of querying a monolithic 4-million row Postgres instance, the app loads only the category chosen by the user (e.g. `computer.json` is ~60 KB).
2. **Zero Recurring Infrastructure Fees**: Hosted as static/serverless on Vercel or Cloudflare with zero database server costs.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ or 20+
- npm, yarn, or pnpm

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/TssHack/FarsiMatrix.git
cd FarsiMatrix

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
farsimatrix/
├── public/
│   ├── manifest.json              # PWA Web App Manifest
│   ├── sw.js                      # Service Worker for offline support
│   ├── icons/                     # PWA maskable and standard icons
│   └── data/
│       ├── categories.json        # Manifest for 51 specialized categories
│       └── groups/                # JSON dictionaries per category
├── src/
│   ├── app/
│   │   ├── globals.css            # Material Design 3 tokens & 3D card CSS
│   │   ├── layout.tsx             # Root layout, Vazirmatn font & RTL setup
│   │   └── page.tsx               # Main application controller & state
│   ├── components/
│   │   ├── Navbar.tsx             # M3 Top App Bar & responsive bottom navigation
│   │   ├── CategoryExplorer.tsx   # Category browser, M3 filter chips & hero
│   │   ├── FlashcardMode.tsx      # 3D interactive flip card & Leitner logic
│   │   ├── QuizMode.tsx           # Multiple choice question generator
│   │   ├── WordListMode.tsx       # Comprehensive dictionary & quick search
│   │   ├── StatsView.tsx          # Progress report, streak & JSON backup/restore
│   │   ├── AboutModal.tsx         # Developer info, repo links & PWA install
│   │   └── DynamicIcon.tsx        # Dynamic Lucide icon mapper
│   ├── lib/
│   │   ├── speech.ts              # Browser Web Speech API pronunciation engine
│   │   └── storage.ts             # LocalStorage & Leitner progression manager
│   └── types/
│       └── index.ts               # TypeScript data models
└── scripts/
    ├── build_data.py              # Data sanitizer & category bundler
    └── generate_icons.py          # High-resolution PWA icon generator
```

---

## 👨‍💻 Author & Developer

- **Developer**: **Ehsan Fazli** (احسان فضلی)
- **Website**: [ehsanfazli.ir](https://ehsanfazli.ir)
- **GitHub**: [@tsshack](https://github.com/tsshack)
- **Telegram**: [@devehsan](https://t.me/devehsan)

---

## 📄 License
This project is open-source under the [MIT License](LICENSE).

<div align="center">
<small>Built with ❤️ for the Persian-speaking developer and learner community — FarsiMatrix</small>
</div>
