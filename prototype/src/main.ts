import * as THREE from 'three';
import { AudioEngine } from './AudioEngine';
import { VisualEngine } from './VisualEngine';
import gsap from 'gsap';

class App {
  private audioEngine: AudioEngine;
  private visualEngine: VisualEngine;
  private startTime: number;

  constructor() {
    this.audioEngine = new AudioEngine();
    this.visualEngine = new VisualEngine(document.getElementById('app')!);
    this.startTime = Date.now();

    this.initOverlay();
    this.setupInteractions();
  }

  private initOverlay() {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      background: rgba(2, 6, 23, 0.9); color: #8B5CF6;
      font-family: sans-serif; cursor: pointer; z-index: 100;
    `;
    overlay.innerHTML = '<h1>Click to Enter AetherSynth</h1>';
    document.body.appendChild(overlay);

    overlay.onclick = async () => {
      await this.audioEngine.init();
      gsap.to(overlay, {
        opacity: 0,
        duration: 1,
        onComplete: () => overlay.remove()
      });
      this.animate();
    };
  }

  private setupInteractions() {
    window.addEventListener('keydown', (e) => {
      console.log('Key pressed:', e.key);
      // Trigger a ripple at a random point on the sphere surface
      const origin = new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2,
        (Math.random() - 0.5) * 2
      ).normalize().multiplyScalar(2);
      
      this.visualEngine.triggerRipple(origin);

      // Brief flash effect
      gsap.to(document.body, {
        backgroundColor: '#1E293B',
        duration: 0.1,
        yoyo: true,
        repeat: 1
      });
    });
  }

  private animate() {
    requestAnimationFrame(this.animate.bind(this));
    const elapsed = (Date.now() - this.startTime) * 0.001;
    const audioParams = this.audioEngine.getAudioData();
    const rawData = (this.audioEngine as any).dataArray;
    this.visualEngine.update(elapsed, audioParams, rawData);
  }
}

new App();
