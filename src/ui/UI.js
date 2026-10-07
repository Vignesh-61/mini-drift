export class UIManager {
  constructor({ onStart, onRestart, onToggleAudio, onPause, onResume }) {
    this.elHudBar = document.getElementById('hud-bar');
    this.elTouchControls = document.getElementById('touch-controls');

    this.elScore = document.getElementById('hud-score');
    this.elCoins = document.getElementById('hud-coins');
    this.elBest = document.getElementById('hud-best');
    this.elSpeed = document.getElementById('hud-speed');
    this.elSpeedBar = document.getElementById('hud-speed-bar');
    this.elDistance = document.getElementById('hud-distance');
    this.elNextCp = document.getElementById('hud-next-cp');
    this.elBanner = document.getElementById('hud-banner');

    this.elStartScreen = document.getElementById('start-screen');
    this.elGameOverScreen = document.getElementById('gameover-screen');
    this.elCountdownScreen = document.getElementById('countdown-screen');
    this.elCountdownText = document.getElementById('countdown-text');
    this.elPauseScreen = document.getElementById('pause-screen');

    this.elFinalScore = document.getElementById('final-score');
    this.elFinalDistance = document.getElementById('final-distance');
    this.elFinalCoins = document.getElementById('final-coins');
    this.elFinalBest = document.getElementById('final-best');

    this.elBtnStart = document.getElementById('btn-start');
    this.elBtnRestart = document.getElementById('btn-restart');
    this.elBtnPause = document.getElementById('btn-pause');
    this.elBtnResume = document.getElementById('btn-resume');
    this.elBtnPauseRestart = document.getElementById('btn-pause-restart');
    this.elBtnAudio = document.getElementById('btn-audio');
    this.elBtnDebug = document.getElementById('btn-debug');

    this.elDebugPanel = document.getElementById('debug-panel');
    this.elDbgFps = document.getElementById('dbg-fps');
    this.elDbgCalls = document.getElementById('dbg-calls');
    this.elDbgTris = document.getElementById('dbg-tris');
    this.elDbgObjs = document.getElementById('dbg-objs');
    this.elDbgSpeed = document.getElementById('dbg-speed');

    this.elHealthBar = document.getElementById('hud-health-bar');
    this.elHealthText = document.getElementById('hud-health-text');
    this.elFuelBar = document.getElementById('hud-fuel-bar');
    this.elFuelText = document.getElementById('hud-fuel-text');
    this.elPowerups = document.getElementById('hud-powerups');

    this._lastScore = -1;
    this._lastCoins = -1;
    this._lastBest = -1;
    this._lastSpeed = -1;
    this._lastDistanceText = '';
    this._lastNextCpText = '';
    this._bannerTimer = 0;

    this.debugVisible = false;

    this._bindButtons({ onStart, onRestart, onToggleAudio, onPause, onResume });
  }

  hideHUD() {
    if (this.elHudBar) this.elHudBar.classList.add('hidden');
    if (this.elTouchControls) this.elTouchControls.classList.add('hidden');
  }

  showHUD() {
    if (this.elHudBar) this.elHudBar.classList.remove('hidden');
    if (this.elTouchControls) this.elTouchControls.classList.remove('hidden');
  }

  _bindButtons({ onStart, onRestart, onToggleAudio, onPause, onResume }) {
    if (this.elBtnStart) {
      this.elBtnStart.addEventListener('click', (e) => {
        e.stopPropagation();
        onStart();
      });
    }

    if (this.elStartScreen) {
      this.elStartScreen.addEventListener('click', () => {
        onStart();
      });
    }

    if (this.elBtnRestart) {
      this.elBtnRestart.addEventListener('click', (e) => {
        e.stopPropagation();
        onRestart();
      });
    }

    if (this.elBtnPause) {
      this.elBtnPause.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log("PAUSE BUTTON CLICKED");
        onPause();
      });
    }

    if (this.elBtnResume) {
      this.elBtnResume.addEventListener('click', (e) => {
        e.stopPropagation();
        onResume();
      });
    }

    if (this.elBtnPauseRestart) {
      this.elBtnPauseRestart.addEventListener('click', (e) => {
        e.stopPropagation();
        onRestart();
      });
    }

    if (this.elBtnAudio) {
      this.elBtnAudio.addEventListener('click', (e) => {
        e.stopPropagation();
        const enabled = onToggleAudio();
        this.elBtnAudio.textContent = enabled ? 'SFX: ON' : 'SFX: OFF';
      });
    }

    if (this.elBtnDebug) {
      this.elBtnDebug.addEventListener('click', (e) => {
        e.stopPropagation();
        this.toggleDebug();
      });
    }
  }

  showStartScreen() {
    if (this.elStartScreen) this.elStartScreen.classList.remove('hidden');
    if (this.elGameOverScreen) this.elGameOverScreen.classList.add('hidden');
    this.hideCountdown();
    this.hidePauseScreen();
    this.hideHUD();
  }

  hideOverlays() {
    if (this.elStartScreen) this.elStartScreen.classList.add('hidden');
    if (this.elGameOverScreen) this.elGameOverScreen.classList.add('hidden');
    this.hideCountdown();
    this.hidePauseScreen();
  }

  showPauseScreen() {
    if (this.elPauseScreen) this.elPauseScreen.classList.remove('hidden');
  }

  hidePauseScreen() {
    if (this.elPauseScreen) this.elPauseScreen.classList.add('hidden');
  }

  showCountdown(text) {
    if (this.elCountdownText) {
      this.elCountdownText.textContent = text;
      if (text === 'GO!') {
        this.elCountdownText.className =
          'text-7xl sm:text-9xl font-black font-mono tracking-widest text-emerald-400 drop-shadow-[0_0_55px_rgba(52,211,153,0.9)] scale-110 transition-transform duration-200';
      } else {
        this.elCountdownText.className =
          'text-7xl sm:text-9xl font-black font-mono tracking-widest text-amber-400 drop-shadow-[0_0_45px_rgba(251,191,36,0.8)] scale-100 transition-transform duration-200';
      }
    }
    if (this.elCountdownScreen) {
      this.elCountdownScreen.classList.remove('hidden');
    }
  }

  hideCountdown() {
    if (this.elCountdownScreen) {
      this.elCountdownScreen.classList.add('hidden');
    }
  }

  showGameOver({ score, distance, coins, highScore, isNewHighScore = false }) {
    this.hideHUD();

    if (this.elFinalScore) this.elFinalScore.textContent = String(Math.floor(score));
    if (this.elFinalDistance) this.elFinalDistance.textContent = this.formatDistance(distance);
    if (this.elFinalCoins) this.elFinalCoins.textContent = String(coins);
    if (this.elFinalBest) this.elFinalBest.textContent = String(Math.floor(highScore));

    const elBadge = document.getElementById('gameover-badge');
    if (elBadge) {
      if (isNewHighScore) {
        elBadge.textContent = '🏆 NEW HIGH SCORE RECORD!';
        elBadge.className = 'text-xs font-mono tracking-widest text-emerald-400 font-bold mb-1 animate-pulse';
      } else {
        elBadge.textContent = 'FINAL RUN SCORECARD';
        elBadge.className = 'text-xs font-mono tracking-widest text-red-400 font-semibold mb-1';
      }
    }

    const elRank = document.getElementById('final-rank');
    if (elRank) {
      const rankInfo = this.calculateRank(score, distance);
      elRank.textContent = rankInfo.rank;
      elRank.className = `font-extrabold text-xs sm:text-sm px-3 py-1 rounded border font-mono tracking-wider ${rankInfo.colorClass}`;
    }

    if (this.elGameOverScreen) {
      this.elGameOverScreen.classList.remove('hidden');
    }
  }

  calculateRank(score, distance) {
    if (score >= 4000 || distance >= 2500) {
      return { rank: 'S RANK · DRIFT LEGEND', colorClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/50' };
    } else if (score >= 2000 || distance >= 1200) {
      return { rank: 'A RANK · PRO DRIVER', colorClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/50' };
    } else if (score >= 800 || distance >= 600) {
      return { rank: 'B RANK · SPEED RACER', colorClass: 'bg-amber-500/20 text-amber-300 border-amber-400/50' };
    } else if (score >= 250 || distance >= 200) {
      return { rank: 'C RANK · ROOKIE DRIVER', colorClass: 'bg-blue-500/20 text-blue-300 border-blue-400/50' };
    } else {
      return { rank: 'D RANK · HIGHWAY WRECK', colorClass: 'bg-red-500/20 text-red-300 border-red-400/50' };
    }
  }

  formatDistance(meters) {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(2)} km`;
    }
    return `${Math.floor(meters)}m`;
  }

  showBanner(text, duration = 1.1) {
    if (!this.elBanner) return;
    this.elBanner.textContent = text;
    this.elBanner.style.opacity = '1';
    this._bannerTimer = duration;
  }

  updateHUD(dt, { score, coins, highScore, distance, nextCheckpointDistance, speed, maxSpeed, isDrifting, driftComboScore, health = 100, fuel = 100, magnetTimer = 0, invisibilityTimer = 0, shieldActive = false }) {
    const intScore = Math.floor(score);
    if (intScore !== this._lastScore) {
      this._lastScore = intScore;
      if (this.elScore) this.elScore.textContent = String(intScore);
    }

    if (coins !== this._lastCoins) {
      this._lastCoins = coins;
      if (this.elCoins) this.elCoins.textContent = String(coins);
    }

    const intBest = Math.floor(highScore);
    if (intBest !== this._lastBest) {
      this._lastBest = intBest;
      if (this.elBest) this.elBest.textContent = String(intBest);
    }

    const kmh = Math.floor(speed * 3.6);
    if (kmh !== this._lastSpeed) {
      this._lastSpeed = kmh;
      if (this.elSpeed) this.elSpeed.textContent = String(kmh);
      if (this.elSpeedBar) {
        const ratio = Math.min(1, Math.max(0.05, speed / maxSpeed));
        this.elSpeedBar.style.width = `${Math.round(ratio * 100)}%`;
      }
    }

    // Health Bar Update
    const hClamped = Math.max(0, Math.min(100, Math.round(health)));
    if (this.elHealthText) this.elHealthText.textContent = String(hClamped);
    if (this.elHealthBar) {
      this.elHealthBar.style.width = `${hClamped}%`;
      this.elHealthBar.className = `h-full transition-all duration-150 origin-left ${hClamped > 50 ? 'bg-red-500' : hClamped > 25 ? 'bg-amber-500' : 'bg-red-600 animate-pulse'}`;
    }

    // Fuel Bar Update
    const fClamped = Math.max(0, Math.min(100, Math.round(fuel)));
    if (this.elFuelText) {
      this.elFuelText.textContent = fClamped <= 0 ? 'EMPTY ⛽' : String(fClamped);
    }
    if (this.elFuelBar) {
      this.elFuelBar.style.width = `${fClamped}%`;
      this.elFuelBar.className = `h-full transition-all duration-150 origin-left ${fClamped > 30 ? 'bg-cyan-400' : fClamped > 0 ? 'bg-amber-400 animate-pulse' : 'bg-red-500'}`;
    }

    // Power-up Badges Update
    if (this.elPowerups) {
      let badgesHtml = '';
      if (shieldActive) {
        badgesHtml += `<div class="px-2 py-0.5 rounded bg-amber-500/20 border border-amber-400/50 text-amber-300 font-bold">🛡 SHIELD ACTIVE</div>`;
      }
      if (invisibilityTimer > 0) {
        badgesHtml += `<div class="px-2 py-0.5 rounded bg-sky-500/20 border border-sky-400/50 text-sky-300 font-bold">👻 INVISIBLE ${Math.ceil(invisibilityTimer)}s</div>`;
      }
      if (magnetTimer > 0) {
        badgesHtml += `<div class="px-2 py-0.5 rounded bg-purple-500/20 border border-purple-400/50 text-purple-300 font-bold">🧲 MAGNET ${Math.ceil(magnetTimer)}s</div>`;
      }
      this.elPowerups.innerHTML = badgesHtml;
    }

    const distText = this.formatDistance(distance);
    if (distText !== this._lastDistanceText) {
      this._lastDistanceText = distText;
      if (this.elDistance) this.elDistance.textContent = distText;
    }

    const cpText = `${Math.floor(nextCheckpointDistance)}m`;
    if (cpText !== this._lastNextCpText) {
      this._lastNextCpText = cpText;
      if (this.elNextCp) this.elNextCp.textContent = cpText;
    }

    if (this._bannerTimer > 0) {
      this._bannerTimer -= dt;
      if (this._bannerTimer <= 0 && this.elBanner && !isDrifting) {
        this.elBanner.style.opacity = '0';
      }
    } else if (isDrifting && driftComboScore >= 5) {
      if (this.elBanner) {
        this.elBanner.textContent = `DRIFT +${Math.floor(driftComboScore)}`;
        this.elBanner.style.opacity = '1';
      }
    } else if (this.elBanner && this.elBanner.style.opacity !== '0') {
      this.elBanner.style.opacity = '0';
    }
  }

  toggleDebug() {
    this.debugVisible = !this.debugVisible;
    if (this.elDebugPanel) {
      this.elDebugPanel.classList.toggle('hidden', !this.debugVisible);
    }
  }

  updateDebug({ fps, drawCalls, triangles, geometries, speed }) {
    if (!this.debugVisible) return;
    if (this.elDbgFps) this.elDbgFps.textContent = String(Math.round(fps));
    if (this.elDbgCalls) this.elDbgCalls.textContent = String(drawCalls);
    if (this.elDbgTris) this.elDbgTris.textContent = String(triangles);
    if (this.elDbgObjs) this.elDbgObjs.textContent = String(geometries);
    if (this.elDbgSpeed) this.elDbgSpeed.textContent = speed.toFixed(1);
  }
}
