import React, { useEffect } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from './base/Text';
import { useEffectStore } from '@/stores/effectStore';
import { Ionicons } from '@expo/vector-icons';
import { useGameStore } from '@/stores/gameStore';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

export function EffectBanner() {
  const { activeEffect } = useEffectStore();
  const { timeLeft, getDayDuration } = useGameStore();

  const progressStyle = useAnimatedStyle(() => {
    const duration = getDayDuration() / 1000;
    const progress = (timeLeft / duration) * 100;
    
    return {
      width: withTiming(`${progress}%`, { duration: 1000 }),
    };
  });

  if (!activeEffect) return null;

  const isBonus = activeEffect.bonus > 0;
  const icon = {
    happiness: 'heart',
    budget: 'cash',
    environment: 'leaf'
  }[activeEffect.bonus_type];

  return (
    <Pressable style={[
      styles.container,
      { backgroundColor: isBonus ? 'rgba(76, 175, 80, 0.35)' : 'rgba(244, 67, 54, 0.35)' }
    ]}>
      <AnimatedView 
        style={[
          styles.progressBar, 
          { backgroundColor: isBonus ? 'rgba(76, 175, 80, 0.5)' : 'rgba(244, 67, 54, 0.5)' },
          progressStyle
        ]} 
      />
      <View style={styles.darkOverlay} />
      <View style={styles.content}>
        <Ionicons 
          name={icon as any} 
          size={28} 
          color={isBonus ? '#4CAF50' : '#F44336'} 
        />
        <Text style={styles.text}>
          {isBonus ? '+' : ''}{activeEffect.bonus}% {activeEffect.description}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    borderRadius: 0,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 100,
  },
  progressBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 16,
  },
  darkOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  }
}); 