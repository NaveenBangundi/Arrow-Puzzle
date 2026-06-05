import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  SafeAreaView,
  Animated,
} from 'react-native';
import { ChevronLeft, RotateCcw, Play, CheckCircle, Home, Grid, Clock, Hash } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { levels } from '../data/levels';
import { generateInitialGrid, rotateClockwise, tracePath, CellCoord } from '../utils/gameLogic';
import { Board } from '../components/Board';
import { useGameAudio } from '../hooks/useGameAudio';
import { StatusBar } from 'expo-status-bar';

export const GameScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { levelId } = route.params;
  const { theme, completeLevel } = useGame();
  const { playRotateSound, playWinSound, playClickSound } = useGameAudio();

  const [currentLevelId, setCurrentLevelId] = useState<number>(levelId);
  const level = levels.find((lvl) => lvl.id === currentLevelId) || levels[0];

  // Grid and path states
  const [grid, setGrid] = useState<string[][]>([]);
  const [activePath, setActivePath] = useState<CellCoord[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [hasWon, setHasWon] = useState<boolean>(false);
  const [showWinModal, setShowWinModal] = useState<boolean>(false);

  // Timer states
  const [seconds, setSeconds] = useState<number>(0);
  const timerRef = useRef<any>(null);

  // Win Modal scale animation
  const winScaleAnim = useRef(new Animated.Value(0)).current;

  // Load level and initialize
  useEffect(() => {
    initLevel();
    return () => stopTimer();
  }, [currentLevelId]);

  // Handle active gameplay timer
  useEffect(() => {
    if (showWinModal || hasWon) {
      stopTimer();
    } else {
      startTimer();
    }
  }, [showWinModal, hasWon]);

  const initLevel = () => {
    const initialGrid = generateInitialGrid(level);
    setGrid(initialGrid);
    setMoves(0);
    setSeconds(0);
    setHasWon(false);
    setShowWinModal(false);

    // Initial path trace
    const { path, hasReachedTarget } = tracePath(initialGrid, level.start, level.target);
    setActivePath(path);
    if (hasReachedTarget) {
      setHasWon(true);
    }
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCellPress = (r: number, c: number) => {
    if (hasWon) return;

    playRotateSound();
    setMoves((prev) => prev + 1);

    // Update grid state
    const newGrid = grid.map((rowArr, rowIndex) =>
      rowArr.map((cellDir, colIndex) => {
        if (rowIndex === r && colIndex === c) {
          return rotateClockwise(cellDir as any);
        }
        return cellDir;
      })
    );

    setGrid(newGrid);

    // Trace path on the new grid configuration
    const { path, hasReachedTarget } = tracePath(newGrid as any[][], level.start, level.target);
    setActivePath(path);

    if (hasReachedTarget) {
      setHasWon(true);
      handleWin();
    }
  };

  const handleWin = () => {
    playWinSound();
    
    // Save completion and progress locally
    completeLevel(currentLevelId, moves + 1, seconds);

    setTimeout(() => {
      setShowWinModal(true);
      Animated.spring(winScaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }, 500);
  };

  const handleNextLevel = () => {
    playClickSound();
    if (currentLevelId < 50) {
      winScaleAnim.setValue(0);
      setCurrentLevelId((prev) => prev + 1);
    } else {
      setShowWinModal(false);
      navigation.navigate('Levels');
    }
  };

  const handleRestart = () => {
    playClickSound();
    initLevel();
  };

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const isDark = theme === 'dark';
  const containerBg = isDark ? '#0b0c10' : '#f4f6f9';
  const headerTextColor = isDark ? '#ffffff' : '#1f2833';
  const dashboardBg = isDark ? 'rgba(31, 40, 51, 0.6)' : '#ffffff';
  const dashboardBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)';
  const labelColor = isDark ? '#66fcf1' : '#0f4c81';
  const difficultyColor =
    level.difficulty === 'easy'
      ? '#10b981'
      : level.difficulty === 'medium'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => {
            playClickSound();
            navigation.goBack();
          }}
        >
          <ChevronLeft size={24} color={isDark ? '#66fcf1' : '#0f4c81'} />
        </TouchableOpacity>
        
        <View style={styles.headerTitleContainer}>
          <Text style={[styles.levelTitle, { color: headerTextColor }]}>LEVEL {currentLevelId}</Text>
          <Text style={[styles.levelDifficulty, { color: difficultyColor }]}>
            {level.difficulty.toUpperCase()}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.headerButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
          onPress={handleRestart}
          activeOpacity={0.7}
        >
          <RotateCcw size={20} color={isDark ? '#66fcf1' : '#0f4c81'} />
        </TouchableOpacity>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.dashboardContainer}>
        <View style={[styles.statBox, { backgroundColor: dashboardBg, borderColor: dashboardBorder }]}>
          <Clock size={16} color={labelColor} />
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>TIME</Text>
            <Text style={[styles.statValue, { color: headerTextColor }]}>{formatTime(seconds)}</Text>
          </View>
        </View>

        <View style={[styles.statBox, { backgroundColor: dashboardBg, borderColor: dashboardBorder }]}>
          <Hash size={16} color={labelColor} />
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>MOVES</Text>
            <Text style={[styles.statValue, { color: headerTextColor }]}>{moves}</Text>
          </View>
        </View>
      </View>

      {/* Grid Board */}
      <View style={styles.boardWrapper}>
        <View style={[styles.boardCard, {
          backgroundColor: isDark ? 'rgba(31, 40, 51, 0.25)' : 'rgba(255, 255, 255, 0.45)',
          borderColor: isDark ? 'rgba(102, 252, 241, 0.1)' : 'rgba(15, 76, 129, 0.05)',
          shadowColor: isDark ? '#66fcf1' : '#0f4c81',
          shadowOpacity: isDark ? 0.05 : 0.1,
        }]}>
          {grid.length > 0 && (
            <Board
              level={level}
              grid={grid as any}
              activePath={activePath}
              theme={theme}
              onCellPress={handleCellPress}
            />
          )}
        </View>
      </View>

      {/* Help Instructions */}
      <View style={styles.instructionContainer}>
        <Text style={[styles.instructionText, { color: isDark ? '#8a94a6' : '#556080' }]}>
          Tap arrows to rotate. Establish a continuous route from the green start block to the gold flag.
        </Text>
      </View>

      {/* Win Modal Dialog */}
      <Modal visible={showWinModal} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View
            style={[
              styles.modalCard,
              {
                backgroundColor: isDark ? '#1f2833' : '#ffffff',
                transform: [{ scale: winScaleAnim }],
              },
            ]}
          >
            <CheckCircle size={60} color="#10b981" style={styles.winIcon} />
            <Text style={[styles.winTitle, { color: isDark ? '#66fcf1' : '#0f4c81' }]}>
              LEVEL SOLVED!
            </Text>
            
            <View style={styles.summaryContainer}>
              <View style={[styles.summaryBox, { backgroundColor: isDark ? '#0b0c10' : '#f4f6f9' }]}>
                <Text style={styles.summaryLabel}>Moves</Text>
                <Text style={[styles.summaryValue, { color: isDark ? '#ffffff' : '#1f2833' }]}>
                  {moves}
                </Text>
              </View>
              <View style={[styles.summaryBox, { backgroundColor: isDark ? '#0b0c10' : '#f4f6f9' }]}>
                <Text style={styles.summaryLabel}>Time Taken</Text>
                <Text style={[styles.summaryValue, { color: isDark ? '#ffffff' : '#1f2833' }]}>
                  {formatTime(seconds)}
                </Text>
              </View>
            </View>

            {/* Modal Control Buttons */}
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[
                  styles.modalBtnPrimary,
                  { backgroundColor: isDark ? '#66fcf1' : '#0f4c81' },
                ]}
                onPress={handleNextLevel}
                activeOpacity={0.8}
              >
                <Play size={18} color={isDark ? '#0b0c10' : '#ffffff'} fill={isDark ? '#0b0c10' : '#ffffff'} />
                <Text style={[styles.modalBtnPrimaryText, { color: isDark ? '#0b0c10' : '#ffffff' }]}>
                  {currentLevelId < 50 ? 'NEXT LEVEL' : 'BACK TO MENU'}
                </Text>
              </TouchableOpacity>

              <View style={styles.modalSecondaryRow}>
                <TouchableOpacity
                  style={[
                    styles.modalBtnSecondary,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                  ]}
                  onPress={() => {
                    playClickSound();
                    setShowWinModal(false);
                    navigation.navigate('Home');
                  }}
                >
                  <Home size={18} color={isDark ? '#c5c6c7' : '#1f2833'} />
                  <Text style={[styles.modalBtnSecondaryText, { color: isDark ? '#c5c6c7' : '#1f2833' }]}>
                    Menu
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.modalBtnSecondary,
                    { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' },
                  ]}
                  onPress={() => {
                    playClickSound();
                    setShowWinModal(false);
                    navigation.navigate('Levels');
                  }}
                >
                  <Grid size={18} color={isDark ? '#c5c6c7' : '#1f2833'} />
                  <Text style={[styles.modalBtnSecondaryText, { color: isDark ? '#c5c6c7' : '#1f2833' }]}>
                    Levels
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    alignItems: 'center',
  },
  levelTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 2,
  },
  levelDifficulty: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 2,
  },
  dashboardContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginVertical: 10,
  },
  statBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  statColumn: {
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8a94a6',
    letterSpacing: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  boardWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  boardCard: {
    padding: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 20,
    elevation: 4,
  },
  instructionContainer: {
    paddingHorizontal: 40,
    paddingBottom: 25,
    alignItems: 'center',
  },
  instructionText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
  },
  // Modal Win Overlay styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    maxWidth: 340,
    borderRadius: 24,
    paddingVertical: 35,
    paddingHorizontal: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  winIcon: {
    marginBottom: 15,
  },
  winTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 25,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 30,
  },
  summaryBox: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 16,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8a94a6',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalButtons: {
    width: '100%',
    gap: 12,
  },
  modalBtnPrimary: {
    width: '100%',
    height: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalBtnPrimaryText: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  modalSecondaryRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modalBtnSecondary: {
    flex: 1,
    height: 46,
    borderRadius: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  modalBtnSecondaryText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
