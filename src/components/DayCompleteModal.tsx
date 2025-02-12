import { View, StyleSheet, Modal, Pressable, Dimensions } from 'react-native';
import { Text } from '@/components/base/Text';
import { useGameStore } from '@/stores/gameStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

const { width } = Dimensions.get('window');

export function DayCompleteModal() {
  const { isDayComplete, day, health, budget, environment, incrementDay } = useGameStore();
  const { t } = useTranslation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleNextDay = () => {
    if (isProcessing) return; // Prevent multiple clicks
    console.log("clicked");
    setIsProcessing(true);
    incrementDay();
  };

  // Reset processing state when modal closes
  useEffect(() => {
    if (!isDayComplete) {
      setIsProcessing(false);
    }
  }, [isDayComplete]);

  return (
    <Modal
      transparent
      visible={isDayComplete}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Ionicons name="star" size={32} color="#FFD700" />
            <Text style={styles.title}>
              {t('common.dayComplete', { day })}
            </Text>
            <Ionicons name="star" size={32} color="#FFD700" />
          </View>

          <View style={styles.divider} />

          <Text style={styles.summary}>{t('common.dailyReport')}</Text>
          
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Ionicons name="heart" size={24} color="#FF5B5B" />
              <Text style={styles.statLabel}>{t('stats.health')}:</Text>
              <Text style={[styles.statValue, { color: '#FF5B5B' }]}>{health}%</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="cash" size={24} color="#FFD700" />
              <Text style={styles.statLabel}>Budget:</Text>
              <Text style={[styles.statValue, { color: '#FFD700' }]}>{budget}%</Text>
            </View>
            <View style={styles.statRow}>
              <Ionicons name="leaf" size={24} color="#2ECC71" />
              <Text style={styles.statLabel}>Environment:</Text>
              <Text style={[styles.statValue, { color: '#2ECC71' }]}>{environment}%</Text>
            </View>
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.button,
              pressed && styles.buttonPressed
            ]} 
            onPress={handleNextDay}
            disabled={isProcessing}
          >
            <Text style={styles.buttonText}>{t('common.nextDay')}</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    width: width * 0.85,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#FFD700',
    padding: 24,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 2,
    backgroundColor: '#FFD700',
    marginVertical: 16,
    opacity: 0.5,
  },
  summary: {
    fontSize: 20,
    color: '#FFFFFF',
    marginBottom: 16,
  },
  statsContainer: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    borderRadius: 10,
  },
  statLabel: {
    flex: 1,
    fontSize: 18,
    color: '#FFFFFF',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2E7D32',
  },
  buttonPressed: {
    backgroundColor: '#388E3C',
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
}); 