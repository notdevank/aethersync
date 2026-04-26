import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

// @ts-ignore
import vertexShader from './shaders/tendrils.vert?raw';
// @ts-ignore
import fragmentShader from './shaders/tendrils.frag?raw';

const nebulaVertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const nebulaFragmentShader = `
  uniform float uTime;
  uniform float uBass;
  varying vec2 vUv;
  void main() {
    vec2 uv = vUv * 2.0 - 1.0;
    float dist = length(uv);
    float n = 0.0;
    n += 0.4 * sin(uv.x * 1.0 + uTime * 0.05);
    n += 0.2 * cos(uv.y * 1.2 - uTime * 0.03);
    vec3 colorA = vec3(0.001, 0.0, 0.01); 
    vec3 colorB = vec3(0.0, 0.001, 0.02); 
    vec3 finalColor = mix(colorA, colorB, n + dist * 0.4);
    finalColor *= (0.3 + uBass * 0.4);
    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

interface Meteor {
  mesh: THREE.Line;
  velocity: THREE.Vector3;
  life: number;
}

interface Explosion {
  particles: THREE.Points;
  velocities: Float32Array;
  life: number;
  light: THREE.PointLight;
}

const PALETTES = {
  rainbow: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.33, 0.67)
  },
  inferno: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.1, 0.2)
  },
  ocean: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.5, 0.6, 0.7)
  },
  ethereal: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 0.5),
    d: new THREE.Vector3(0.8, 0.9, 0.3)
  },
  solar: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.05, 0.1)
  },
  midnight: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 0.7, 0.4),
    d: new THREE.Vector3(0.0, 0.15, 0.2)
  },
  emerald: {
    a: new THREE.Vector3(0.5, 0.5, 0.5),
    b: new THREE.Vector3(0.5, 0.5, 0.5),
    c: new THREE.Vector3(1.0, 1.0, 1.0),
    d: new THREE.Vector3(0.3, 0.2, 0.2)
  },
  supernova: {
    a: new THREE.Vector3(0.8, 0.5, 0.4),
    b: new THREE.Vector3(0.2, 0.4, 0.2),
    c: new THREE.Vector3(2.0, 1.0, 1.0),
    d: new THREE.Vector3(0.0, 0.25, 0.25)
  }
};

export class VisualEngine {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private composer: EffectComposer;
  private bloomPass: UnrealBloomPass;
  
  private mesh: THREE.Mesh;
  private material: THREE.ShaderMaterial;
  private nebula: THREE.Mesh;
  private nebulaMaterial: THREE.ShaderMaterial;
  
  private stars: THREE.Points;
  private blobLight: THREE.PointLight;
  private dust: THREE.Points;
  private meteors: Meteor[] = [];
  private explosions: Explosion[] = [];

  private shakeAmount: number = 0;
  private targetPan: THREE.Vector2 = new THREE.Vector2(0, 0);
  private currentPan: THREE.Vector2 = new THREE.Vector2(0, 0);

  public params = {
    blobSize: 1.5,
    mountainIntensity: 0.4,
    rainbowSpeed: 0.3,
    audioSens: 1.0,
    bloomBase: 1.2,
    palette: 'rainbow' as keyof typeof PALETTES
  };

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#000000');

    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.camera.position.z = 8;

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ReinhardToneMapping;
    container.appendChild(this.renderer.domElement);

    this.composer = new EffectComposer(this.renderer);
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.2, 0.4, 0.85);
    this.composer.addPass(this.bloomPass);

    this.blobLight = new THREE.PointLight(0xffffff, 10, 50);
    this.scene.add(this.blobLight);
    this.scene.add(new THREE.AmbientLight(0x111111));

    const nebulaGeo = new THREE.SphereGeometry(500, 32, 32);
    this.nebulaMaterial = new THREE.ShaderMaterial({
      vertexShader: nebulaVertexShader,
      fragmentShader: nebulaFragmentShader,
      uniforms: { uTime: { value: 0 }, uBass: { value: 0 } },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false
    });
    this.nebula = new THREE.Mesh(nebulaGeo, this.nebulaMaterial);
    this.scene.add(this.nebula);

    this.createRealisticStars();
    this.createAetherDust();

    this.createBlob();

    window.addEventListener('resize', this.onResize.bind(this));
  }

  private createBlob() {
    if (this.mesh) this.scene.remove(this.mesh);

    const palette = PALETTES[this.params.palette];
    const geometry = new THREE.IcosahedronGeometry(this.params.blobSize, 64);
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
        uMountainIntensity: { value: this.params.mountainIntensity },
        uRainbowSpeed: { value: this.params.rainbowSpeed },
        uA: { value: palette.a },
        uB: { value: palette.b },
        uC: { value: palette.c },
        uD: { value: palette.d }
      },
      transparent: true,
      side: THREE.DoubleSide
    });
    this.mesh = new THREE.Mesh(geometry, this.material);
    this.scene.add(this.mesh);
  }

  public updateParams(newParams: Partial<typeof this.params>) {
    Object.assign(this.params, newParams);
    
    if (newParams.blobSize !== undefined || newParams.palette !== undefined) {
      this.createBlob();
    }

    if (this.material) {
      if (newParams.mountainIntensity !== undefined) 
        this.material.uniforms.uMountainIntensity.value = newParams.mountainIntensity;
      if (newParams.rainbowSpeed !== undefined) 
        this.material.uniforms.uRainbowSpeed.value = newParams.rainbowSpeed;
    }
  }

  private createRealisticStars() {
    const starCount = 5000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const starColors = [new THREE.Color('#9bb2ff'), new THREE.Color('#bbccff'), new THREE.Color('#ffffff'), new THREE.Color('#fff4ea'), new THREE.Color('#ffd2a1')];
    for (let i = 0; i < starCount; i++) {
      const r = 100 + Math.random() * 400;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const color = starColors[Math.floor(Math.random() * starColors.length)];
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.stars = new THREE.Points(geometry, new THREE.PointsMaterial({ size: 0.8, vertexColors: true, transparent: true, opacity: 0.8, sizeAttenuation: true, blending: THREE.AdditiveBlending }));
    this.scene.add(this.stars);
  }

  private createAetherDust() {
    const count = 1500;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    this.dust = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0x8B5CF6, size: 0.02, transparent: true, opacity: 0.2, sizeAttenuation: true }));
    this.scene.add(this.dust);
  }

  private spawnExplosion() {
    const pCount = 200;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(pCount * 3);
    const vels = new Float32Array(pCount * 3);
    const r = 150 + Math.random() * 200;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const origin = new THREE.Vector3(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    for (let i = 0; i < pCount; i++) {
      pos[i * 3] = origin.x; pos[i * 3 + 1] = origin.y; pos[i * 3 + 2] = origin.z;
      const velocity = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize().multiplyScalar(0.2 + Math.random() * 1.0);
      vels[i * 3] = velocity.x; vels[i * 3 + 1] = velocity.y; vels[i * 3 + 2] = velocity.z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: new THREE.Color().setHSL(Math.random(), 0.8, 0.6), size: 1.0, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    const particles = new THREE.Points(geo, mat);
    this.scene.add(particles);
    const light = new THREE.PointLight(mat.color, 50, 100);
    light.position.copy(origin);
    this.scene.add(light);
    this.explosions.push({ particles, velocities: vels, life: 1.0, light });
    this.shakeAmount = 0.2;
  }

  private spawnMeteor(isComet = false) {
    const geo = new THREE.BufferGeometry();
    const points = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, isComet ? -10 : -2)];
    geo.setFromPoints(points);
    const mesh = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: isComet ? 0x22D3EE : 0xffffff, transparent: true, opacity: 1.0, blending: THREE.AdditiveBlending }));
    const r = 200 + Math.random() * 100;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.random() * Math.PI;
    mesh.position.set(r * Math.sin(phi) * Math.cos(theta), r * Math.sin(phi) * Math.sin(theta), r * Math.cos(phi));
    mesh.lookAt(0, 0, 0); 
    const velocity = new THREE.Vector3((Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4, (Math.random() - 0.5) * 0.4).add(mesh.position.clone().normalize().multiplyScalar(-1.2)); 
    this.scene.add(mesh);
    this.meteors.push({ mesh, velocity, life: 1.0 });
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
    this.shakeAmount = 0.1; 
  }

  public addRotation(deltaX: number, deltaY: number) {
    if (!this.mesh) return;
    this.mesh.rotation.y += deltaX;
    this.mesh.rotation.x += deltaY;
    this.stars.rotation.y += deltaX * 0.1;
  }

  public update(time: number, audioParams: { bass: number; mids: number; treble: number }) {
    if (!this.mesh) return;

    this.material.uniforms.uTime.value = time;
    this.material.uniforms.uBass.value = audioParams.bass * 1.5 * this.params.audioSens; 
    this.material.uniforms.uMids.value = audioParams.mids * 1.0 * this.params.audioSens;
    this.material.uniforms.uTreble.value = audioParams.treble * 1.5 * this.params.audioSens;
    this.material.uniforms.uRippleTime.value += 0.016; 

    // Continuous Bloom (Steady based on slider)
    this.bloomPass.strength = this.params.bloomBase;

    if (audioParams.bass > 0.6) this.shakeAmount = Math.max(this.shakeAmount, audioParams.bass * 0.05);
    if (this.shakeAmount > 0) {
      this.camera.position.x += (Math.random() - 0.5) * this.shakeAmount;
      this.camera.position.y += (Math.random() - 0.5) * this.shakeAmount;
      this.shakeAmount *= 0.9; 
    } else {
      this.camera.position.x += (0 - this.camera.position.x) * 0.05;
      this.camera.position.y += (0 - this.camera.position.y) * 0.05;
    }

    this.targetPan.set(Math.sin(time * 0.2) * 0.5, Math.cos(time * 0.15) * 0.3);
    this.currentPan.lerp(this.targetPan, 0.02);
    this.camera.lookAt(this.currentPan.x, this.currentPan.y, 0);

    if (Math.random() < 0.0005 + (audioParams.bass > 1.2 ? 0.02 : 0)) this.spawnExplosion();
    if (Math.random() < 0.01 + audioParams.bass * 0.05) this.spawnMeteor();
    if (Math.random() < 0.001) this.spawnMeteor(true);

    for (let i = this.meteors.length - 1; i >= 0; i--) {
      const m = this.meteors[i];
      m.mesh.position.add(m.velocity);
      m.life -= 0.003; 
      (m.mesh.material as THREE.LineBasicMaterial).opacity = m.life;
      if (m.life <= 0) { this.scene.remove(m.mesh); this.meteors.splice(i, 1); }
    }

    for (let i = this.explosions.length - 1; i >= 0; i--) {
      const e = this.explosions[i];
      const pos = e.particles.geometry.attributes.position.array as Float32Array;
      for (let j = 0; j < pos.length / 3; j++) {
        pos[j * 3] += e.velocities[j * 3]; pos[j * 3 + 1] += e.velocities[j * 3 + 1]; pos[j * 3 + 2] += e.velocities[j * 3 + 2];
      }
      e.particles.geometry.attributes.position.needsUpdate = true;
      e.life -= 0.01;
      (e.particles.material as THREE.PointsMaterial).opacity = e.life;
      e.light.intensity = e.life * 50;
      if (e.life <= 0) { this.scene.remove(e.particles); this.scene.remove(e.light); this.explosions.splice(i, 1); }
    }

    const hue = (time * 0.1) % 1.0;
    this.blobLight.color.setHSL(hue, 0.8, 0.6);
    this.blobLight.intensity = 10 + audioParams.bass * 30;

    this.nebulaMaterial.uniforms.uTime.value = time;
    this.nebulaMaterial.uniforms.uBass.value = audioParams.bass;

    this.stars.rotation.y += 0.0005;
    this.mesh.rotation.y += (0.001 + audioParams.bass * 0.02);
    const scale = 1.0 + (audioParams.bass > 0.05 ? audioParams.bass * 0.5 : 0);
    this.mesh.scale.set(scale, scale, scale);

    this.composer.render();
  }
}
