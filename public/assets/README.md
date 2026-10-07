# MINI DRIFT — Optional External 3D Assets

By default, **MINI DRIFT** generates all 3D meshes procedurally using lightweight Three.js primitives (`BoxGeometry`, `CylinderGeometry`, `PlaneGeometry`, `ConeGeometry`, `DodecahedronGeometry`) with zero network asset requests.

To swap in custom `.glb` / `.gltf` models later without changing gameplay code, load your model and register it with `assetRegistry` in `src/systems/AssetLoader.js`:

- `player_car`: Custom player vehicle mesh
- `obstacle_car`: Custom traffic vehicle mesh
- `coin`: Custom collectible coin mesh
