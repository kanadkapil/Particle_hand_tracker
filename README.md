# 🧙‍♂️ Interactive 3D Particle Hand Tracker

A real-time, interactive 3D particle system controlled by your hand gestures! Built with **React**, **Three.js (R3F)**, and **MediaPipe Hands**.

![Demo](https://via.placeholder.com/800x400?text=Particle+Hand+Tracker+Demo)

## ✨ Features

- **Real-time Hand Tracking**: Control 8,000 particles with low latency using your webcam.
- **Gesture Recognition**:
  - ✋ **Move**: Guide the particle cloud.
  - 👌 **Pinch**: Implode particles (Black Hole effect) with color shifts.
  - ✊ **Closed Fist**: Swirl particles in a vortex.
  - 🖐️ **Open Hand**: Repel particles.
- **✨ Visual Modes**:
  - **Drawing Mode**: Paint 3D trails in mid-air using the Pinch gesture.
  - **Mirror Mode**: Turn yourself into a digital particle cloud (Self-Portrait).
  - **Game Mode (Asteroids)**: Defend the screen from incoming red asteroids using your hands as shields.
- **🎨 Customization**:
  - Switch shapes: Cloud, Sphere, Galaxy, DNA, Pyramid, Torus Knot.
  - Change colors and background.
  - Adjust settings via the **Leva** control panel.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A webcam

### Installation

1. **Clone the repository** (or navigate to the folder):

   ```bash
   cd particle-hand-tracker
   ```

2. **Install dependencies**:

   ```bash
   npm install
   ```

3. **Start the development server**:

   ```bash
   npm run dev
   ```

4. **Allow Camera Access**:
   - Open `http://localhost:5173` in your browser.
   - Click "Allow" when the browser asks for camera permissions.

## 🎮 How to Play

### 1. Standard Mode

- Move your hand to attract particles.
- **Pinch** to explode them.
- Use the **Controls Panel** (top right) to change the **Shape** (e.g., to 'DNA' or 'Heart').

### 2. Drawing Mode

- Enable `drawingMode` in the panel.
- **Pinch** your index and thumb together to draw light trails in 3D space!

### 3. Game Mode

- Enable `gameMode`.
- Red asteroids will fly at you.
- Intercept them with your hand to destroy them and score points!

## 🛠️ Tech Stack

- **[Vite](https://vitejs.dev/)**: Fast frontend tooling.
- **[React Three Fiber](https://docs.pmnd.rs/react-three-fiber)**: Declarative Three.js for React.
- **[MediaPipe Hands](https://developers.google.com/mediapipe)**: ML-based hand tracking.
- **[Zustand](https://github.com/pmndrs/zustand)**: State management.
- **[Postprocessing](https://github.com/pmndrs/postprocessing)**: Bloom and visual effects.

## 📝 License

MIT License. Feel free to use and modify!
