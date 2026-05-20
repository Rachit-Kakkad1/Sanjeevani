# 🏥 Sanjeevani Frontend | Precision Medical Bill Analysis

[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Three.js](https://img.shields.io/badge/Three.js-r183-black?logo=three.js)](https://threejs.org/)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)

Welcome to the **Sanjeevani Frontend**, the state-of-the-art user interface for our AI-powered medical bill transparency and audit platform. This application provides a high-performance, visually stunning experience designed to empower users with clarity in their healthcare spending.

---

## 🚀 Overview

Sanjeevani Frontend is engineered for **transparency and impact**. By fusing modern web technologies with advanced data visualization, it transforms intimidating medical bills into clear, actionable insights through interactive dashboards, 3D spatial UI elements, and cinematic motion design.

## ✨ Key Features

-   **🔍 Intelligent Bill Parsing**: Seamless interface for uploading medical bills with real-time OCR status tracking.
-   **📊 Dynamic Analytics**: Interactive cost-trend analysis and department-wise breakdown powered by **Recharts**.
-   **🧊 3D Spatial UI**: Immersive data exploration using **React Three Fiber** for a next-gen dashboard experience.
-   **🎬 Cinematic UX**: Butter-smooth transitions and scroll-driven animations using **GSAP**, **Framer Motion**, and **Lenis**.
-   **⚖️ Audit Engine Interface**: Side-by-side comparison of billed vs. fair-market costs.
-   **💡 Proactive Insights**: AI-driven detection of duplicate charges, upcoding, and unbundled services.

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | **React 19** | Latest concurrent features for maximum responsiveness. |
| **Build Tool** | **Vite 8** | Lightning-fast HMR and optimized production bundling. |
| **Styling** | **Tailwind 4** | CSS-first configuration with high-performance jit compilation. |
| **3D Graphics** | **Three.js** | Powering `@react-three/fiber` and `@react-three/drei`. |
| **Animation** | **GSAP & Framer** | Professional-grade motion and micro-interactions. |
| **Data Viz** | **Recharts** | Composable and responsive charting components. |

---

## 📁 Project Structure

```text
frontend/
├── src/
│   ├── assets/             # Images, SVGs, and 3D assets
│   ├── components/         # Atomic and molecular UI components
│   │   ├── frames/         # Landing page storytelling segments
│   │   ├── insights/       # Specialized analysis views
│   │   ├── reports/        # Data-heavy reporting modules
│   │   └── upload/         # Processing and file handling UI
│   ├── pages/              # Composite views (Dashboard, etc.)
│   ├── utils/              # API clients (axios), hooks, and helpers
│   ├── App.jsx             # Main router and state orchestration
│   └── main.jsx            # Application bootstrap
├── public/                 # Static assets (favicons, manifest)
├── vite.config.js          # Vite configuration with API Proxy
└── package.json            # Manifest and dependencies
```

---

## 🚦 Getting Started

### Prerequisites
-   **Node.js**: v18.0.0+
-   **Backend**: Ensure the Sanjeevani API is running (defaults to `http://localhost:5000`)

### Installation & Development

1.  **Clone & Enter**:
    ```bash
    cd frontend
    ```

2.  **Install Dependencies**:
    ```bash
    npm install
    ```

3.  **Launch Dev Server**:
    ```bash
    npm run dev
    ```
    The UI will be accessible at `http://localhost:5173`. API requests are automatically proxied to the backend.

### Production Build

```bash
npm run build    # Generates optimized /dist folder
npm run preview  # Previews production build locally
```

---

## 🔌 API Proxying

The frontend is pre-configured to proxy `/api` and `/health` requests to `http://localhost:5000` during development, ensuring seamless communication with the Sanjeevani Backend without CORS hurdles.

---

<!-- ## 🤝 Contributing

This is a proprietary component of the Sanjeevani suite. Please refer to the root `CONTRIBUTING.md` for guidelines on UI/UX standards and component patterns. -->

---

## ⚖️ License

© 2026 Sanjeevani. All rights reserved. Proprietary and Confidential.

