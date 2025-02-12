import React, { useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
  useAnimatedReaction,
  cancelAnimation,
  runOnJS,
} from 'react-native-reanimated';
import { useGameStore } from '@/stores/gameStore';
import { useTranslation } from 'react-i18next';

interface ClockProps {
  onTimeChange?: (opacity: number) => void;
}

export function Clock({ onTimeChange }: ClockProps) {
  const { day, isDayComplete, setDayComplete, isTimerPaused } = useGameStore();
  const { t } = useTranslation();
  const rotation = useSharedValue(0);
  const isAnimating = useSharedValue(false);

  useEffect(() => {
    if (!isDayComplete && !isTimerPaused && !isAnimating.get()) {
      isAnimating.set(true);
      rotation.set(0);
      
      try {
        const animation = withTiming(360, {
          duration: 30000,
          easing: Easing.linear,
        });
        rotation.set(animation);
      } catch (error) {
        console.error('[Clock] Animation error:', error);
      }
    }

    return () => {
      cancelAnimation(rotation);
      isAnimating.set(false);
    };
  }, [isDayComplete, isTimerPaused]);

  useAnimatedReaction(
    () => rotation.get(),
    (currentRotation) => {
      if (currentRotation >= 360 && isAnimating.get()) {
        isAnimating.set(false);
        rotation.set(360);
        runOnJS(setDayComplete)(true);
      }
      
      if (isAnimating.get()) {
        const opacity = Math.cos((currentRotation * Math.PI) / 180) * 0.3 + 0.5;
        onTimeChange?.(opacity);
      }
    },
    [isAnimating.get()]
  );

  const clockHandStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  return (
    <View>
      <Text style={styles.dayText}>
        {t('common.day')} {day}
      </Text>
      <View style={styles.clockFace}>
        {[...Array(12)].map((_, i) => (
          <View
            key={i}
            style={[
              styles.hourMarker,
              {
                transform: [
                  { rotate: `${i * 30}deg` },
                ],
              },
            ]}
          >
            <View style={styles.markerDot} />
          </View>
        ))}

        <Animated.View style={[styles.clockHand, clockHandStyle]} />
        
        <View style={styles.centerDot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  clockFace: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  hourMarker: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
  },
  markerDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: 2,
  },
  clockHand: {
    position: 'absolute',
    width: 2,
    height: '40%',
    backgroundColor: '#FFFFFF',
    bottom: '50%',
    borderRadius: 1,
    transformOrigin: 'bottom',
  },
  centerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    position: 'absolute',
  },
  dayText: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
}); 