export class ScoreManager {
  constructor() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.checkpointInterval = 250;
    this.nextCheckpointDistance = this.checkpointInterval;
    this.driftComboScore = 0;
    this.difficulty = 0;
    this.highScore = this._loadHighScore();
  }

  _loadHighScore() {
    try {
      const saved = window.localStorage.getItem('mini_drift_high_score');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  _saveHighScore() {
    try {
      window.localStorage.setItem('mini_drift_high_score', String(Math.floor(this.highScore)));
    } catch {}
  }

  reset() {
    this.score = 0;
    this.distance = 0;
    this.coins = 0;
    this.nextCheckpointDistance = this.checkpointInterval;
    this.driftComboScore = 0;
    this.difficulty = 0;
  }

  update(dt, speed, isDrifting) {
    const metersDelta = speed * dt;
    this.distance += metersDelta;

    const driftMultiplier = isDrifting ? 2.2 : 1.0;
    const framePoints = metersDelta * 1.4 * driftMultiplier;
    this.score += framePoints;

    if (isDrifting) {
      this.driftComboScore += metersDelta * 1.8;
    } else {
      this.driftComboScore = 0;
    }

    if (this.distance < 500) {
      this.difficulty = (this.distance / 500) * 0.3;
    } else if (this.distance < 1000) {
      this.difficulty = 0.3 + ((this.distance - 500) / 500) * 0.3;
    } else if (this.distance < 2000) {
      this.difficulty = 0.6 + ((this.distance - 1000) / 1000) * 0.3;
    } else {
      this.difficulty = Math.min(1.35, 0.9 + ((this.distance - 2000) / 2000) * 0.45);
    }

    let checkpointPassed = false;
    if (this.distance >= this.nextCheckpointDistance) {
      this.score += 100;
      this.nextCheckpointDistance += this.checkpointInterval;
      checkpointPassed = true;
    }

    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }

    return { checkpointPassed };
  }

  addCoin(isDrifting = false) {
    this.coins += 1;
    const bonus = isDrifting ? 50 : 25;
    this.score += bonus;
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }
    return bonus;
  }

  finalizeRun() {
    if (this.score > this.highScore) {
      this.highScore = Math.floor(this.score);
    }
    this._saveHighScore();
  }
}
