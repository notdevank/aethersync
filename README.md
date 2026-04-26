# AetherSynth

**AetherSynth** is a browser-based generative audio-visual environment. It allows users to interact with a high-fidelity visual system that reacts to microphone input and user interactions.

## ✨ Core Features

-   **Audio-Reactive Visuals**: A Three.js-based system that responds dynamically to audio frequencies (Bass, Mids, and Treble).
-   **Interactive Ripples**: Keypress events trigger visual "shocks" or ripples in the generative geometry.
-   **Bioluminescent Aesthetic**: A custom-designed palette inspired by the bioluminescence of the deep sea.
-   **Post-Processing**: Integrated bloom and glow effects for a high-fidelity immersive experience.

## 🚀 Live Demo

The project is automatically deployed to GitHub Pages:
[https://notdevank.github.io/aethersync/](https://notdevank.github.io/aethersync/)

## 🛠️ Technology Stack

-   **Core**: [Three.js](https://threejs.org/) (WebGL)
-   **Audio**: Web Audio API
-   **Animation**: [GSAP](https://greensock.com/gsap/) (GreenSock)
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)

## 💻 Local Development

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/notdevank/aethersync.git
    cd aethersync/prototype
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Start the development server**:
    ```bash
    npm run dev
    ```

4.  **Build for production**:
    ```bash
    npm run build
    ```

## 📜 Project Structure

-   `Active/Creative/AetherSynth/`: Project root (Workspace reference).
-   `prototype/`: Contains the source code and build configuration.
-   `.github/workflows/`: CI/CD configuration for automatic deployment.

## 🎨 Design Philosophy

AetherSynth is designed to be a "delightful non-distraction"—an environment that prioritizes fluid, organic motion and immersive visuals over traditional gamified interaction.

---
Created by [notdevank](https://github.com/notdevank).
