import * as THREE from 'three';
import { Car } from './player/Car.js';
import { Road } from './world/Road.js';
import { Environment } from './world/Environment.js';
import { ObstaclesManager, POWER_UP_TYPES } from './world/Obstacles.js';
import { FollowCamera } from './camera/FollowCamera.js';
import { InputManager } from './systems/Input.js';
import { CollisionSystem } from './systems/Collision.js';
import { ScoreManager } from './systems/Score.js';
import { UIManager } from './ui/UI.js';
import { AudioManager } from './audio/AudioManager.js';

export class Game {
  constructor(container) {
    this.container = container;
    this.state = 'START';
    this.lastTimestamp = 0;

    this.fps = 60;
    this._fpsAlpha = 0.08;

    // Health & Fuel systems
    this.health = 100;
    this.maxHealth = 100;
    this.fuel = 100;
    this.maxFuel = 100;
    this.fuelDrainRate = 1.6;

    // Power-up timers & states
    this.magnetTimer = 0;
    this.invisibilityTimer = 0;
    this.shieldActive = false;

    // Collision damage cooldown
    this.nextDamageTime = 0;
    this.collisionDamage = 25;
    this.damageCooldown = 1000; // 1 second cooldown

    this._initSceneAndRenderer();
    this._initLighting();

    this.input = new InputManager();
    this.scoreManager = new ScoreManager();
    this.collision = new CollisionSystem();
    this.audio = new AudioManager();

    this.road = new Road(this.scene);
    this.environment = new Environment(this.scene);
    this.obstacles = new ObstaclesManager(this.scene);
    this.car = new Car(this.scene, 4.85);
    this.followCamera = new FollowCamera(window.innerWidth / Math.max(1, window.innerHeight));

    this.ui = new UIManager({
      onStart: () => this.startGame(),
      onRestart: () => this.restartGame(),
      onPause: () => this.pauseGame(),
      onResume: () => this.resumeGame(),
      onToggleAudio: () => {
        const enabled = this.audio.toggleMute();
        if (enabled) this.audio.playClick();
        return enabled;
      },
    });

    this._bindResize();
    this.resetWorld();
    this.ui.showStartScreen();

    this.countdownTimer = 0;
    this.currentCountdownStep = null;

    this._boundGameLoop = (ts) => this.gameLoop(ts);
    requestAnimationFrame(this._boundGameLoop);
  }

  _initSceneAndRenderer() {
    this.scene = new THREE.Scene();
    const skyColor = 0x0b0f19;
    this.scene.background = new THREE.Color(skyColor);
    this.scene.fog = new THREE.FogExp2(skyColor, 0.0115);

    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.appendChild(this.renderer.domElement);

    this.renderer.domElement.addEventListener('webglcontextlost', (e) => {
      e.preventDefault();
      this.audio.stopContinuous();
    });
  }

  _initLighting() {
    const hemiLight = new THREE.HemisphereLight(0xe0f2fe, 0x1e293b, 1.15);
    hemiLight.position.set(0, 40, 0);
    this.scene.add(hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffbeb, 1.6);
    this.dirLight.position.set(16, 28, 14);
    this.dirLight.castShadow = true;

    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 90;
    const d = 18;
    this.dirLight.shadow.camera.left = -d;
    this.dirLight.shadow.camera.right = d;
    this.dirLight.shadow.camera.top = d;
    this.dirLight.shadow.camera.bottom = -d;

    this.scene.add(this.dirLight);
    this.scene.add(this.dirLight.target);
  }

