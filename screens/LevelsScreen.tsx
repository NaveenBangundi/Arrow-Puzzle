import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Lock, ChevronLeft, Award, Trophy } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { levels, Difficulty } from '../data/levels';
import { useGameAudio } from '../hooks/useGameAudio';
import { StatusBar } from 'expo-status-bar';

const { width } = Dimensions.get('window');

export const LevelsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, completedLevels, bestMoves, bestTimes } = useGame();
  const { playClickSound } = useGameAudio();
  const [activeTab, setActiveTab] = useState<Difficulty>('easy');

  const filteredLevels = levels.filter((lvl) => lvl.difficulty === activeTab);

  const handleLevelSelect = (levelId: number) => {
    const isUnlocked = completedLevels.includes(levelId);
    if (!isUnlocked) return;
    
    playClickSound();
    navigation.navigate('Game', { levelId });
  };

  const isDark = theme === 'dark';
  const containerBg = isDark ? '#0b0c10' : '#f4f6f9';
  const headerTextColor = isDark ? '#ffffff' : '#1f2833';
  const cardBg = isDark ? 'rgba(31, 40, 51, 0.6)' : '#ffffff';
  const tabActiveBg = isDark ? '#66fcf1' : '#0f4c81';
  const tabActiveText = isDark ? '#0b0c10' : '#ffffff';
  const tabInactiveBg = isDark ? 'rgba(31, 40, 51, 0.4)' : 'rgba(0, 0, 0, 0.05)';
  const tabInactiveText = isDark ? '#c5c6c7' : '#556080';

  const formatTime = (seconds?: number) => {
    if (seconds === undefined) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}
          onPress={() => {
            playClickSound();
            navigation.goBack();
          }}
        >
          <ChevronLeft size={24} color={isDark ? '#66fcf1' : '#0f4c81'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: headerTextColor }]}>Select Level</Text>
        <View style={{ width: 44 }} /> {/* Balance space */}
      </View>

      {/* Level Group Tabs */}
      <View style={styles.tabContainer}>
        {(['easy', 'medium', 'hard'] as Difficulty[]).map((tab) => {
          const isActive = activeTab === tab;
          const label = tab.toUpperCase();

          let activeBg = isDark ? '#66fcf1' : '#0f4c81';
          let tabGlowStyle = {};

          if (isActive) {
            if (tab === 'easy') {
              activeBg = '#10b981'; // Green glow
              tabGlowStyle = {
                shadowColor: '#10b981',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 4,
              };
            } else if (tab === 'medium') {
              activeBg = '#f59e0b'; // Amber glow
              tabGlowStyle = {
                shadowColor: '#f59e0b',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 4,
              };
            } else {
              activeBg = '#ef4444'; // Red glow
              tabGlowStyle = {
                shadowColor: '#ef4444',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.45,
                shadowRadius: 8,
                elevation: 4,
              };
            }
          }

          return (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                { backgroundColor: isActive ? activeBg : tabInactiveBg },
                tabGlowStyle,
              ]}
              onPress={() => {
                playClickSound();
                setActiveTab(tab);
              }}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: isActive ? tabActiveText : tabInactiveText },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Levels Scroll Grid */}
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredLevels.map((lvl) => {
            const isCompleted = completedLevels.includes(lvl.id) && completedLevels.includes(lvl.id + 1);
            const isUnlocked = completedLevels.includes(lvl.id);
            const moves = bestMoves[lvl.id];
            const time = bestTimes[lvl.id];

            let borderStyle = {};
            let numColor = isDark ? '#ffffff' : '#1f2833';

            if (!isUnlocked) {
              borderStyle = { borderColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', opacity: 0.4 };
              numColor = isDark ? '#555555' : '#aaaaaa';
            } else if (isCompleted) {
              borderStyle = { borderColor: '#10b981', borderWidth: 2 }; // Completed - Green border
            } else {
              borderStyle = { borderColor: isDark ? '#66fcf1' : '#0f4c81', borderWidth: 2 }; // Unlocked - Cyan/Blue border
            }

            return (
              <TouchableOpacity
                key={`lvl-${lvl.id}`}
                style={[
                  styles.levelCard,
                  { backgroundColor: cardBg },
                  borderStyle,
                ]}
                onPress={() => handleLevelSelect(lvl.id)}
                activeOpacity={isUnlocked ? 0.75 : 1}
                disabled={!isUnlocked}
              >
                {!isUnlocked ? (
                  <Lock size={20} color={isDark ? '#555555' : '#aaaaaa'} />
                ) : (
                  <View style={styles.cardContent}>
                    <Text style={[styles.levelNum, { color: numColor }]}>{lvl.id}</Text>
                    {isCompleted && (
                      <View style={styles.statsContainer}>
                        <View style={styles.statLine}>
                          <Trophy size={10} color="#f59e0b" />
                          <Text style={styles.statText}>{moves}m</Text>
                        </View>
                        <View style={styles.statLine}>
                          <Award size={10} color="#10b981" />
                          <Text style={styles.statText}>{formatTime(time)}</Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
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
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginVertical: 15,
    gap: 10,
  },
  tab: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  scrollContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  levelCard: {
    width: (width - 64) / 4, // 4 columns layout
    height: (width - 64) / 4,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
    padding: 4,
  },
  levelNum: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  statsContainer: {
    alignItems: 'center',
    marginTop: 2,
  },
  statLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    marginTop: 1,
  },
  statText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#8a94a6',
  },
});
