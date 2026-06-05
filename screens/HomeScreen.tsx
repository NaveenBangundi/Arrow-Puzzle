import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Animated,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { Play, Grid, Settings, Volume2, VolumeX, ArrowUpRight } from 'lucide-react-native';
import { useGame } from '../context/GameContext';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { theme, soundEnabled, toggleSound, completedLevels } = useGame();
  
  // Floating background elements
  const floatAnims = useRef(
    Array.from({ length: 6 }, () => ({
      y: new Animated.Value(height + 100),
      x: Math.random() * (width - 60),
      rotate: new Animated.Value(0),
      scale: 0.5 + Math.random() * 0.8,
      speed: 12000 + Math.random() * 8000,
    }))
  ).current;

  // Title fade/scale anim
  const titleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start floating background animation loops
    floatAnims.forEach((anim) => {
      const startFloat = () => {
        anim.y.setValue(height + 100);
        // Randomize rotation
        anim.rotate.setValue(0);
        
        Animated.parallel([
          Animated.timing(anim.y, {
            toValue: -150,
            duration: anim.speed,
            useNativeDriver: true,
          }),
          Animated.timing(anim.rotate, {
            toValue: 360,
            duration: anim.speed,
            useNativeDriver: true,
          }),
        ]).start(() => startFloat());
      };
      
      // Delay start to scatter them initially
      setTimeout(startFloat, Math.random() * 5000);
    });

    // Animate Title
    Animated.spring(titleAnim, {
      toValue: 1,
      tension: 20,
      friction: 6,
      useNativeDriver: true,
    }).start();
  }, []);

  const handlePlay = () => {
    // Play the highest unlocked level
    const latestLevel = Math.max(...completedLevels);
    navigation.navigate('Game', { levelId: latestLevel });
  };

  const isDark = theme === 'dark';
  const containerBg = isDark ? '#0b0c10' : '#f4f6f9';
  const titleColor = isDark ? '#66fcf1' : '#0f4c81';
  const textColor = isDark ? '#c5c6c7' : '#556080';
  const buttonBg = isDark ? 'rgba(31, 40, 51, 0.9)' : '#ffffff';
  const buttonBorder = isDark ? 'rgba(102, 252, 241, 0.2)' : 'rgba(15, 76, 129, 0.1)';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: containerBg }]}>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      {/* Floating Animated Arrows Background */}
      {floatAnims.map((anim, idx) => (
        <Animated.View
          key={`float-arrow-${idx}`}
          style={[
            styles.floatingArrow,
            {
              left: anim.x,
              transform: [
                { translateY: anim.y },
                {
                  rotate: anim.rotate.interpolate({
                    inputRange: [0, 360],
                    outputRange: ['0deg', '360deg'],
                  }),
                },
                { scale: anim.scale },
              ],
              opacity: isDark ? 0.08 : 0.15,
            },
          ]}
        >
          <ArrowUpRight size={50} color={isDark ? '#66fcf1' : '#0f4c81'} />
        </Animated.View>
      ))}

      <View style={styles.mainContent}>
        {/* Animated Title & Logo */}
        <Animated.View
          style={[
            styles.titleContainer,
            {
              opacity: titleAnim,
              transform: [
                {
                  scale: titleAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1],
                  }),
                },
              ],
            },
          ]}
        >
          <View style={[styles.logoOutline, { borderColor: titleColor }]}>
            <ArrowUpRight size={56} color={titleColor} strokeWidth={3} />
          </View>
          <Text style={[styles.gameTitle, { color: titleColor }]}>ARROW</Text>
          <Text style={[styles.gameSubtitle, { color: isDark ? '#ffffff' : '#1f2833' }]}>PUZZLE</Text>
          <Text style={[styles.gameTagline, { color: textColor }]}>Connect the flow. Reach the goal.</Text>
        </Animated.View>

        {/* Buttons List */}
        <View style={[styles.menuContainer, { 
          backgroundColor: isDark ? 'rgba(31, 40, 51, 0.45)' : 'rgba(255, 255, 255, 0.65)',
          borderColor: isDark ? 'rgba(102, 252, 241, 0.15)' : 'rgba(15, 76, 129, 0.08)'
        }]}>
          {/* PLAY BUTTON (NEON GLOW) */}
          <TouchableOpacity
            style={[
              styles.playButton,
              {
                backgroundColor: isDark ? '#66fcf1' : '#0f4c81',
                shadowColor: isDark ? '#66fcf1' : '#0f4c81',
              },
            ]}
            onPress={handlePlay}
            activeOpacity={0.85}
          >
            <Play size={24} color={isDark ? '#0b0c10' : '#ffffff'} fill={isDark ? '#0b0c10' : '#ffffff'} />
            <Text style={[styles.playButtonText, { color: isDark ? '#0b0c10' : '#ffffff' }]}>
              PLAY NOW
            </Text>
          </TouchableOpacity>

          {/* LEVELS BUTTON */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
            onPress={() => navigation.navigate('Levels')}
            activeOpacity={0.8}
          >
            <Grid size={22} color={isDark ? '#66fcf1' : '#0f4c81'} />
            <Text style={[styles.menuButtonText, { color: isDark ? '#ffffff' : '#1f2833' }]}>
              LEVEL SELECTOR
            </Text>
          </TouchableOpacity>

          {/* SETTINGS BUTTON */}
          <TouchableOpacity
            style={[styles.menuButton, { backgroundColor: buttonBg, borderColor: buttonBorder }]}
            onPress={() => navigation.navigate('Settings')}
            activeOpacity={0.8}
          >
            <Settings size={22} color={isDark ? '#66fcf1' : '#0f4c81'} />
            <Text style={[styles.menuButtonText, { color: isDark ? '#ffffff' : '#1f2833' }]}>
              SETTINGS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Sound Toggle Footer */}
        <TouchableOpacity
          style={[
            styles.soundToggle,
            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' },
          ]}
          onPress={toggleSound}
          activeOpacity={0.7}
        >
          {soundEnabled ? (
            <Volume2 size={20} color={isDark ? '#66fcf1' : '#0f4c81'} />
          ) : (
            <VolumeX size={20} color={isDark ? '#ff4d4d' : '#888888'} />
          )}
          <Text style={[styles.soundToggleText, { color: isDark ? '#c5c6c7' : '#556080' }]}>
            SFX: {soundEnabled ? 'ON' : 'OFF'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  floatingArrow: {
    position: 'absolute',
    pointerEvents: 'none',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 50,
    paddingHorizontal: 30,
    zIndex: 2,
  },
  titleContainer: {
    alignItems: 'center',
    marginTop: height * 0.08,
  },
  logoOutline: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(102, 252, 241, 0.05)',
  },
  gameTitle: {
    fontSize: 48,
    fontWeight: '900',
    letterSpacing: 6,
    fontFamily: 'System',
    textAlign: 'center',
  },
  gameSubtitle: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 4,
    fontFamily: 'System',
    textAlign: 'center',
    marginTop: -4,
  },
  gameTagline: {
    fontSize: 14,
    marginTop: 15,
    letterSpacing: 1,
    fontFamily: 'System',
    opacity: 0.8,
  },
  menuContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    gap: 15,
    marginVertical: 40,
    padding: 24,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  playButton: {
    width: '100%',
    height: 60,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },
  menuButton: {
    width: '100%',
    height: 54,
    borderRadius: 27,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    gap: 15,
  },
  menuButtonText: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  soundToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  soundToggleText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
