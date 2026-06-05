import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type Theme = 'light' | 'dark';

interface GameContextProps {
  theme: Theme;
  soundEnabled: boolean;
  completedLevels: number[];
  bestMoves: Record<number, number>;
  bestTimes: Record<number, number>;
  isLoaded: boolean;
  toggleTheme: () => void;
  toggleSound: () => void;
  completeLevel: (levelId: number, moves: number, timeSpent: number) => Promise<void>;
  resetProgress: () => Promise<void>;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

const THEME_KEY = '@arrow_puzzle_theme';
const SOUND_KEY = '@arrow_puzzle_sound';
const COMPLETED_LEVELS_KEY = '@arrow_puzzle_completed';
const BEST_MOVES_KEY = '@arrow_puzzle_best_moves';
const BEST_TIMES_KEY = '@arrow_puzzle_best_times';

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('dark'); // Dark mode by default for premium aesthetics
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [completedLevels, setCompletedLevels] = useState<number[]>([1]); // Level 1 unlocked by default
  const [bestMoves, setBestMoves] = useState<Record<number, number>>({});
  const [bestTimes, setBestTimes] = useState<Record<number, number>>({});
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedTheme, savedSound, savedCompleted, savedBestMoves, savedBestTimes] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(SOUND_KEY),
        AsyncStorage.getItem(COMPLETED_LEVELS_KEY),
        AsyncStorage.getItem(BEST_MOVES_KEY),
        AsyncStorage.getItem(BEST_TIMES_KEY),
      ]);

      if (savedTheme) {
        setTheme(savedTheme as Theme);
      }
      if (savedSound !== null) {
        setSoundEnabled(savedSound === 'true');
      }
      if (savedCompleted) {
        setCompletedLevels(JSON.parse(savedCompleted));
      } else {
        setCompletedLevels([1]); // Ensure Level 1 is always unlocked
      }
      if (savedBestMoves) {
        setBestMoves(JSON.parse(savedBestMoves));
      }
      if (savedBestTimes) {
        setBestTimes(JSON.parse(savedBestTimes));
      }
    } catch (e) {
      console.error('Failed to load game progress', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const toggleTheme = async () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    try {
      await AsyncStorage.setItem(THEME_KEY, nextTheme);
    } catch (e) {
      console.error('Failed to save theme setting', e);
    }
  };

  const toggleSound = async () => {
    const nextSound = !soundEnabled;
    setSoundEnabled(nextSound);
    try {
      await AsyncStorage.setItem(SOUND_KEY, String(nextSound));
    } catch (e) {
      console.error('Failed to save sound setting', e);
    }
  };

  const completeLevel = async (levelId: number, moves: number, timeSpent: number) => {
    try {
      // 1. Add to completed levels list
      let updatedCompleted = [...completedLevels];
      if (!completedLevels.includes(levelId)) {
        updatedCompleted.push(levelId);
      }
      // Unlock the next level
      const nextLevelId = levelId + 1;
      if (!updatedCompleted.includes(nextLevelId)) {
        updatedCompleted.push(nextLevelId);
      }
      setCompletedLevels(updatedCompleted);
      await AsyncStorage.setItem(COMPLETED_LEVELS_KEY, JSON.stringify(updatedCompleted));

      // 2. Update best moves
      const updatedBestMoves = { ...bestMoves };
      if (updatedBestMoves[levelId] === undefined || moves < updatedBestMoves[levelId]) {
        updatedBestMoves[levelId] = moves;
        setBestMoves(updatedBestMoves);
        await AsyncStorage.setItem(BEST_MOVES_KEY, JSON.stringify(updatedBestMoves));
      }

      // 3. Update best times
      const updatedBestTimes = { ...bestTimes };
      if (updatedBestTimes[levelId] === undefined || timeSpent < updatedBestTimes[levelId]) {
        updatedBestTimes[levelId] = timeSpent;
        setBestTimes(updatedBestTimes);
        await AsyncStorage.setItem(BEST_TIMES_KEY, JSON.stringify(updatedBestTimes));
      }
    } catch (e) {
      console.error('Failed to save level completion', e);
    }
  };

  const resetProgress = async () => {
    try {
      await AsyncStorage.multiRemove([
        THEME_KEY,
        SOUND_KEY,
        COMPLETED_LEVELS_KEY,
        BEST_MOVES_KEY,
        BEST_TIMES_KEY,
      ]);
      setTheme('dark');
      setSoundEnabled(true);
      setCompletedLevels([1]);
      setBestMoves({});
      setBestTimes({});
    } catch (e) {
      console.error('Failed to reset game progress', e);
    }
  };

  return (
    <GameContext.Provider
      value={{
        theme,
        soundEnabled,
        completedLevels,
        bestMoves,
        bestTimes,
        isLoaded,
        toggleTheme,
        toggleSound,
        completeLevel,
        resetProgress,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
