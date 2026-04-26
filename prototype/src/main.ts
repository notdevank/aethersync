import * as THREE from 'three';
import { AudioEngine } from './AudioEngine';
import { VisualEngine } from './VisualEngine';
import gsap from 'gsap';

class App {
  private audioEngine: AudioEngine;
  private visualEngine: VisualEngine;
  private startTime: number;

  constructor() {
    const container = document.getElementById('app')!;
    this.audioEngine = new AudioEngine();
    this.visualEngine = new VisualEngine(container);
    this.startTime = Date.now();

    this.init();
  }

  async init() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(2, 6, 23, 0.9); color: #8B5CF6;
      font-family: sans-serif; cursor: pointer; z-index: 100;
    `;
    overlay.innerHTML = '<h1>Click to Enter Aether</h1>';
    document.body.appendChild(overlay);

    overlay.onclick = async () => {
      await this.audioEngine.init();
      gsap.to(overlay, { opacity: 0, duration: 1, onComplete: () => overlay.remove() });
      this.setupControls();
      this.animate();
    };

    const burger = document.getElementById('burger');
    const controls = document.getElementById('controls');
    if (burger && controls) {
      burger.onclick = () => {
        controls.classList.toggle('open');
      };
    }

    let isDragging = false;
    let previousMouseX = 0;
    let previousMouseY = 0;

    window.addEventListener('mousedown', (e) => {
      isDragging = true;
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const deltaX = (e.clientX - previousMouseX) * 0.005;
      const deltaY = (e.clientY - previousMouseY) * 0.005;
      this.visualEngine.addRotation(deltaX, deltaY);
      previousMouseX = e.clientX;
      previousMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => { isDragging = false; });

    window.addEventListener('keydown', () => {
      const origin = new THREE.Vector3((Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2, (Math.random() - 0.5) * 2);
      this.visualEngine.triggerRipple(origin);
      gsap.to(document.body, { backgroundColor: '#1E293B', duration: 0.1, yoyo: true, repeat: 1 });
    });
  }

  setupControls() {
    const ids = ['size', 'intensity', 'rainbowSpeed', 'audioSens', 'bloom'];
    ids.forEach(id => {
      const el = document.getElementById(id) as HTMLInputElement;
      if (!el) return;
      el.oninput = () => {
        const val = parseFloat(el.value);
        const update: any = {};
        if (id === 'size') update.blobSize = val;
        if (id === 'intensity') update.mountainIntensity = val;
        if (id === 'rainbowSpeed') update.rainbowSpeed = val;
        if (id === 'audioSens') update.audioSens = val;
        if (id === 'bloom') update.bloomBase = val;
        this.visualEngine.updateParams(update);
      };
    });

    const buttons = document.querySelectorAll('.palette-btn');
    buttons.forEach(btn => {
      (btn as HTMLButtonElement).onclick = () => {
        const palette = btn.getAttribute('data-palette') as any;
        this.visualEngine.updateParams({ palette });
      };
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    const elapsed = (Date.now() - this.startTime) * 0.001;
    const audioParams = this.audioEngine.getAudioData();
    this.visualEngine.update(elapsed, audioParams);
  }
}

new App();
