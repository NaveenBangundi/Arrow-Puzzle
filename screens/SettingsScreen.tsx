import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
  Alert,
  SafeAreaView,
} from 'react-native';
import { ChevronLeft, Moon, Sun, Volume2, RotateCcw, ShieldAlert } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { useGameAudio } from '../hooks/useGameAudio';
import { StatusBar } from 'expo-status-bar';

export const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, soundEnabled, toggleTheme, toggleSound, resetProgress } = useGame();
  const { playClickSound } = useGameAudio();

  const handleResetConfirm = () => {
    playClickSound();
    Alert.alert(
      'Reset Game Progress',
      'Are you absolutely sure you want to clear your game history? This will lock all levels except Level 1 and delete all your high scores. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: async () => {
            await resetProgress();
            Alert.alert('Success', 'Game data has been reset.');
          },
        },
      ]
    );
  };

  const isDark = theme === 'dark';
  const containerBg = isDark ? '#0b0c10' : '#f4f6f9';
  const headerTextColor = isDark ? '#ffffff' : '#1f2833';
  const cardBg = isDark ? 'rgba(31, 40, 51, 0.6)' : '#ffffff';
  const cardBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0,0,0,0.05)';
  const labelColor = isDark ? '#c5c6c7' : '#1f2833';
  const activeIconColor = isDark ? '#66fcf1' : '#0f4c81';

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
        <Text style={[styles.headerTitle, { color: headerTextColor }]}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.content}>
        {/* SETTINGS CARD */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          {/* THEME TOGGLE */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              {isDark ? (
                <Moon size={22} color={activeIconColor} />
              ) : (
                <Sun size={22} color={activeIconColor} />
              )}
              <View style={styles.labelTexts}>
                <Text style={[styles.settingLabel, { color: labelColor }]}>Dark Theme</Text>
                <Text style={styles.settingDesc}>
                  {isDark ? 'Comfortable night mode active' : 'Classic bright aesthetic active'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDark}
              onValueChange={() => {
                playClickSound();
                toggleTheme();
              }}
              trackColor={{ false: '#767577', true: isDark ? '#1f2833' : '#b2ebf2' }}
              thumbColor={isDark ? '#66fcf1' : '#0f4c81'}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)' }]} />

          {/* SOUND TOGGLE */}
          <View style={styles.row}>
            <View style={styles.rowLabelContainer}>
              <Volume2 size={22} color={activeIconColor} />
              <View style={styles.labelTexts}>
                <Text style={[styles.settingLabel, { color: labelColor }]}>Sound Effects</Text>
                <Text style={styles.settingDesc}>Play dynamic audio cues on arrow taps</Text>
              </View>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#767577', true: isDark ? '#1f2833' : '#b2ebf2' }}
              thumbColor={soundEnabled ? (isDark ? '#66fcf1' : '#0f4c81') : '#f4f3f4'}
            />
          </View>
        </View>

        {/* DATA MANAGEMENT CARD */}
        <View style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
          <TouchableOpacity style={styles.resetButton} onPress={handleResetConfirm} activeOpacity={0.75}>
            <View style={styles.rowLabelContainer}>
              <RotateCcw size={22} color="#ef4444" />
              <View style={styles.labelTexts}>
                <Text style={[styles.settingLabel, { color: '#ef4444' }]}>Reset Game Progress</Text>
                <Text style={styles.settingDesc}>Clear all scores, levels unlocked, and times</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* INFO FOOTER */}
        <View style={styles.footer}>
          <ShieldAlert size={16} color="#8a94a6" />
          <Text style={styles.footerText}>Arrow Puzzle v1.0.0 • Developed with Expo</Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 20,
  },
  card: {
    borderRadius: 20,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  resetButton: {
    paddingVertical: 15,
    width: '100%',
  },
  rowLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  labelTexts: {
    flexDirection: 'column',
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11,
    color: '#8a94a6',
    marginTop: 3,
  },
  divider: {
    height: 1,
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 20,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8a94a6',
  },
});
