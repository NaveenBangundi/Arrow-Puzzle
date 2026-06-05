import React, { useEffect, useRef } from 'react';
import { StyleSheet, TouchableOpacity, Animated, View } from 'react-native';
import { ArrowUp, Flag, Play } from 'lucide-react-native';
import { Direction } from '../data/levels';

interface CellProps {
  direction: Direction;
  isStart: boolean;
  isTarget: boolean;
  isPartOfPath: boolean;
  theme: 'light' | 'dark';
  onPress: () => void;
  size: number;
}

const dirAngles: Record<Direction, number> = {
  UP: 0,
  RIGHT: 90,
  DOWN: 180,
  LEFT: 270,
};

export const Cell: React.FC<CellProps> = ({
  direction,
  isStart,
  isTarget,
  isPartOfPath,
  theme,
  onPress,
  size,
}) => {
  const rotationAnim = useRef(new Animated.Value(dirAngles[direction])).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const currentAngleRef = useRef(dirAngles[direction]);
  const prevDirRef = useRef<Direction>(direction);

  useEffect(() => {
    // Start pulsing animation for start/target nodes
    if (isStart || isTarget) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.12,
            duration: 1200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 1200,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isStart, isTarget]);

  useEffect(() => {
    const nextAngle = dirAngles[direction];
    const prevDir = prevDirRef.current;
    prevDirRef.current = direction;

    if (direction === prevDir) return;

    // Detect if this is a standard clockwise single step rotation
    const isClockwiseStep =
      (prevDir === 'UP' && direction === 'RIGHT') ||
      (prevDir === 'RIGHT' && direction === 'DOWN') ||
      (prevDir === 'DOWN' && direction === 'LEFT') ||
      (prevDir === 'LEFT' && direction === 'UP');

    if (isClockwiseStep) {
      // Animate clockwise by adding 90 degrees
      const newAngle = currentAngleRef.current + 90;
      currentAngleRef.current = newAngle;
      
      Animated.timing(rotationAnim, {
        toValue: newAngle,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset or jump: snap directly to the base angle to avoid weird spins
      currentAngleRef.current = nextAngle;
      rotationAnim.setValue(nextAngle);
    }
  }, [direction]);

  const handlePress = () => {
    if (isTarget) return; // Target node doesn't rotate, just receives paths

    // Micro-animation: Press bounce
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.85,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();

    onPress();
  };

  const isDark = theme === 'dark';

  // Base Cell styles based on theme
  const cellBg = isDark ? 'rgba(30, 30, 50, 0.7)' : 'rgba(255, 255, 255, 0.9)';
  const cellBorderColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Arrow & Glow Colors
  let arrowColor = isDark ? '#7a829e' : '#8a94a6';
  let cellGlowStyle = {};

  if (isStart) {
    arrowColor = '#10b981'; // Green
    cellGlowStyle = {
      borderColor: '#10b981',
      shadowColor: '#10b981',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 6,
    };
  } else if (isTarget) {
    arrowColor = '#f59e0b'; // Gold / Amber
    cellGlowStyle = {
      borderColor: '#f59e0b',
      shadowColor: '#f59e0b',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.8,
      shadowRadius: 10,
      elevation: 6,
    };
  } else if (isPartOfPath) {
    arrowColor = '#06b6d4'; // Glowing Cyan
    cellGlowStyle = {
      borderColor: 'rgba(6, 182, 212, 0.6)',
      shadowColor: '#06b6d4',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 4,
    };
  }

  // Dynamic interpolation for degrees rotation
  const rotateInterpolation = rotationAnim.interpolate({
    inputRange: [0, 360000],
    outputRange: ['0deg', '360000deg'],
  });

  return (
    <Animated.View
      style={[
        styles.cellContainer,
        {
          width: size,
          height: size,
          backgroundColor: cellBg,
          borderColor: cellBorderColor,
          transform: [{ scale: scaleAnim }, { scale: (isStart || isTarget) ? pulseAnim : 1 }],
        },
        cellGlowStyle,
      ]}
    >
      <TouchableOpacity
        style={styles.touchArea}
        onPress={handlePress}
        activeOpacity={0.9}
        disabled={isTarget}
      >
        {isStart && !isPartOfPath ? (
          <View style={[styles.startBadge, { marginLeft: 3 }]}>
            <Play size={size * 0.4} color="#10b981" fill="#10b981" />
          </View>
        ) : isTarget ? (
          <Flag size={size * 0.45} color="#f59e0b" fill="rgba(245, 158, 11, 0.2)" />
        ) : (
          <Animated.View
            style={{
              transform: [{ rotate: rotateInterpolation }],
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ArrowUp
              size={size * 0.55}
              color={arrowColor}
              strokeWidth={isPartOfPath || isStart ? 3.5 : 2.5}
            />
          </Animated.View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cellContainer: {
    margin: 4,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'visible',
  },
  touchArea: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  startBadge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
