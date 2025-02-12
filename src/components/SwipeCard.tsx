import { View, StyleSheet, Dimensions, Image } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import React from 'react';
import { Text } from '@/components/base/Text';
import { useTranslation } from 'react-i18next';
import type { Dilemma, DilemmaContent } from '@/types/dilemma';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeCardProps {
  dilemma: Dilemma;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  style?: object;
}

function StatIndicator({ value, type }: { value: number; type: 'happiness' | 'budget' | 'environment' }) {
  if (value === 0) return null;

  const icon = {
    happiness: 'heart',
    budget: 'cash',
    environment: 'leaf'
  }[type] as keyof typeof Ionicons.glyphMap;

  const color = value >= 0 ? 'rgba(52, 199, 89, 0.9)' : 'rgba(255, 59, 48, 0.9)';
  const prefix = value >= 0 ? '+' : '';

  return (
    <View style={styles.statRow}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={[styles.statValue, { color }]}>{prefix}{value}%</Text>
    </View>
  );
}

export function SwipeCard({ dilemma, onSwipeLeft, onSwipeRight, style }: SwipeCardProps) {
  const { i18n, t } = useTranslation();
  const currentLang = i18n.language as keyof typeof dilemma;
  const content = dilemma[currentLang] as DilemmaContent || dilemma.en as DilemmaContent;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotate = useSharedValue(0);

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    'worklet';
    translateX.value = event.nativeEvent.translationX;
    translateY.value = event.nativeEvent.translationY;
    rotate.value = translateX.value / SCREEN_WIDTH * 15;
  };

  const onGestureEnd = () => {
    'worklet';
    if (Math.abs(translateX.value) > SWIPE_THRESHOLD) {
      const moveToX = (translateX.value > 0 ? 1 : -1) * SCREEN_WIDTH * 1.5;
      translateX.value = withSpring(moveToX, { damping: 15 });
      translateY.value = withSpring(0);
      
      if (moveToX > 0 && onSwipeRight) {
        runOnJS(onSwipeRight)();
      } else if (moveToX < 0 && onSwipeLeft) {
        runOnJS(onSwipeLeft)();
      }
    } else {
      translateX.value = withSpring(0);
      translateY.value = withSpring(0);
      rotate.value = withSpring(0);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotate.value}deg` },
    ],
  }));

  // Add opacity values for indicators
  const leftIndicatorOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(Math.abs(Math.min(translateX.value, 0)) / SWIPE_THRESHOLD, 1),
  }));

  const rightIndicatorOpacity = useAnimatedStyle(() => ({
    opacity: Math.min(Math.max(translateX.value, 0) / SWIPE_THRESHOLD, 1),
  }));

  return (
    <View style={[styles.container, style]}>
      <Animated.View style={[styles.indicator, styles.leftIndicator, leftIndicatorOpacity]}>
        <View style={styles.indicatorContent}>
          <Text style={[styles.indicatorText, styles.rejectText]}>{content.swipe_left.split(':')[0]}</Text>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.indicator, styles.rightIndicator, rightIndicatorOpacity]}>
        <View style={styles.indicatorContent}>
          <Text style={[styles.indicatorText, styles.acceptText]}>{content.swipe_right.split(':')[0]}</Text>
        </View>
      </Animated.View>

      <PanGestureHandler onGestureEvent={onGestureEvent} onEnded={onGestureEnd}>
        <Animated.View style={[styles.card, animatedStyle]}>
          <View style={styles.cardContent}>
            <Text style={styles.title}>{content.title}</Text>
            <Text style={styles.description}>{content.description}</Text>
            <View style={styles.choicesContainer}>
              <View style={styles.choiceColumn}>
                <View style={styles.choiceRow}>
                  <Text style={styles.choiceText}>{content.swipe_left.split(':')[0]}</Text>
                  <Text style={styles.choiceText}>{content.swipe_right.split(':')[0]}</Text>
                </View>
                <View style={styles.choiceRow}>
                  <View style={styles.statsGroup}>
                    <StatIndicator value={dilemma.swipe_left_stats.happiness} type="happiness" />
                    <StatIndicator value={dilemma.swipe_left_stats.budget} type="budget" />
                    <StatIndicator value={dilemma.swipe_left_stats.environment} type="environment" />
                  </View>
                  <View style={styles.statsGroup}>
                    <StatIndicator value={dilemma.swipe_right_stats.happiness} type="happiness" />
                    <StatIndicator value={dilemma.swipe_right_stats.budget} type="budget" />
                    <StatIndicator value={dilemma.swipe_right_stats.environment} type="environment" />
                  </View>
                </View>
                <View style={styles.choiceRow}>
                  <View style={styles.arrowContainer}>
                    <Image source={require('../../assets/images/arrow.png')} style={[styles.arrow, styles.leftArrow]} />
                  </View>
                  <View style={styles.arrowContainer}>
                    <Image source={require('../../assets/images/arrow.png')} style={[styles.arrow, styles.rightArrow]} />
                  </View>
                </View>
              </View>
            </View>
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    overflow: 'hidden',
  },
  cardContainer: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    position: 'relative',
  },
  card: {
    width: SCREEN_WIDTH * 0.9,
    height: SCREEN_WIDTH * 1.2,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    padding: 20,
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  description: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  choicesContainer: {
    width: '100%',
  },
  choiceColumn: {
    width: '100%',
    gap: 16,
  },
  choiceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  choiceText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statsGroup: {
    flex: 1,
    gap: 8,
    alignItems: 'center',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 80,
    opacity: 0,
    height: '100%',
  },
  leftIndicator: {
    left: 0,
    backgroundColor: 'rgba(255, 59, 48, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 59, 48, 0.5)',
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 1.7,
    top: '50%',
    transform: [{ translateY: '-50%' }],
    zIndex: 1
  },
  rightIndicator: {
    right: 0,
    backgroundColor: 'rgba(52, 199, 89, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(52, 199, 89, 0.5)',
    width: SCREEN_WIDTH * 0.2,
    height: SCREEN_WIDTH * 1.7,
    top: '50%',
    transform: [{ translateY: '-50%' }],
    zIndex: 1
  },
  indicatorContent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    transform: [
      { rotate: '90deg' }
    ],
    gap: 16,
  },
  indicatorText: {
    fontSize: 24,
    fontWeight: 'bold',
    width: SCREEN_WIDTH * 1.2,
    textAlign: 'center',
  },
  rejectText: {
    color: 'rgba(255, 59, 48, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  acceptText: {
    color: 'rgba(52, 199, 89, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 8,
    minWidth: 80,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  arrowContainer: {
    flex: 1,
    alignItems: 'center',
  },
  arrow: {
    width: 64,
    height: 32,
  },
  leftArrow: {
    transform: [{ scaleX: -1 }],
  },
  rightArrow: {
    // Empty
  },
}); 