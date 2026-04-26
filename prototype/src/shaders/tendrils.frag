uniform float uTime;
uniform float uMids;
uniform float uTreble;
uniform float uRainbowSpeed;

uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;
uniform vec3 uD;

varying vec2 vUv;
varying float vNoise;

// Cosine based palette: https://iquilezles.org/articles/palettes/
vec3 palette(float t) {
    return uA + uB * cos(6.28318 * (uC * t + uD));
}

void main() {
  // Base bioluminescent colors
  vec3 colorViolet = vec3(0.545, 0.361, 0.965); // #8B5CF6
  vec3 colorCyan = vec3(0.133, 0.827, 0.933);   // #22D3EE
  
  float intensity = smoothstep(-1.0, 1.0, vNoise);
  
  // Audio-reactive mix
  vec3 baseColor = mix(colorViolet, colorCyan, intensity * (0.5 + uMids * 0.5));
  
  // Add some pulsing based on time
  float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
  vec3 finalColor = baseColor * pulse;
  
  // Treble radiance
  float trebleGlow = uTreble * 0.5; 
  finalColor *= (1.5 + trebleGlow);
  finalColor += baseColor * 0.4; // Constant glow base
  
  // Constant Bloom Trigger
  finalColor *= 1.4; 
  
  gl_FragColor = vec4(finalColor, 0.95);
}