  _bindResize() {
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = Math.max(1, window.innerHeight);
      this.followCamera.updateAspect(width / height);
      this.renderer.setSize(width, height);
    });
  }

  resetWorld() {
    this.scoreManager.reset();
    this.car.reset();
    this.road.reset();
    this.environment.reset();
    this.obstacles.reset();
    this.followCamera.reset(this.car.position);

    this.health = 100;
    this.fuel = 100;
    this.magnetTimer = 0;
    this.invisibilityTimer = 0;
    this.shieldActive = false;
    this.nextDamageTime = 0;
    this.car.setShieldActive(false);
    this.car.setInvisible(false);

    this.ui.updateHUD(0, {
      score: 0,
      coins: 0,
      highScore: this.scoreManager.highScore,
      distance: 0,
      nextCheckpointDistance: this.scoreManager.nextCheckpointDistance,
      speed: this.car.speed,
      maxSpeed: this.car.maxSpeed,
      isDrifting: false,
      driftComboScore: 0,
      health: this.health,
      fuel: this.fuel,
      magnetTimer: this.magnetTimer,
      invisibilityTimer: this.invisibilityTimer,
      shieldActive: this.shieldActive,
    });
  }

  startGame() {
    if (this.state === 'PLAYING' || this.state === 'COUNTDOWN') return;
    this.audio.init();
    this.audio.playClick();
    this.resetWorld();
    this.state = 'COUNTDOWN';
    this.countdownTimer = 3.2;
    this.currentCountdownStep = null;
    this.ui.hideOverlays();
    this.ui.showHUD();
    this.input.consumeStartRequest();
    this.input.consumeRestartRequest();
  }

  restartGame() {
    this.audio.init();
    this.audio.playClick();
    this.resetWorld();
    this.state = 'COUNTDOWN';
    this.countdownTimer = 3.2;
    this.currentCountdownStep = null;
    this.ui.hideOverlays();
    this.ui.showHUD();
    this.input.consumeStartRequest();
    this.input.consumeRestartRequest();
  }

  crash() {
    if (this.state !== 'PLAYING') return;
    this.state = 'GAMEOVER';
    this.scorecardInputLock = 0.5; // Prevent instant accidental restart inputs during crash burst
    this.car.crashed = true;
    this.car.spawnCrashBurst();
    this.followCamera.triggerShake(0.75, 0.45);
    this.audio.playCrash();

    const currentScore = this.scoreManager.score;
    const oldHighScore = this.scoreManager.highScore;
    this.scoreManager.finalizeRun();
    const isNewHighScore = currentScore > oldHighScore && currentScore > 0;

    this.input.consumeStartRequest();
    this.input.consumeRestartRequest();

    this.ui.showGameOver({
      score: this.scoreManager.score,
      distance: this.scoreManager.distance,
      coins: this.scoreManager.coins,
      highScore: this.scoreManager.highScore,
      isNewHighScore,
    });
  }

  calculateDeltaTime(timestamp) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp;
      return 0.016;
    }
    const rawDt = (timestamp - this.lastTimestamp) / 1000;
    this.lastTimestamp = timestamp;

    if (rawDt > 0.001 && rawDt < 0.25) {
      const currentFps = 1 / rawDt;
      this.fps = this.fps * (1 - this._fpsAlpha) + currentFps * this._fpsAlpha;
    }

    return Math.min(Math.max(rawDt, 0.001), 0.033);
  }

  togglePause() {
    if (this.state === 'PLAYING') {
      this.pauseGame();
    } else if (this.state === 'PAUSED') {
      this.resumeGame();
    }
  }

  pauseGame() {
    if (this.state !== 'PLAYING') return;
    this.state = 'PAUSED';
    this.audio.playClick();
    this.audio.stopContinuous();
    this.ui.showPauseScreen();
  }

  resumeGame() {
    if (this.state !== 'PAUSED') return;
    this.lastTimestamp = 0;
    this.state = 'PLAYING';
    this.audio.playClick();
    this.ui.hidePauseScreen();
  }

  processInput() {
    this.input.processInput();

    if (this.input.consumeDebugToggle()) {
      this.ui.toggleDebug();
    }

    if (this.input.consumePauseToggle()) {
      this.togglePause();
      return;
    }

    if (this.state === 'START' && this.input.consumeStartRequest()) {
      this.startGame();
      return;
    }

    if (this.state === 'GAMEOVER') {
      if (this.scorecardInputLock <= 0) {
        if (this.input.consumeRestartRequest() || this.input.consumeStartRequest()) {
          this.restartGame();
        }
      } else {
        this.input.consumeRestartRequest();
        this.input.consumeStartRequest();
      }
      return;
    }

    if (this.state === 'PLAYING' && this.input.consumeRestartRequest()) {
      this.restartGame();
    }
  }

  updatePlayer(dt) {
    if (this.state === 'COUNTDOWN') {
      this.countdownTimer -= dt;
      let stepText = '';
      let isGo = false;
      if (this.countdownTimer > 2.2) {
        stepText = '3';
      } else if (this.countdownTimer > 1.2) {
        stepText = '2';
      } else if (this.countdownTimer > 0.2) {
        stepText = '1';
      } else if (this.countdownTimer > -0.3) {
        stepText = 'GO!';
        isGo = true;
      } else {
        this.state = 'PLAYING';
        this.ui.hideCountdown();
        this.input.consumeStartRequest();
        this.input.consumeRestartRequest();
        return;
      }

      if (stepText !== this.currentCountdownStep) {
        this.currentCountdownStep = stepText;
        this.ui.showCountdown(stepText);
        this.audio.playBeep(isGo);
      }

      this.car.suspensionTime += dt * 6;
      this.car.bodyGroup.position.y = Math.sin(this.car.suspensionTime) * 0.012;
    } else if (this.state === 'PLAYING') {
      // 1. Fuel drain
      this.fuel = Math.max(0, this.fuel - this.fuelDrainRate * dt);
      if (this.fuel <= 0) {
        this.fuel = 0;
        this.ui.showBanner('OUT OF FUEL!', 1.5);
        this.crash();
        return;
      }

      // 2. Fuel speed multiplier
      let speedMult = 1.0;
      if (this.fuel > 60) speedMult = 1.0;
      else if (this.fuel > 20) speedMult = 0.75;
      else speedMult = 0.4;
      this.car.speedMultiplier = speedMult;

      // 3. Power-up timers & effects
      if (this.magnetTimer > 0) {
        this.magnetTimer -= dt;
        if (this.magnetTimer <= 0) this.magnetTimer = 0;
        // Magnet pulls nearby coins
        for (let i = 0; i < this.obstacles.activeCoins.length; i++) {
          const coin = this.obstacles.activeCoins[i];
          if (!coin.collected && coin.mesh.position.distanceTo(this.car.position) < 8.5) {
            coin.mesh.position.lerp(this.car.position, 16 * dt);
          }
        }
      }

      if (this.invisibilityTimer > 0) {
        this.invisibilityTimer -= dt;
        if (this.invisibilityTimer <= 0) this.invisibilityTimer = 0;
        this.car.setInvisible(true);
      } else {
        this.car.setInvisible(false);
      }

      this.car.setShieldActive(this.shieldActive);

      this.car.update(dt, this.input.steer, this.input.drift, this.scoreManager.difficulty);

      const { checkpointPassed } = this.scoreManager.update(
        dt,
        this.car.speed,
        this.car.isDrifting
      );

      if (checkpointPassed) {
        this.car.applyCheckpointBoost();
        this.road.triggerCheckpointAnimation();
        this.followCamera.triggerShake(0.22, 0.2);
        this.audio.playCheckpoint();
        this.ui.showBanner('CHECKPOINT! +100', 1.35);
      }
    } else if (this.state === 'GAMEOVER') {
      if (this.scorecardInputLock > 0) {
        this.scorecardInputLock -= dt;
      }
      this.car.updateParticles(dt);
    } else if (this.state === 'START') {
      this.car.suspensionTime += dt * 6;
      this.car.bodyGroup.position.y = Math.sin(this.car.suspensionTime) * 0.012;
    }

    this.dirLight.position.set(this.car.position.x + 16, 28, this.car.position.z + 14);
    this.dirLight.target.position.set(this.car.position.x, 0, this.car.position.z - 10);
    this.dirLight.target.updateMatrixWorld();
  }

  updateRoad(dt) {
    this.road.update(dt, this.car.position.z);
    this.environment.update(this.car.position.z);
  }

  updateObstacles(dt) {
    if (this.state !== 'PLAYING') return;
    this.obstacles.update(dt, this.car.position.z, this.scoreManager.difficulty);
  }

  updateCollisions() {
    if (this.state !== 'PLAYING') return;

    const hitObstacle = this.collision.check(
      this.car,
      this.obstacles.activeObstacles,
      this.obstacles.activeCoins,
      this.obstacles.activePowerUps,
      (coin, index) => {
        this.obstacles.collectCoin(coin, index);
        const bonus = this.scoreManager.addCoin(this.car.isDrifting);
        this.audio.playCoin();
        this.ui.showBanner(`COIN +${bonus}`, 0.75);
      },
      (pu, index) => {
        this.obstacles.collectPowerUp(pu, index);
        this.audio.playCoin();
        switch (pu.type) {
          case POWER_UP_TYPES.FUEL:
            this.fuel = Math.min(100, this.fuel + 30);
            this.ui.showBanner('FUEL +30', 1.1);
            break;
          case POWER_UP_TYPES.HEALTH:
            this.health = Math.min(100, this.health + 25);
            this.ui.showBanner('HEALTH +25', 1.1);
            break;
          case POWER_UP_TYPES.MAGNET:
            this.magnetTimer = 8.0;
            this.ui.showBanner('MAGNET 8S', 1.1);
            break;
          case POWER_UP_TYPES.INVISIBILITY:
            this.invisibilityTimer = 6.0;
            this.ui.showBanner('INVISIBILITY 6S', 1.1);
            break;
          case POWER_UP_TYPES.SHIELD:
            this.shieldActive = true;
            this.ui.showBanner('SHIELD ACTIVE', 1.1);
            break;
        }
      }
    );

    if (hitObstacle) {
      if (this.invisibilityTimer > 0) {
        // Invisibility active: ignore damage
      } else if (this.shieldActive) {
        this.shieldActive = false;
        this.car.setShieldActive(false);
        hitObstacle.mesh.visible = false;
        this.audio.playCrash();
        this.followCamera.triggerShake(0.35, 0.25);
        this.ui.showBanner('SHIELD ABSORBED HIT!', 1.2);
      } else {
        const now = performance.now();
        if (now >= this.nextDamageTime) {
          this.nextDamageTime = now + this.damageCooldown;
          this.health -= this.collisionDamage;
          hitObstacle.mesh.visible = false;
          this.audio.playCrash();
          this.followCamera.triggerShake(0.65, 0.35);

          if (this.health <= 0) {
            this.health = 0;
            this.crash();
          } else {
            this.ui.showBanner(`DAMAGE! -${this.collisionDamage} HP`, 1.0);
          }
        }
      }
    }
  }

  updateCamera(dt) {
    this.followCamera.update(dt, this.car);
  }

  updateEffects(dt) {
    const speedRatio = Math.min(
      1,
      Math.max(0, (this.car.speed - this.car.baseSpeed) / (this.car.maxSpeed - this.car.baseSpeed))
    );

    this.audio.updateContinuous(
      speedRatio,
      this.car.isDrifting,
      this.state === 'PLAYING'
    );

    this.ui.updateHUD(dt, {
      score: this.scoreManager.score,
      coins: this.scoreManager.coins,
      highScore: this.scoreManager.highScore,
      distance: this.scoreManager.distance,
      nextCheckpointDistance: this.scoreManager.nextCheckpointDistance,
      speed: this.state === 'PLAYING' ? this.car.speed : 0,
      maxSpeed: this.car.maxSpeed,
      isDrifting: this.car.isDrifting,
      driftComboScore: this.scoreManager.driftComboScore,
      health: this.health,
      fuel: this.fuel,
      magnetTimer: this.magnetTimer,
      invisibilityTimer: this.invisibilityTimer,
      shieldActive: this.shieldActive,
    });

    this.ui.updateDebug({
      fps: this.fps,
      drawCalls: this.renderer.info.render.calls,
      triangles: this.renderer.info.render.triangles,
      geometries: this.renderer.info.memory.geometries,
      speed: this.car.speed,
    });
  }

  gameLoop(timestamp) {
    const dt = this.calculateDeltaTime(timestamp);

    this.processInput();

    if (this.state === 'PAUSED') {
      this.renderer.render(this.scene, this.followCamera.camera);
      requestAnimationFrame(this._boundGameLoop);
      return;
    }

    this.updatePlayer(dt);
    this.updateRoad(dt);
    this.updateObstacles(dt);
    this.updateCollisions();
    this.updateCamera(dt);
    this.updateEffects(dt);

    this.renderer.render(this.scene, this.followCamera.camera);

    requestAnimationFrame(this._boundGameLoop);
  }
}
