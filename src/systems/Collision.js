export class CollisionSystem {
  constructor() {
    this.carHalfWidth = 0.85;
    this.carHalfLength = 1.6;
    this.coinRadiusX = 1.95;
    this.coinRadiusZ = 2.35;
    this.powerUpRadiusX = 2.0;
    this.powerUpRadiusZ = 2.4;
  }

  check(car, obstacles, coins, powerUps, onCoinCollected, onPowerUpCollected) {
    const carX = car.position.x;
    const carZ = car.position.z;

    // 1. Check coin pickups
    if (coins) {
      for (let i = coins.length - 1; i >= 0; i--) {
        const coin = coins[i];
        if (coin.collected || (coin.userData && coin.userData.collected)) continue;

        const dx = Math.abs(carX - coin.mesh.position.x);
        const dz = Math.abs(carZ - coin.mesh.position.z);

        if (dx < this.coinRadiusX && dz < this.coinRadiusZ) {
          coin.collected = true;
          if (coin.userData) coin.userData.collected = true;
          onCoinCollected(coin, i);
        }
      }
    }

    // 2. Check power-up pickups
    if (powerUps) {
      for (let i = powerUps.length - 1; i >= 0; i--) {
        const pu = powerUps[i];
        if (pu.collected || (pu.userData && pu.userData.collected)) continue;

        const dx = Math.abs(carX - pu.mesh.position.x);
        const dz = Math.abs(carZ - pu.mesh.position.z);

        if (dx < this.powerUpRadiusX && dz < this.powerUpRadiusZ) {
          pu.collected = true;
          if (pu.userData) pu.userData.collected = true;
          onPowerUpCollected(pu, i);
        }
      }
    }

    // 3. Check obstacle collisions
    for (let i = 0; i < obstacles.length; i++) {
      const obs = obstacles[i];
      if (!obs.mesh.visible || obs.hitCooldown || (obs.userData && obs.userData.hitCooldown)) continue;

      const dx = Math.abs(carX - obs.mesh.position.x);
      const dz = Math.abs(carZ - obs.mesh.position.z);

      if (dz > this.carHalfLength + obs.halfLength + 0.4) continue;

      let isHit = false;
      if (obs.shape === 'circle') {
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (dist < obs.radius + this.carHalfWidth) {
          isHit = true;
        }
      } else {
        if (dx < this.carHalfWidth + obs.halfWidth && dz < this.carHalfLength + obs.halfLength) {
          isHit = true;
        }
      }

      if (isHit) {
        obs.hitCooldown = true;
        if (!obs.userData) obs.userData = {};
        obs.userData.hitCooldown = true;
        return obs;
      }
    }

    return null;
  }
}
