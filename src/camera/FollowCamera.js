import * as THREE from 'three';

export class FollowCamera {
  constructor(aspect) {
    this.baseFov = 58;
    this.camera = new THREE.PerspectiveCamera(this.baseFov, aspect, 0.5, 220);

    this.offsetY = 4.1;
    this.offsetZ = 7.2;

    this.currentLookAt = new THREE.Vector3(0, 0.8, -12);
    this.shakeIntensity = 0;
    this.shakeTimer = 0;
    this.aspect = aspect;

    this.updateAspect(aspect);
  }

  updateAspect(aspect) {
    this.aspect = aspect;
    this.camera.aspect = aspect;

    if (aspect < 0.75) {
      this.offsetY = 5.2;
      this.offsetZ = 9.2;
      this.baseFov = 64;
    } else if (aspect < 1.1) {
      this.offsetY = 4.6;
      this.offsetZ = 8.0;
      this.baseFov = 60;
    } else {
      this.offsetY = 4.0;
      this.offsetZ = 7.0;
      this.baseFov = 58;
    }

    this.camera.updateProjectionMatrix();
  }

  triggerShake(intensity = 0.55, duration = 0.4) {
    this.shakeIntensity = intensity;
    this.shakeTimer = duration;
  }

  reset(carPosition) {
    this.shakeIntensity = 0;
    this.shakeTimer = 0;
    this.camera.position.set(
      carPosition.x * 0.7,
      carPosition.y + this.offsetY,
      carPosition.z + this.offsetZ
    );
    this.currentLookAt.set(carPosition.x * 0.5, carPosition.y + 0.9, carPosition.z - 14);
    this.camera.lookAt(this.currentLookAt);
    this.camera.rotation.z = 0;
  }

  update(dt, car) {
    const pos = car.position;
    const speedRatio = Math.min(1, Math.max(0, (car.speed - car.baseSpeed) / (car.maxSpeed - car.baseSpeed)));

    const followSmoothing = 1 - Math.exp(-14 * dt);
    const dynamicZ = this.offsetZ + speedRatio * 0.65 + (car.isDrifting ? 0.35 : 0);
    const targetX = pos.x * 0.76;
    const targetY = pos.y + this.offsetY;
    const targetZ = pos.z + dynamicZ;

    this.camera.position.x += (targetX - this.camera.position.x) * followSmoothing;
    this.camera.position.y += (targetY - this.camera.position.y) * followSmoothing;
    this.camera.position.z = targetZ;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      const decay = Math.max(0, this.shakeTimer / 0.4);
      const mag = this.shakeIntensity * decay;
      this.camera.position.x += (Math.random() - 0.5) * mag;
      this.camera.position.y += (Math.random() - 0.5) * mag;
    }

    const lookTargetX = pos.x * 0.55 + car.lateralVelocity * 0.08;
    const lookTargetY = pos.y + 0.85;
    const lookTargetZ = pos.z - 15;

    this.currentLookAt.x += (lookTargetX - this.currentLookAt.x) * followSmoothing;
    this.currentLookAt.y += (lookTargetY - this.currentLookAt.y) * followSmoothing;
    this.currentLookAt.z = lookTargetZ;

    this.camera.lookAt(this.currentLookAt);

    const targetTilt = -car.lateralVelocity * 0.0045 - (car.isDrifting ? car.steering * 0.018 : 0);
    this.camera.rotation.z += (targetTilt - this.camera.rotation.z) * (1 - Math.exp(-10 * dt));

    const targetFov = this.baseFov + speedRatio * 10 + (car.isDrifting ? 3.5 : 0);
    if (Math.abs(targetFov - this.camera.fov) > 0.05) {
      this.camera.fov += (targetFov - this.camera.fov) * (1 - Math.exp(-8 * dt));
      this.camera.updateProjectionMatrix();
    }
  }
}
