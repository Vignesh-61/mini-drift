import * as THREE from 'three';
import { ObjectPool } from '../systems/Pool.js';
import { assetRegistry } from '../systems/AssetLoader.js';

export class Car {
  constructor(scene, roadHalfWidth = 5.0) {
    this.scene = scene;
    this.roadHalfWidth = roadHalfWidth;

    this.baseSpeed = 30;
    this.speed = this.baseSpeed;
    this.maxSpeed = 68;
    this.acceleration = 14;
    this.steering = 0;
    this.steeringStrength = 52;
    this.steeringResponsiveness = 18;
    this.drift = 0;
    this.friction = 0.89;
    this.lateralVelocity = 0;
    this.driftAngle = 0;
    this.isDrifting = false;
    this.crashed = false;

    this.wheelRotation = 0;
    this.suspensionTime = 0;
    this._smokeSpawnTimer = 0;

    this.mesh = new THREE.Group();
    this.position = this.mesh.position;

    this.bodyGroup = new THREE.Group();
    this.mesh.add(this.bodyGroup);

    this.wheels = [];
    this.frontWheelPivots = [];
    this.rearLightMat = null;

    this._buildCarMesh();
    this.scene.add(this.mesh);

    this._initParticlePool();
  }

  _buildCarMesh() {
    const customModel = assetRegistry.createInstance('player_car');
    if (customModel) {
      this.bodyGroup.add(customModel);
      return;
    }

    // Shield Mesh
    const shieldGeo = new THREE.SphereGeometry(1.65, 16, 16);
    const shieldMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      wireframe: true,
      transparent: true,
      opacity: 0.65,
    });
    this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
    this.shieldMesh.position.set(0, 0.6, 0);
    this.shieldMesh.visible = false;
    this.mesh.add(this.shieldMesh);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xff3b30,
      roughness: 0.35,
      metalness: 0.15,
      flatShading: true,
    });

    const stripeMat = new THREE.MeshStandardMaterial({
      color: 0xf8fafc,
      roughness: 0.4,
      flatShading: true,
    });

    const trimMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.7,
      flatShading: true,
    });

    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.2,
      metalness: 0.3,
      flatShading: true,
    });

    const wheelTireMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.85,
      flatShading: true,
    });

    const wheelRimMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.5,
      flatShading: true,
    });

    const headlightMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
    });

    this.rearLightMat = new THREE.MeshBasicMaterial({
      color: 0xdc2626,
    });

    const chassisGeo = new THREE.BoxGeometry(1.52, 0.52, 3.1);
    const chassis = new THREE.Mesh(chassisGeo, bodyMat);
    chassis.position.set(0, 0.48, 0);
    chassis.castShadow = true;
    chassis.receiveShadow = true;
    this.bodyGroup.add(chassis);

    const stripeGeo = new THREE.BoxGeometry(0.34, 0.53, 3.12);
    const stripe = new THREE.Mesh(stripeGeo, stripeMat);
    stripe.position.set(0, 0.485, 0);
    this.bodyGroup.add(stripe);

    const bumperGeo = new THREE.BoxGeometry(1.58, 0.2, 3.24);
    const bumper = new THREE.Mesh(bumperGeo, trimMat);
    bumper.position.set(0, 0.26, 0);
    this.bodyGroup.add(bumper);

    const cabinGeo = new THREE.BoxGeometry(1.26, 0.44, 1.55);
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.92, 0.12);
    cabin.castShadow = true;
    this.bodyGroup.add(cabin);

    const roofGeo = new THREE.BoxGeometry(1.18, 0.08, 1.35);
    const roof = new THREE.Mesh(roofGeo, bodyMat);
    roof.position.set(0, 1.15, 0.12);
    this.bodyGroup.add(roof);

    const wingBladeGeo = new THREE.BoxGeometry(1.48, 0.08, 0.32);
    const wingBlade = new THREE.Mesh(wingBladeGeo, trimMat);
    wingBlade.position.set(0, 0.94, 1.38);
    this.bodyGroup.add(wingBlade);

    const strutGeo = new THREE.BoxGeometry(0.08, 0.22, 0.18);
    const leftStrut = new THREE.Mesh(strutGeo, trimMat);
    leftStrut.position.set(-0.48, 0.8, 1.36);
    const rightStrut = new THREE.Mesh(strutGeo, trimMat);
    rightStrut.position.set(0.48, 0.8, 1.36);
    this.bodyGroup.add(leftStrut, rightStrut);

    const lightGeo = new THREE.BoxGeometry(0.28, 0.14, 0.08);
    const headLeft = new THREE.Mesh(lightGeo, headlightMat);
    headLeft.position.set(-0.5, 0.52, -1.55);
    const headRight = new THREE.Mesh(lightGeo, headlightMat);
    headRight.position.set(0.5, 0.52, -1.55);
    this.bodyGroup.add(headLeft, headRight);

    const beamGeo = new THREE.PlaneGeometry(0.65, 3.6);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0xfef08a,
      transparent: true,
      opacity: 0.14,
      depthWrite: false,
    });
    const beamLeft = new THREE.Mesh(beamGeo, beamMat);
    beamLeft.rotation.x = -Math.PI / 2;
    beamLeft.position.set(-0.5, 0.03, -3.4);
    const beamRight = new THREE.Mesh(beamGeo, beamMat);
    beamRight.rotation.x = -Math.PI / 2;
    beamRight.position.set(0.5, 0.03, -3.4);
    this.mesh.add(beamLeft, beamRight);

    const tailGeo = new THREE.BoxGeometry(0.34, 0.14, 0.08);
    const tailLeft = new THREE.Mesh(tailGeo, this.rearLightMat);
    tailLeft.position.set(-0.5, 0.54, 1.55);
    const tailRight = new THREE.Mesh(tailGeo, this.rearLightMat);
    tailRight.position.set(0.5, 0.54, 1.55);
    this.bodyGroup.add(tailLeft, tailRight);

    const tireGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.26, 12);
    tireGeo.rotateZ(Math.PI / 2);

    const rimGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.28, 8);
    rimGeo.rotateZ(Math.PI / 2);

    const wheelOffsets = [
      { x: -0.8, y: 0.32, z: -0.98, isFront: true },
      { x: 0.8, y: 0.32, z: -0.98, isFront: true },
      { x: -0.8, y: 0.32, z: 0.98, isFront: false },
      { x: 0.8, y: 0.32, z: 0.98, isFront: false },
    ];

    for (let i = 0; i < wheelOffsets.length; i++) {
      const info = wheelOffsets[i];
      const pivot = new THREE.Group();
      pivot.position.set(info.x, info.y, info.z);

      const wheelMesh = new THREE.Group();
      const tire = new THREE.Mesh(tireGeo, wheelTireMat);
      const rim = new THREE.Mesh(rimGeo, wheelRimMat);
      wheelMesh.add(tire, rim);

      pivot.add(wheelMesh);
      this.mesh.add(pivot);

      this.wheels.push(wheelMesh);
      if (info.isFront) {
        this.frontWheelPivots.push(pivot);
      }
    }
  }

  _initParticlePool() {
    const particleGeo = new THREE.BoxGeometry(0.26, 0.26, 0.26);
    const smokeMat = new THREE.MeshBasicMaterial({
      color: 0xe2e8f0,
      transparent: true,
      opacity: 0.65,
    });
    const sparkMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.95,
    });

    this.particlePool = new ObjectPool(
      () => {
        const mesh = new THREE.Mesh(particleGeo, smokeMat);
        mesh.visible = false;
        this.scene.add(mesh);
        return {
          mesh,
          vx: 0,
          vy: 0,
          vz: 0,
          life: 0,
          maxLife: 0.45,
          isSpark: false,
          smokeMat,
          sparkMat,
        };
      },
      (p) => {
        p.mesh.visible = false;
        p.life = 0;
      },
      48
    );
  }

  spawnSmoke(x, y, z) {
    const p = this.particlePool.acquire();
    p.isSpark = false;
    p.mesh.material = p.smokeMat;
    p.mesh.position.set(
      x + (Math.random() - 0.5) * 0.2,
      y,
      z + (Math.random() - 0.5) * 0.2
    );
    p.mesh.scale.setScalar(0.75);
    p.vx = (Math.random() - 0.5) * 1.8 - this.lateralVelocity * 0.15;
    p.vy = 0.8 + Math.random() * 0.9;
    p.vz = 2.0 + Math.random() * 2.5;
    p.life = 0;
    p.maxLife = 0.36 + Math.random() * 0.16;
    p.mesh.visible = true;
  }

  spawnCrashBurst() {
    for (let i = 0; i < 20; i++) {
      const p = this.particlePool.acquire();
      p.isSpark = i % 2 === 0;
      p.mesh.material = p.isSpark ? p.sparkMat : p.smokeMat;
      p.mesh.position.set(
        this.position.x + (Math.random() - 0.5) * 1.2,
        this.position.y + 0.5 + Math.random() * 0.5,
        this.position.z - 0.8 + (Math.random() - 0.5) * 1.2
      );
      p.mesh.scale.setScalar(p.isSpark ? 0.9 : 1.3);
      p.vx = (Math.random() - 0.5) * 14;
      p.vy = 3 + Math.random() * 8;
      p.vz = (Math.random() - 0.5) * 14;
      p.life = 0;
      p.maxLife = 0.5 + Math.random() * 0.35;
      p.mesh.visible = true;
    }
  }

  updateParticles(dt) {
    const active = this.particlePool.activeList;
    for (let i = active.length - 1; i >= 0; i--) {
      const p = active[i];
      p.life += dt;
      if (p.life >= p.maxLife) {
        this.particlePool.releaseAt(i);
        continue;
      }

      const progress = p.life / p.maxLife;
      p.mesh.position.x += p.vx * dt;
      p.mesh.position.y += p.vy * dt;
      p.mesh.position.z += p.vz * dt;
      if (p.isSpark) {
        p.vy -= 18 * dt;
        p.mesh.scale.setScalar(Math.max(0.1, (1 - progress) * 1.1));
      } else {
        p.mesh.scale.setScalar(0.6 + progress * 1.35);
      }
      p.mesh.rotation.x += 5 * dt;
      p.mesh.rotation.y += 4 * dt;
    }
  }

  reset() {
    this.position.set(0, 0, 0);
    this.mesh.rotation.set(0, 0, 0);
    this.bodyGroup.rotation.set(0, 0, 0);
    this.bodyGroup.position.set(0, 0, 0);

    this.speed = this.baseSpeed;
    this.steering = 0;
    this.drift = 0;
    this.lateralVelocity = 0;
    this.driftAngle = 0;
    this.isDrifting = false;
    this.crashed = false;
    this.particlePool.releaseAll();
  }

  applyCheckpointBoost() {
    this.speed = Math.min(this.maxSpeed, this.speed + 2.4);
  }

  update(dt, steerInput, driftInput, difficulty) {
    if (this.crashed) {
      this.updateParticles(dt);
      return;
    }

    const mult = this.speedMultiplier !== undefined ? this.speedMultiplier : 1.0;
    const targetCruiseSpeed = Math.min(
      this.maxSpeed,
      (this.baseSpeed + difficulty * 24 + (this.speed - this.baseSpeed) * 0.25) * mult
    );

    if (driftInput) {
      this.drift += (1 - this.drift) * Math.min(1, 10 * dt);
      const brakeTarget = Math.max(this.baseSpeed * 0.84, targetCruiseSpeed * 0.91);
      this.speed += (brakeTarget - this.speed) * Math.min(1, 5 * dt);
    } else {
      this.drift += (0 - this.drift) * Math.min(1, 8 * dt);
      if (this.speed < targetCruiseSpeed) {
        this.speed = Math.min(targetCruiseSpeed, this.speed + this.acceleration * dt);
      } else {
        this.speed += (targetCruiseSpeed - this.speed) * Math.min(1, 2 * dt);
      }
    }

    const driftSteerBoost = 1 + this.drift * 0.38;
    const targetSteering = steerInput * this.steeringStrength * driftSteerBoost;
    const steerLerp = Math.min(1, this.steeringResponsiveness * dt);
    this.steering += (targetSteering - this.steering) * steerLerp;

    this.lateralVelocity += this.steering * dt;

    const frameFriction = Math.pow(this.drift > 0.2 ? 0.045 : 0.004, dt);
    this.lateralVelocity *= frameFriction;

    this.position.x += this.lateralVelocity * dt;
    this.position.z -= this.speed * dt;

    if (this.position.x < -this.roadHalfWidth) {
      this.position.x = -this.roadHalfWidth;
      this.lateralVelocity = Math.max(0, this.lateralVelocity * -0.25);
    } else if (this.position.x > this.roadHalfWidth) {
      this.position.x = this.roadHalfWidth;
      this.lateralVelocity = Math.min(0, this.lateralVelocity * -0.25);
    }

    this.isDrifting = (driftInput && Math.abs(this.lateralVelocity) > 2.2) || Math.abs(this.lateralVelocity) > 10.5;

    const slipAngle = -this.lateralVelocity * (0.022 + this.drift * 0.024);
    const targetYaw = Math.max(-0.52, Math.min(0.52, slipAngle));
    this.driftAngle += (targetYaw - this.driftAngle) * Math.min(1, 14 * dt);
    this.mesh.rotation.y = this.driftAngle;

    const targetRoll = -this.lateralVelocity * 0.011;
    this.bodyGroup.rotation.z += (targetRoll - this.bodyGroup.rotation.z) * Math.min(1, 14 * dt);

    const targetPitch = driftInput ? -0.025 : 0.012;
    this.bodyGroup.rotation.x += (targetPitch - this.bodyGroup.rotation.x) * Math.min(1, 10 * dt);

    this.suspensionTime += dt * (this.speed * 0.75);
    this.bodyGroup.position.y = Math.sin(this.suspensionTime) * 0.018;

    this.wheelRotation -= (this.speed / 0.32) * dt;
    for (let i = 0; i < this.wheels.length; i++) {
      this.wheels[i].rotation.x = this.wheelRotation;
    }
    const frontSteerAngle = -steerInput * 0.38;
    for (let i = 0; i < this.frontWheelPivots.length; i++) {
      this.frontWheelPivots[i].rotation.y = frontSteerAngle;
    }

    if (this.rearLightMat) {
      this.rearLightMat.color.setHex(driftInput || this.isDrifting ? 0xff2222 : 0x991b1b);
    }

    if (this.isDrifting) {
      this._smokeSpawnTimer += dt;
      if (this._smokeSpawnTimer >= 0.032) {
        this._smokeSpawnTimer = 0;
        this.spawnSmoke(this.position.x - 0.68, 0.14, this.position.z + 1.15);
        this.spawnSmoke(this.position.x + 0.68, 0.14, this.position.z + 1.15);
      }
    }

    this.updateParticles(dt);
  }

  setShieldActive(active) {
    if (this.shieldMesh) {
      this.shieldMesh.visible = active;
    }
  }

  setInvisible(invisible) {
    this.bodyGroup.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.transparent = true;
        child.material.opacity = invisible ? 0.35 : 1.0;
      }
    });
  }
}
