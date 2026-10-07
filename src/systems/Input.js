export class InputManager {
  constructor() {
    this.keys = {
      left: false,
      right: false,
      drift: false,
    };

    this.buttonLeft = false;
    this.buttonRight = false;
    this.buttonDrift = false;

    this.pointerActive = false;
    this.pointerId = null;
    this.pointerStartX = 0;
    this.pointerCurrentX = 0;
    this.swipeSteer = 0;

    this.steer = 0;
    this.drift = false;
    this.restartRequested = false;
    this.startRequested = false;
    this.debugToggleRequested = false;

    this._bindEvents();
  }

  _bindEvents() {
    window.addEventListener('keydown', (e) => this._onKeyDown(e), { passive: false });
    window.addEventListener('keyup', (e) => this._onKeyUp(e), { passive: true });

    const gameContainer = document.getElementById('game-container') || window;

    gameContainer.addEventListener('pointerdown', (e) => this._onPointerDown(e), { passive: true });
    window.addEventListener('pointermove', (e) => this._onPointerMove(e), { passive: true });
    window.addEventListener('pointerup', (e) => this._onPointerUp(e), { passive: true });
    window.addEventListener('pointercancel', (e) => this._onPointerUp(e), { passive: true });

    this._bindTouchButton('btn-steer-left', (down) => {
      this.buttonLeft = down;
      if (down) this.startRequested = true;
    });
    this._bindTouchButton('btn-steer-right', (down) => {
      this.buttonRight = down;
      if (down) this.startRequested = true;
    });
    this._bindTouchButton('btn-drift', (down) => {
      this.buttonDrift = down;
      if (down) this.startRequested = true;
    });

    window.addEventListener('blur', () => {
      this.keys.left = false;
      this.keys.right = false;
      this.keys.drift = false;
      this.buttonLeft = false;
      this.buttonRight = false;
      this.buttonDrift = false;
      this.pointerActive = false;
      this.swipeSteer = 0;
    });
  }

  _bindTouchButton(elementId, callback) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const onDown = (e) => {
      e.stopPropagation();
      callback(true);
    };
    const onUp = (e) => {
      e.stopPropagation();
      callback(false);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    el.addEventListener('pointerleave', onUp);
    el.addEventListener('pointercancel', onUp);
  }

  _onKeyDown(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = true;
        this.startRequested = true;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = true;
        this.startRequested = true;
        break;
      case 'Space':
        e.preventDefault();
        this.keys.drift = true;
        this.startRequested = true;
        break;
      case 'KeyP':
      case 'Escape':
        e.preventDefault();
        this.pauseToggleRequested = true;
        break;
      case 'KeyR':
        this.restartRequested = true;
        break;
      case 'Enter':
        this.startRequested = true;
        break;
      case 'F3':
      case 'Backquote':
        e.preventDefault();
        this.debugToggleRequested = true;
        break;
      default:
        break;
    }
  }

  _onKeyUp(e) {
    switch (e.code) {
      case 'ArrowLeft':
      case 'KeyA':
        this.keys.left = false;
        break;
      case 'ArrowRight':
      case 'KeyD':
        this.keys.right = false;
        break;
      case 'Space':
        this.keys.drift = false;
        break;
      default:
        break;
    }
  }

  _onPointerDown(e) {
    if (this.pointerActive) return;
    this.pointerActive = true;
    this.pointerId = e.pointerId;
    this.pointerStartX = e.clientX;
    this.pointerCurrentX = e.clientX;
    this.startRequested = true;

    const width = window.innerWidth || 1;
    const normX = (e.clientX / width) * 2 - 1;
    if (Math.abs(normX) > 0.15) {
      this.swipeSteer = Math.sign(normX) * Math.min(1, Math.abs(normX) * 1.15);
    } else {
      this.swipeSteer = 0;
    }
  }

  _onPointerMove(e) {
    if (!this.pointerActive || e.pointerId !== this.pointerId) return;
    this.pointerCurrentX = e.clientX;
    const dx = this.pointerCurrentX - this.pointerStartX;
    const sensitivity = 48;
    if (Math.abs(dx) > 4) {
      this.swipeSteer = Math.max(-1, Math.min(1, dx / sensitivity));
    }
  }

  _onPointerUp(e) {
    if (!this.pointerActive || e.pointerId !== this.pointerId) return;
    this.pointerActive = false;
    this.pointerId = null;
    this.swipeSteer = 0;
  }

  processInput() {
    let digitalSteer = 0;
    if (this.keys.left || this.buttonLeft) digitalSteer -= 1;
    if (this.keys.right || this.buttonRight) digitalSteer += 1;

    if (digitalSteer !== 0) {
      this.steer = digitalSteer;
    } else if (this.pointerActive) {
      this.steer = this.swipeSteer;
    } else {
      this.steer = 0;
    }

    this.drift = this.keys.drift || this.buttonDrift;
  }

  consumeRestartRequest() {
    const req = this.restartRequested;
    this.restartRequested = false;
    return req;
  }

  consumeStartRequest() {
    const req = this.startRequested;
    this.startRequested = false;
    return req;
  }

  consumeDebugToggle() {
    const req = this.debugToggleRequested;
    this.debugToggleRequested = false;
    return req;
  }

  consumePauseToggle() {
    const req = this.pauseToggleRequested;
    this.pauseToggleRequested = false;
    return req;
  }
}
