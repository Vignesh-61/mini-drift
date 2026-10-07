import * as THREE from 'three';
import { ObjectPool } from '../systems/Pool.js';

export const POWER_UP_TYPES = {
  MAGNET: 'MAGNET',
  FUEL: 'FUEL',
  HEALTH: 'HEALTH',
  INVISIBILITY: 'INVISIBILITY',
  SHIELD: 'SHIELD',
};

export class ObstaclesManager {
  constructor(scene) {
    this.scene = scene;
    this.lanes = [-3.4, 0, 3.4];

    this.activeObstacles = [];
    this.activeCoins = [];
    this.activePowerUps = [];
    this.activePopups = [];

    this.nextSpawnZ = -45;
    this.waveCounter = 0;

    this._initSharedAssets();
    this._initPools();
  }

  _initSharedAssets() {
    this.barrierGeo = new THREE.BoxGeometry(2.3, 0.95, 0.7);
    this.barrierStripeGeo = new THREE.BoxGeometry(2.34, 0.32, 0.74);
    this.barrierMat = new THREE.MeshStandardMaterial({
      color: 0xf97316,
      roughness: 0.5,
      flatShading: true,
    });
    this.whiteMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      flatShading: true,
    });

    this.coneGeo = new THREE.ConeGeometry(0.45, 1.15, 8);
    this.coneBaseGeo = new THREE.BoxGeometry(0.95, 0.12, 0.95);
    this.coneMat = new THREE.MeshStandardMaterial({
      color: 0xff5722,
      roughness: 0.4,
      flatShading: true,
    });

    this.rockGeo = new THREE.DodecahedronGeometry(0.98, 0);
    this.rockMat = new THREE.MeshStandardMaterial({
      color: 0x64748b,
      roughness: 0.8,
      flatShading: true,
    });

    this.trafficChassisGeo = new THREE.BoxGeometry(1.56, 0.58, 3.0);
    this.trafficCabinGeo = new THREE.BoxGeometry(1.3, 0.48, 1.5);
    this.trafficWheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.66, 10);
    this.trafficWheelGeo.rotateZ(Math.PI / 2);
    this.trafficMatBlue = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.4,
      flatShading: true,
    });
    this.trafficMatGreen = new THREE.MeshStandardMaterial({
      color: 0x34d399,
      roughness: 0.4,
      flatShading: true,
    });
    this.trafficDarkMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      flatShading: true,
    });
    this.tailLightMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });

    this.movingBlockGeo = new THREE.BoxGeometry(1.9, 1.25, 1.2);
    this.movingBlockMat = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.35,
      flatShading: true,
    });

    this.coinGeo = new THREE.CylinderGeometry(0.65, 0.65, 0.2, 12);
    this.coinGeo.rotateX(Math.PI / 2);
    this.coinMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.25,
      metalness: 0.45,
      emissive: 0x713f12,
      flatShading: true,
    });
  }

  _create3DMagnet() {
    const group = new THREE.Group();

    const redMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.35,
      metalness: 0.25,
      flatShading: true,
    });
    const silverMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.2,
      metalness: 0.85,
      flatShading: true,
    });
    const auraMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.45,
    });

    const arcGeo = new THREE.TorusGeometry(0.36, 0.12, 10, 16, Math.PI);
    const arc = new THREE.Mesh(arcGeo, redMat);
    arc.rotation.x = Math.PI;
    arc.position.y = 0.05;
    group.add(arc);

    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.45, 12);
    const leftLeg = new THREE.Mesh(legGeo, redMat);
    leftLeg.position.set(-0.36, 0.28, 0);

    const rightLeg = new THREE.Mesh(legGeo, redMat);
    rightLeg.position.set(0.36, 0.28, 0);

    const capGeo = new THREE.CylinderGeometry(0.125, 0.125, 0.22, 12);
    const leftCap = new THREE.Mesh(capGeo, silverMat);
    leftCap.position.set(-0.36, 0.6, 0);

    const rightCap = new THREE.Mesh(capGeo, silverMat);
    rightCap.position.set(0.36, 0.6, 0);

    const ringGeo = new THREE.TorusGeometry(0.65, 0.03, 8, 24);
    const aura = new THREE.Mesh(ringGeo, auraMat);
    aura.rotation.x = Math.PI / 2;
    aura.position.y = -0.12;

    group.add(leftLeg, rightLeg, leftCap, rightCap, aura);
    group.scale.setScalar(0.95);
    return group;
  }

  _create3DFuel() {
    const group = new THREE.Group();

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      roughness: 0.3,
      metalness: 0.25,
      flatShading: true,
    });
    const capMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.6,
      metalness: 0.4,
      flatShading: true,
    });
    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      roughness: 0.4,
      flatShading: true,
    });

    const bodyGeo = new THREE.BoxGeometry(0.72, 0.95, 0.44);
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.48;
    group.add(body);

    const handleGeo = new THREE.BoxGeometry(0.48, 0.08, 0.12);
    const handle = new THREE.Mesh(handleGeo, capMat);
    handle.position.set(0, 1.0, 0);

    const sup1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.12), capMat);
    sup1.position.set(-0.2, 0.94, 0);
    const sup2 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.12, 0.12), capMat);
    sup2.position.set(0.2, 0.94, 0);

    const capGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.16, 12);
    const cap = new THREE.Mesh(capGeo, capMat);
    cap.position.set(-0.22, 1.0, 0);

    const ribGeo = new THREE.BoxGeometry(0.52, 0.65, 0.47);
    const rib = new THREE.Mesh(ribGeo, trimMat);
    rib.position.y = 0.48;

    group.add(handle, sup1, sup2, cap, rib);
    group.scale.setScalar(0.95);
    return group;
  }

  _create3DHealth() {
    const group = new THREE.Group();

    const caseMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.25,
      metalness: 0.1,
      flatShading: true,
    });
    const crossMat = new THREE.MeshStandardMaterial({
      color: 0xef4444,
      roughness: 0.3,
      emissive: 0x7f1d1d,
      flatShading: true,
    });
    const latchMat = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.3,
      metalness: 0.7,
      flatShading: true,
    });

    const caseGeo = new THREE.BoxGeometry(0.85, 0.72, 0.42);
    const mainCase = new THREE.Mesh(caseGeo, caseMat);
    mainCase.position.y = 0.42;
    group.add(mainCase);

    const handleGeo = new THREE.BoxGeometry(0.36, 0.08, 0.12);
    const handle = new THREE.Mesh(handleGeo, latchMat);
    handle.position.set(0, 0.84, 0);
    group.add(handle);

    const vBarGeo = new THREE.BoxGeometry(0.18, 0.52, 0.46);
    const vBar = new THREE.Mesh(vBarGeo, crossMat);
    vBar.position.y = 0.42;

    const hBarGeo = new THREE.BoxGeometry(0.52, 0.18, 0.46);
    const hBar = new THREE.Mesh(hBarGeo, crossMat);
    hBar.position.y = 0.42;

    group.add(vBar, hBar);
    group.scale.setScalar(0.95);
    return group;
  }

  _create3DInvisibility() {
    const group = new THREE.Group();

    const orbMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.55,
      emissive: 0x0284c7,
    });
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xe0f2fe });
    const ringMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.75 });

    const orbGeo = new THREE.SphereGeometry(0.55, 16, 16);
    const orb = new THREE.Mesh(orbGeo, orbMat);
    orb.position.y = 0.55;
    group.add(orb);

    const coreGeo = new THREE.OctahedronGeometry(0.28, 0);
    const core = new THREE.Mesh(coreGeo, coreMat);
    core.position.y = 0.55;
    core.name = 'innerCore';
    group.add(core);

    const ringGeo = new THREE.TorusGeometry(0.75, 0.035, 8, 24);
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.y = 0.55;
    ring.rotation.x = Math.PI / 3;
    ring.name = 'orbitRing';
    group.add(ring);

    group.scale.setScalar(0.95);
    return group;
  }

  _create3DShield() {
    const group = new THREE.Group();

    const shieldMat = new THREE.MeshStandardMaterial({
      color: 0x2563eb,
      roughness: 0.2,
      metalness: 0.4,
      flatShading: true,
    });
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xfacc15,
      roughness: 0.2,
      metalness: 0.85,
      flatShading: true,
    });
    const emblemMat = new THREE.MeshBasicMaterial({ color: 0xfff08a });

    const plateGeo = new THREE.BoxGeometry(0.72, 0.75, 0.14);
    const plate = new THREE.Mesh(plateGeo, shieldMat);
    plate.position.y = 0.52;

    const tipGeo = new THREE.ConeGeometry(0.51, 0.42, 4);
    tipGeo.rotateY(Math.PI / 4);
    const tip = new THREE.Mesh(tipGeo, shieldMat);
    tip.position.set(0, 0.08, 0);

    const rimGeo = new THREE.TorusGeometry(0.58, 0.05, 8, 20);
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.48;

    const emblemGeo = new THREE.OctahedronGeometry(0.22, 0);
    const emblem = new THREE.Mesh(emblemGeo, emblemMat);
    emblem.position.set(0, 0.52, 0.1);

    group.add(plate, tip, rim, emblem);
    group.scale.setScalar(0.95);
    return group;
  }

  _createPowerUpMeshGroup() {
    const parentGroup = new THREE.Group();

    const meshes = {
      [POWER_UP_TYPES.MAGNET]: this._create3DMagnet(),
      [POWER_UP_TYPES.FUEL]: this._create3DFuel(),
      [POWER_UP_TYPES.HEALTH]: this._create3DHealth(),
      [POWER_UP_TYPES.INVISIBILITY]: this._create3DInvisibility(),
      [POWER_UP_TYPES.SHIELD]: this._create3DShield(),
    };

    for (const [typeKey, subMesh] of Object.entries(meshes)) {
      subMesh.name = typeKey;
      subMesh.visible = false;
      parentGroup.add(subMesh);
    }

    return { parentGroup, subMeshes: meshes };
  }

  _initPools() {
    this.pools = {
      barrier: new ObjectPool(() => this._createBarrierItem(), (item) => this._resetItem(item), 12),
      cone: new ObjectPool(() => this._createConeItem(), (item) => this._resetItem(item), 12),
      rock: new ObjectPool(() => this._createRockItem(), (item) => this._resetItem(item), 10),
      car: new ObjectPool(() => this._createTrafficCarItem(), (item) => this._resetItem(item), 10),
      moving_block: new ObjectPool(() => this._createMovingBlockItem(), (item) => this._resetItem(item), 8),
    };

    this.coinPool = new ObjectPool(
      () => {
        const mesh = new THREE.Mesh(this.coinGeo, this.coinMat);
        mesh.visible = false;
        this.scene.add(mesh);
        return {
          mesh,
          collected: false,
          userData: { collected: false },
          animTime: 0,
        };
      },
      (coin) => {
        coin.mesh.visible = false;
        coin.mesh.scale.setScalar(1);
        coin.collected = false;
        if (coin.userData) coin.userData.collected = false;
        coin.animTime = 0;
      },
      36
    );

    this.powerUpPool = new ObjectPool(
      () => {
        const { parentGroup, subMeshes } = this._createPowerUpMeshGroup();
        parentGroup.visible = false;
        this.scene.add(parentGroup);
        return {
          mesh: parentGroup,
          subMeshes,
          type: POWER_UP_TYPES.FUEL,
          collected: false,
          baseY: 0.85,
          animTime: 0,
          userData: { type: POWER_UP_TYPES.FUEL, collected: false },
        };
      },
      (pu) => {
        pu.mesh.visible = false;
        pu.mesh.scale.setScalar(1);
        pu.collected = false;
        pu.animTime = 0;
        if (pu.userData) pu.userData.collected = false;
      },
      16
    );
  }

  _resetItem(item) {
    item.mesh.visible = false;
    item.hitCooldown = false;
    if (!item.userData) item.userData = {};
    item.userData.hitCooldown = false;
  }

  _createBarrierItem() {
    const group = new THREE.Group();
    const block = new THREE.Mesh(this.barrierGeo, this.barrierMat);
    block.position.y = 0.48;
    block.castShadow = true;
    const stripe = new THREE.Mesh(this.barrierStripeGeo, this.whiteMat);
    stripe.position.y = 0.56;
    group.add(block, stripe);
    group.visible = false;
    this.scene.add(group);

    return {
      type: 'barrier',
      shape: 'box',
      mesh: group,
      halfWidth: 1.08,
      halfLength: 0.38,
      radius: 1.0,
      speed: 0,
      phase: 0,
      baseX: 0,
    };
  }

  _createConeItem() {
    const group = new THREE.Group();
    const offsets = [-0.46, 0.46];
    for (let i = 0; i < offsets.length; i++) {
      const base = new THREE.Mesh(this.coneBaseGeo, this.trafficDarkMat);
      base.position.set(offsets[i], 0.06, 0);
      const cone = new THREE.Mesh(this.coneGeo, this.coneMat);
      cone.position.set(offsets[i], 0.62, 0);
      cone.castShadow = true;
      group.add(base, cone);
    }
    group.visible = false;
    this.scene.add(group);

    return {
      type: 'cone',
      shape: 'box',
      mesh: group,
      halfWidth: 0.85,
      halfLength: 0.42,
      radius: 0.8,
      speed: 0,
      phase: 0,
      baseX: 0,
    };
  }

  _createRockItem() {
    const group = new THREE.Group();
    const rock = new THREE.Mesh(this.rockGeo, this.rockMat);
    rock.position.y = 0.68;
    rock.castShadow = true;
    group.add(rock);
    group.visible = false;
    this.scene.add(group);

    return {
      type: 'rock',
      shape: 'circle',
      mesh: group,
      halfWidth: 0.82,
      halfLength: 0.82,
      radius: 0.82,
      speed: 0,
      phase: 0,
      baseX: 0,
    };
  }

  _createTrafficCarItem() {
    const group = new THREE.Group();
    const mat = Math.random() > 0.5 ? this.trafficMatBlue : this.trafficMatGreen;

    const chassis = new THREE.Mesh(this.trafficChassisGeo, mat);
    chassis.position.y = 0.52;
    chassis.castShadow = true;

    const cabin = new THREE.Mesh(this.trafficCabinGeo, this.trafficDarkMat);
    cabin.position.set(0, 0.96, 0.1);

    const frontAxle = new THREE.Mesh(this.trafficWheelGeo, this.trafficDarkMat);
    frontAxle.position.set(0, 0.3, -0.95);
    const rearAxle = new THREE.Mesh(this.trafficWheelGeo, this.trafficDarkMat);
    rearAxle.position.set(0, 0.3, 0.95);

    const tailBar = new THREE.Mesh(new THREE.BoxGeometry(1.25, 0.14, 0.08), this.tailLightMat);
    tailBar.position.set(0, 0.58, 1.51);

    group.add(chassis, cabin, frontAxle, rearAxle, tailBar);
    group.visible = false;
    this.scene.add(group);

    return {
      type: 'car',
      shape: 'box',
      mesh: group,
      halfWidth: 0.76,
      halfLength: 1.45,
      radius: 1.1,
      speed: 14,
      phase: 0,
      baseX: 0,
    };
  }

  _createMovingBlockItem() {
    const group = new THREE.Group();
    const body = new THREE.Mesh(this.movingBlockGeo, this.movingBlockMat);
    body.position.y = 0.65;
    body.castShadow = true;

    const stripe = new THREE.Mesh(
      new THREE.BoxGeometry(1.94, 0.32, 1.24),
      this.trafficDarkMat
    );
    stripe.position.y = 0.65;

    group.add(body, stripe);
    group.visible = false;
    this.scene.add(group);

    return {
      type: 'moving_block',
      shape: 'box',
      mesh: group,
      halfWidth: 0.9,
      halfLength: 0.58,
      radius: 0.9,
      speed: 0,
      phase: 0,
      baseX: 0,
    };
  }

  reset() {
    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];
      this.pools[obs.type].release(obs);
    }
    this.activeObstacles.length = 0;

    this.coinPool.releaseAll();
    this.activeCoins.length = 0;

    this.powerUpPool.releaseAll();
    this.activePowerUps.length = 0;

    this.activePopups.length = 0;

    this.nextSpawnZ = -44;
    this.waveCounter = 0;

    for (let i = 0; i < 6; i++) {
      this._spawnWave(0);
    }
  }

  _spawnWave(difficulty) {
    this.waveCounter++;
    const z = this.nextSpawnZ;

    const spacing = Math.max(20, 30 - difficulty * 7.5);
    this.nextSpawnZ -= spacing;

    const safeLaneIndex = Math.floor(Math.random() * 3);
    const twoObstacleChance = Math.min(0.72, 0.22 + difficulty * 0.42);
    const numObstacles = Math.random() < twoObstacleChance ? 2 : 1;

    let spawnedCount = 0;
    for (let laneIdx = 0; laneIdx < 3; laneIdx++) {
      if (laneIdx === safeLaneIndex) continue;
      if (spawnedCount >= numObstacles) break;

      const type = this._pickObstacleType(difficulty, numObstacles === 1);
      const obs = this.pools[type].acquire();

      const laneX = this.lanes[laneIdx];
      obs.baseX = laneX;
      obs.phase = Math.random() * Math.PI * 2;
      obs.speed = type === 'car' ? 12 + Math.random() * 6 : 0;

      obs.mesh.position.set(laneX, 0, z + (Math.random() - 0.5) * 2.5);
      obs.mesh.rotation.set(0, type === 'rock' ? Math.random() * Math.PI : 0, 0);
      obs.mesh.visible = true;

      this.activeObstacles.push(obs);
      spawnedCount++;
    }

    // Spawn coins or a power-up in the safe lane
    if (Math.random() < 0.28) {
      // Spawn a 3D power-up
      const types = Object.values(POWER_UP_TYPES);
      const pType = types[Math.floor(Math.random() * types.length)];
      const pu = this.powerUpPool.acquire();
      pu.type = pType;
      pu.collected = false;
      pu.baseY = 0.85;
      pu.animTime = Math.random() * Math.PI * 2;
      pu.userData.type = pType;
      pu.userData.collected = false;

      // Make only the matching 3D power-up sub-mesh visible inside the parent group
      for (const [key, subMesh] of Object.entries(pu.subMeshes)) {
        subMesh.visible = key === pType;
      }

      pu.mesh.position.set(this.lanes[safeLaneIndex], 0.85, z);
      pu.mesh.rotation.set(0, 0, 0);
      pu.mesh.scale.setScalar(1);
      pu.mesh.visible = true;
      this.activePowerUps.push(pu);
    } else {
      const coinCount = 3 + (this.waveCounter % 2);
      const coinLaneX = this.lanes[safeLaneIndex];
      for (let c = 0; c < coinCount; c++) {
        const coin = this.coinPool.acquire();
        coin.collected = false;
        if (coin.userData) coin.userData.collected = false;
        coin.animTime = 0;
        coin.mesh.position.set(coinLaneX, 0.72, z - c * 3.2);
        coin.mesh.rotation.set(0, (z + c) * 0.4, 0);
        coin.mesh.scale.setScalar(1);
        coin.mesh.visible = true;
        this.activeCoins.push(coin);
      }
    }
  }

  _pickObstacleType(difficulty, singleInWave) {
    const r = Math.random();
    if (difficulty < 0.25) {
      if (r < 0.45) return 'barrier';
      if (r < 0.8) return 'cone';
      return 'rock';
    }
    if (difficulty < 0.6) {
      if (r < 0.3) return 'barrier';
      if (r < 0.55) return 'cone';
      if (r < 0.78) return 'rock';
      return 'car';
    }
    if (singleInWave && r > 0.72) {
      return 'moving_block';
    }
    if (r < 0.26) return 'barrier';
    if (r < 0.48) return 'cone';
    if (r < 0.68) return 'rock';
    return 'car';
  }

  collectCoin(coin, index) {
    if (coin.collected && !coin.mesh.visible) return;
    coin.collected = true;
    coin.mesh.visible = false;

    const last = this.activeCoins.pop();
    if (index < this.activeCoins.length) {
      this.activeCoins[index] = last;
    }

    this.coinPool.release(coin);
  }

  collectPowerUp(pu, index) {
    if (pu.collected && !pu.mesh.visible) return;
    pu.collected = true;
    pu.mesh.visible = false;

    const last = this.activePowerUps.pop();
    if (index < this.activePowerUps.length) {
      this.activePowerUps[index] = last;
    }

    this.powerUpPool.release(pu);
  }

  update(dt, carZ, difficulty) {
    while (this.nextSpawnZ > carZ - 175) {
      this._spawnWave(difficulty);
    }

    const recycleZ = carZ + 14;

    for (let i = this.activeObstacles.length - 1; i >= 0; i--) {
      const obs = this.activeObstacles[i];

      if (obs.type === 'car') {
        obs.mesh.position.z -= obs.speed * dt;
      } else if (obs.type === 'moving_block') {
        obs.phase += dt * 2.3;
        obs.mesh.position.x = Math.sin(obs.phase) * 3.2;
      }

      if (obs.mesh.position.z > recycleZ) {
        this.pools[obs.type].release(obs);
        const last = this.activeObstacles.pop();
        if (i < this.activeObstacles.length) {
          this.activeObstacles[i] = last;
        }
      }
    }

    for (let i = this.activeCoins.length - 1; i >= 0; i--) {
      const coin = this.activeCoins[i];
      coin.mesh.rotation.y += 3.2 * dt;

      if (coin.mesh.position.z > recycleZ) {
        this.coinPool.release(coin);
        const last = this.activeCoins.pop();
        if (i < this.activeCoins.length) {
          this.activeCoins[i] = last;
        }
      }
    }

    for (let i = this.activePowerUps.length - 1; i >= 0; i--) {
      const pu = this.activePowerUps[i];
      pu.animTime += dt;

      // Y-axis rotation and floating bobbing motion
      pu.mesh.rotation.y += 1.8 * dt;
      pu.mesh.position.y = pu.baseY + Math.sin(pu.animTime * 3.8) * 0.16;

      // Micro-animations for specific sub-elements
      const activeSubMesh = pu.subMeshes[pu.type];
      if (activeSubMesh) {
        const orbitRing = activeSubMesh.getObjectByName('orbitRing');
        if (orbitRing) {
          orbitRing.rotation.x += 2.5 * dt;
          orbitRing.rotation.z += 1.8 * dt;
        }
        const innerCore = activeSubMesh.getObjectByName('innerCore');
        if (innerCore) {
          innerCore.rotation.y += 3.5 * dt;
          innerCore.scale.setScalar(1 + Math.sin(pu.animTime * 5.0) * 0.15);
        }
      }

      if (pu.mesh.position.z > recycleZ) {
        this.powerUpPool.release(pu);
        const last = this.activePowerUps.pop();
        if (i < this.activePowerUps.length) {
          this.activePowerUps[i] = last;
        }
      }
    }

    for (let i = this.activePopups.length - 1; i >= 0; i--) {
      const coin = this.activePopups[i];
      coin.animTime += dt;
      coin.mesh.position.y += 6.5 * dt;
      coin.mesh.rotation.y += 14 * dt;
      const scale = Math.max(0.01, 1 + coin.animTime * 1.5 - coin.animTime * coin.animTime * 14);
      coin.mesh.scale.setScalar(scale);

      if (coin.animTime >= 0.24) {
        this.coinPool.release(coin);
        const last = this.activePopups.pop();
        if (i < this.activePopups.length) {
          this.activePopups[i] = last;
        }
      }
    }
  }
}
