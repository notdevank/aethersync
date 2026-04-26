import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// @ts-ignore
import vertexShader from './shaders/tendrils.vert?raw';
// @ts-ignore
import fragmentShader from './shaders/tendrils.frag?raw';

export class VisualEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#020617');

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 5;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(this.renderer.domElement);

    // Post-processing
    const renderScene = new RenderPass(this.scene, this.camera);
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.4, 0.85
    );
    bloomPass.threshold = 0.2;
    bloomPass.strength = 1.2;
    bloomPass.radius = 0.5;

    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(renderScene);
    this.composer.addPass(bloomPass);

    // Geometry
    const geometry = new THREE.IcosahedronGeometry(2, 64);
    this.material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uBass: { value: 0 },
        uMids: { value: 0 },
        uTreble: { value: 0 },
        uRippleTime: { value: 100 },
        uRippleOrigin: { value: new THREE.Vector3(0, 0, 0) },
        uMountainIntensity: { value: 0.5 },
        uA: { value: new THREE.Color('#020617') },
        uB: { value: new THREE.Color('#8B5CF6') },
        uC: { value: new THREE.Color('#22D3EE') },
        uD: { value: new THREE.Color('#F8FAFC') },
      },
      transparent: true,
      side: THREE.DoubleSide,
    });

    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.composer.setSize(window.innerWidth, window.innerHeight);
  }

  public triggerRipple(origin: THREE.Vector3) {
    this.material.uniforms.uRippleOrigin.value.copy(origin);
    this.material.uniforms.uRippleTime.value = 0;
  }

  public update(elapsed: number, audioParams: any) {
    this.material.uniforms.uTime.value = elapsed;
    this.material.uniforms.uBass.value = audioParams.bass;
    this.material.uniforms.uMids.value = audioParams.mids;
    this.material.uniforms.uTreble.value = audioParams.treble;
    this.material.uniforms.uRippleTime.value += 0.016;

    this.mesh.rotation.x += 0.0005;
    this.mesh.rotation.y += (0.001 + audioParams.bass * 0.02);
    const scale = 1.0 + (audioParams.bass > 0.05 ? audioParams.bass * 0.5 : 0);
    this.mesh.scale.set(scale, scale, scale);

    this.composer.render();
  }

  public addRotation(deltaX: number, deltaY: number) {
    if (!this.mesh) return;
    this.mesh.rotation.y += deltaX;
    this.mesh.rotation.x += deltaY;
  }

  public updateParams(params: any) {
    // Basic implementation to handle slider updates if needed
    if (params.mountainIntensity !== undefined) this.material.uniforms.uMountainIntensity.value = params.mountainIntensity;
  }
}
