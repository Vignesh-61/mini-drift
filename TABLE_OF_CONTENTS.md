# 📚 Mini Drift 3D — Complete Master Table of Contents

This master index provides direct access to every core system, framework, physics concept, and UI module across the **Mini Drift 3D** codebase.

---

## 🏗️ 1. Core Frameworks & Libraries

- [1.1 Three.js WebGL Renderer](src/game.js#L76-L97)
  - `THREE.WebGLRenderer` initialization with antialiasing & shadow map config
  - Pixel ratio clamping (`Math.min(devicePixelRatio, 2)`) for high-DPI display optimization
- [1.2 Scene Lighting & Shadows](src/game.js#L99-L121)
  - `HemisphereLight` ambient ground/sky illumination
  - `DirectionalLight` with `PCFSoftShadowMap` real-time dynamic shadows
  - Directional target tracking matching car position
- [1.3 Vite Bundler & Dev Server](package.json)
  - HMR development server & production build pipeline
- [1.4 Tailwind CSS & HUD Overlay](index.html#L18-L184)
  - Semantic HTML flex layout with glassmorphism UI widgets (`backdrop-blur-md`)

---

## ⚙️ 2. Game Loop & State Machine

- [2.1 Delta-Time Calculation & FPS Telemetry](src/game.js#L208-L222)
  - Delta-time normalization and clamping (`0.001s` – `0.033s`)
  - Exponential moving average FPS calculation
- [2.2 Finite State Machine (FSM)](src/game.js#L248-L275)
  - State transitions: `START` → `COUNTDOWN` → `PLAYING` → `PAUSED` → `GAMEOVER`
- [2.3 Input Processing & Keybindings](src/systems/Input.js)
  - Event binding for `A/D`, `Arrows`, `Spacebar` (Drift), `P/Esc` (Pause), `R` (Restart), and touch swipe gestures

---

## ⚡ 3. Memory Management & Object Pooling

- [3.1 ObjectPool Architecture](src/systems/Pool.js)
  - Pre-warming pool allocation (`prewarm`)
  - `O(1)` swap-with-last deallocation (`releaseAt`) eliminating garbage collection (GC) sweeps
- [3.2 Particle System Pool](src/player/Car.js#L213-L249)
  - Particle pooling for drift tire smoke and crash sparks
- [3.3 Hazard & Power-up Object Pool](src/world/Obstacles.js#L25-L27)
  - Traffic cars, barriers, cones, coins, and power-up meshes pool management

---

## 🏎️ 4. Vehicle Physics & Drift Mechanics

- [4.1 Car Construction & Hierarchical Mesh](src/player/Car.js#L44-L211)
  - Low-poly body chassis, cabin, spoiler, headlights, tail-lights, and front wheel steering pivots
- [4.2 Lateral Velocity & Non-Linear Drift Friction](src/player/Car.js#L334-L380)
  - Steering accumulation and boost multipliers
  - Exponential tire friction decay: `Math.pow(drift ? 0.045 : 0.004, dt)`
- [4.3 Visual Body Sway, Pitch, and Roll](src/player/Car.js#L381-L395)
  - Yaw slip angle lerp alignment
  - Chassis roll into turns and pitch during braking/acceleration
  - Sine wave suspension sway (`Math.sin(suspensionTime)`)

---

## 🛣️ 5. Procedural World & Environment

- [5.1 Endless Road Segment Recycling](src/world/Road.js)
  - Modular road slab recycling along the negative Z-axis (`seg.position.z -= length * count`)
  - Checkpoint banner animations
- [5.2 Dynamic Environment Decor Spawner](src/world/Environment.js)
  - Low-poly roadside trees, street lamps, and terrain props
- [5.3 Obstacles & Power-Up Spawner System](src/world/Obstacles.js)
  - Dynamic traffic hazards spawner
  - Power-up items: 🧲 **Magnet**, ⛽ **Fuel**, ❤️ **Health**, 👻 **Invisibility**, 🛡️ **Shield**

---

## 🎯 6. Collision Detection & Survival Mechanics

- [6.1 Collision Processing Pipeline](src/systems/Collision.js)
  - Z-axis range filter
  - Axis-Aligned Bounding Box (AABB) & circle proximity checks
- [6.2 Survival Mechanics & Difficulty Scaling](src/systems/Score.js)
  - Health (100 HP) and Fuel (100%) drain rates
  - Continuous distance & drift combo score calculations
  - Progressive difficulty scaling based on distance driven

---

## 📹 7. Dynamic Camera & Audio Systems

- [7.1 Follow Camera System](src/camera/FollowCamera.js)
  - Smooth exponential follow lerping (`1 - Math.exp(-14 * dt)`)
  - Speed-dependent dynamic FOV widening and dynamic camera tilt on turn/drift
  - Procedural camera shake decay (`triggerShake`)
- [7.2 Web Audio API Procedural Sound Engine](src/audio/AudioManager.js)
  - Real-time engine acceleration pitch ramping
  - Tire screeching oscillators
  - White-noise synthesized crash explosion generator

---

## 🏆 8. Crash Lifecycle & Scorecard UI

- [8.1 Game-Over Scorecard Overlay](index.html#L240-L283)
  - Final score, distance driven, coins collected, personal best record
  - Performance Rank badge calculation (`S`, `A`, `B`, `C`, `D` Ranks)
- [8.2 UI Visibility & HUD Management](src/ui/UI.js#L56-L65)
  - `hideHUD()` and `showHUD()` methods concealing top header & touch controls on crash
- [8.3 Crash Flow & Instant Restart Prevention](src/game.js#L189-L205)
  - `scorecardInputLock` (`0.5s`) timer preventing accidental instant restart
  - Full game state reset on pressing **RESTART NEW GAME**

---

## 📄 Related Documentation Artifacts

- [Detailed Technical Concepts & Architecture Document](file:///C:/Users/Vignesh/.gemini/antigravity-ide/brain/5080926e-44d3-487c-bf3f-0a63c741dc5b/project_architecture_and_concepts.md)
- [Project Readme File](README.md)
