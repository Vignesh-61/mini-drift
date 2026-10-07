# Mini Drift — 3D Arcade Driving Game

A high-performance, low-poly 3D arcade driving game built with **Three.js** and **Vite**. Features responsive drift physics, dynamic hazard spawner, fuel & health survival mechanics, power-ups, and a dedicated post-crash Scorecard UI.

![Mini Drift](https://img.shields.io/badge/Three.js-r174-black?style=flat-square&logo=three.js)
![Vite](https://img.shields.io/badge/Vite-v8.3-646CFF?style=flat-square&logo=vite)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=flat-square&logo=javascript&logoColor=black)

---

## 🚗 Key Features

- **Drift Physics**: Smooth steering with lateral velocity slip and spacebar drift mechanics.
- **Survival Mechanics**: Manage **Health** (100 HP) and **Fuel** (100%) while navigating dense highway traffic and barriers.
- **Power-Ups & Collectibles**:
  - 🧲 **Magnet**: Pulls nearby gold coins automatically.
  - ⛽ **Fuel Canister**: Refills vehicle fuel supply.
  - ❤️ **Health Kit**: Restores damaged chassis HP.
  - 👻 **Invisibility**: Ghost phase through traffic and obstacles without taking damage.
  - 🛡️ **Shield**: Absorbs impact from collisions.
- **Checkpoint System**: Pass checkpoints to gain speed boosts, score bonuses, and increase difficulty.
- **Dedicated Scorecard UI**: On crash (`Health <= 0` or `Fuel <= 0`), view your final run stats including:
  - Final Score & Distance Driven
  - Coins Collected & Personal Best
  - Performance Rank (`S`, `A`, `B`, `C`, `D` ranks)
  - High-score record indicators
- **Arcade SFX & Audio**: Synthesized Web Audio SFX for acceleration, drift tire screeching, coin pickup, checkpoints, and crash bursts.

---

## 🎮 Controls

| Action | Keyboard | Touch / Mobile |
| :--- | :--- | :--- |
| **Steer Left / Right** | `A` / `D` or `Left` / `Right` Arrow | Touch Buttons / Swipe |
| **Brake / Drift** | `Spacebar` (Hold) | DRIFT Button |
| **Pause / Resume** | `P` or `Esc` | Pause Button |
| **Restart Game** | `R` Key | Restart Button |
| **Performance Stats** | `F3` or `~` | STATS Button |

---

## ⚡ Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+ recommended)

### Installation & Development

```bash
# 1. Clone the repository / open project directory
cd mini-drift

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5173` to play!

### Production Build

```bash
# Build production assets
npm run build

# Preview production build locally
npm run preview
```

---

## 🛠️ Built With

- **[Three.js](https://threejs.org/)** — 3D WebGL Rendering Engine
- **[Vite](https://vitejs.dev/)** — Frontend Build Tool & Dev Server
- **[TailwindCSS](https://tailwindcss.com/)** — UI & HUD Styling
- **Web Audio API** — Real-time Procedural & Synthesized Audio Effects
