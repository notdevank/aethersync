# AetherSynth: Visual Design Specification

**Role**: Creative Director (Iola)
**Project**: AetherSynth
**Status**: Finalized Design Specs

---

## 1. Visual Identity

### 1.1. Color Palette (Bioluminescent Abyss)
The interface must feel deep and immersive, using gradients of bioluminescent colors.
-   **Deepest Abyss**: `#020617` (Background)
-   **Aether Glow**: `#8B5CF6` (Main interactive color - Violet)
-   **Bio-Cyan**: `#22D3EE` (Accent color)
-   **HUD Text**: `#F8FAFC` (Secondary White)

### 1.2. Typography
-   **Headlines**: Inter (Bold)
-   **Secondary/HUD**: Space Mono (for a "lab instrument" feel)

---

## 2. Motion Design (GSAP)
Animations should feel fluid and organic, mimicking fluid dynamics.
-   **Ripples**: Use a "power2.out" easing for sudden bursts, followed by a slow "sine.inOut" decay.
-   **Hue Shifting**: Subtle cycling of the primary color based on treble intensity.

---

## 3. HUD (Heads-Up Display)
The HUD should be minimal, placed at the edges of the screen.
-   **Top Left**: Project Title (AetherSynth)
-   **Bottom Right**: Audio Input indicator (Active/Idle).
-   **Interactive Tooltip**: "Press any key to ripple"

---

## 4. Generative Geometry
-   **Base Mesh**: Icosahedron (Subdivided).
-   **Shader Effects**: 
    -   **Vertex Shader**: Displace vertices based on Simplex Noise + Audio Bass.
    -   **Fragment Shader**: Gradient interpolation between Violet and Cyan based on noise intensity and treble.

---

## 5. Interaction Flow
1.  **Initial State**: Dark screen with a "Click to Begin" button (to initialize AudioContext).
2.  **Active State**: Audio feedback is constant. Visuals respond immediately to sound.
3.  **Peak State**: During high volume/treble, the bloom effect should intensify, causing the whole screen to "glow."

---

**Creative Intent**: AetherSynth is not a game; it is an environment. The design must prioritize "delightful non-distraction." If the user stops interacting, the visuals should retreat into a beautiful, slow-moving abyss.
