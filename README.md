# Arrow Puzzle 🌀

Arrow Puzzle is a premium, minimal, and visually stunning grid-based mobile puzzle game built with **React Native**, **Expo (SDK 56)**, and **TypeScript**. 

The goal of the game is to rotate arrows on a grid to guide a continuous path of energy from the **Start Cell** (green) to the **Target Cell** (gold flag). 

---

## 🎮 Gameplay Features
- **50 Unique Predefined Levels** scaled across three distinct difficulties:
  - **Easy (Levels 1 - 15)**: 3x3 to 4x4 boards introducing core mechanics.
  - **Medium (Levels 16 - 35)**: 4x4 to 5x5 boards with intricate loops and branching pathways.
  - **Hard (Levels 36 - 50)**: 5x5 to 7x7 boards featuring complex directional loops.
- **Dynamic Glowing Path**: Watch the path recalculate and glow in real-time as you tap and rotate arrow cells clockwise.
- **Interactive Audio**: Immersive sound effects for arrow rotations, data resets, and triumphant level completions.
- **Light & Dark Themes**: Sleek dark space aesthetic by default with an option to toggle to a clean light mode.
- **Local Progression Saving**: Save completed levels, best moves, and completion times using React Native AsyncStorage.
- **Offline Support**: The game operates entirely offline, gracefully disabling network sound effect streaming without crashing.

---

## 🛠️ Tech Stack & Architecture
- **Framework**: Expo (React Native) with TypeScript
- **State Management**: Context API for global user settings and storage synchronization.
- **Database**: Local storage tracking via `@react-native-async-storage/async-storage`.
- **Navigation**: Typed Native Stack Navigation using `@react-navigation/native`.
- **Sound Effects**: Playback & preloading using `expo-av`.
- **Icons**: Sleek responsive vector shapes via `lucide-react-native`.

---

## 📂 Project Structure
```text
├── assets/                  # Media and logo resources
├── components/
│   ├── Cell.tsx             # Interactive grid cell with spring press & rotate animations
│   └── Board.tsx            # Grid system that renders cells and overlays path lines
├── context/
│   └── GameContext.tsx      # Core state provider for theme, volume, and AsyncStorage persistence
├── data/
│   └── levels.ts            # Configuration matrix containing 50 level definitions
├── hooks/
│   └── useGameAudio.ts      # Audio loader and player utilizing expo-av
├── navigation/
│   └── AppNavigator.tsx     # Router configuration mapping Home, Levels, Game, and Settings
├── screens/
│   ├── HomeScreen.tsx       # Entry menu featuring neon title and floating arrow particles
│   ├── LevelsScreen.tsx     # Category list grid showing locked levels and personal records
│   ├── GameScreen.tsx       # Dynamic game board, timing tracker, and level-solved modal
│   └── SettingsScreen.tsx   # Config switches for sound effects, light theme, and data resets
├── utils/
│   └── gameLogic.ts         # Path tracing engine with loop and boundary detection
├── App.tsx                  # Root launcher configuring provider contexts
├── package.json             # Build configuration and project dependencies
└── tsconfig.json            # Strict TypeScript settings
```

---

## 🚀 Installation & Running

### Prerequisites
- **Node.js** (LTS version recommended)
- **Expo Go** app installed on your physical device ([iOS App Store](https://apps.apple.com/us/app/expo-go/id984023376) or [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)) OR an Android Emulator/iOS Simulator configured on your computer.

### Step 1: Install Dependencies
Open your terminal inside the project directory and install the packages:
```bash
npm install
```

### Step 2: Start the Expo Development Server
Launch the compiler and bundler:
```bash
npx expo start
```

### Step 3: Run on Devices
Once the dev server starts, a QR code will be generated in your terminal:
- **Android**: Open the **Expo Go** app and tap **"Scan QR Code"** to scan the terminal's QR code.
- **iOS**: Open the native **Camera app** on your iPhone and scan the QR code. Tap the notification banner to open the project in **Expo Go**.
- **Simulator/Emulator**: Press `a` in your terminal to boot up the Android Emulator, or `i` to launch the iOS Simulator.
