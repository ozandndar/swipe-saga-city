import { View, StyleSheet, Dimensions, SafeAreaView } from 'react-native';
import { Text } from '@/components/base/Text';
import { Ionicons } from '@expo/vector-icons';
import { Clock } from './Clock';
import { useGameStore } from '@/stores/gameStore';
import { useTranslation } from 'react-i18next';
import { useState, useEffect, useCallback } from 'react';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const STATS_WIDTH = SCREEN_WIDTH * 0.6; // Changed to 60%

interface StatItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  value: number;
  color: string;
}

function StatItem({ icon, value, color }: StatItemProps) {
  return (
    <View style={styles.statItem}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={32} color={color} />
      </View>
      <View style={[styles.statBar, { borderColor: color }]}>
        <View 
          style={[
            styles.statFill, 
            { width: `${value}%`, backgroundColor: color }
          ]} 
        />
      </View>
    </View>
  );
}

interface StatsBarProps {
  onTimeChange: (opacity: number) => void;
}

export function StatsBar({ onTimeChange }: StatsBarProps) {
  const { t } = useTranslation();
  const { happiness, budget, environment } = useGameStore();
  const [currentTime, setCurrentTime] = useState(0);

  const updateTime = useCallback((time: number) => {
    const opacity = 0.3 + (time / 24) * 0.4;
    onTimeChange(opacity);
  }, [onTimeChange]);

  useEffect(() => {
    let mounted = true;
    const interval = setInterval(() => {
      if (!mounted) return;
      
      setCurrentTime(prev => {
        const next = prev + 1;
        if (next >= 24) {
          clearInterval(interval);
          return 24;
        }
        updateTime(next);
        return next;
      });
    }, 1000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [updateTime]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.statsContainer}>
          <StatItem icon="heart" value={happiness} color="#FF5B5B" />
          <StatItem icon="cash" value={budget} color="#FFD700" />
          <StatItem icon="leaf" value={environment} color="#2ECC71" />
        </View>
        <View style={styles.clockContainer}>
          <Clock onTimeChange={onTimeChange} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    paddingHorizontal: 20,
  },
  statsContainer: {
    width: STATS_WIDTH,
    gap: 12,
  },
  clockContainer: {
    flex: 1, // Changed to flex 1 to take remaining space (40%)
    alignItems: 'center',
    justifyContent: 'center',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 20,
  },
  statBar: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1.5,
  },
  statFill: {
    height: '100%',
    borderRadius: 8,
  },
}); 