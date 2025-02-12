import { Modal, View, StyleSheet, Pressable } from 'react-native';
import { Text } from './base/Text';
import { useTranslation } from 'react-i18next';
import { useGameStore } from '@/stores/gameStore';
import { useRouter } from 'expo-router';

export function GameOverModal() {
  const { isGameOver, health, budget, environment, resetGame } = useGameStore();
  const { t } = useTranslation();
  const router = useRouter();

  console.log('[GameOverModal] Render:', { 
    isGameOver, 
    health, 
    budget, 
    environment 
  });

  if (!isGameOver) return null;

  let failureMessage = '';
  if (health <= 0) {
    failureMessage = t('gameOver.healthFailed');
  } else if (budget <= 0) {
    failureMessage = t('gameOver.budgetFailed');
  } else if (environment <= 0) {
    failureMessage = t('gameOver.environmentFailed');
  }

  const handleRestart = () => {
    resetGame();
    router.replace('/');
  };

  return (
    <Modal
      transparent
      visible={isGameOver}
      animationType="fade"
      onRequestClose={() => {}}
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('gameOver.title')}</Text>
          <Text style={styles.message}>{failureMessage}</Text>
          <Pressable 
            style={styles.button} 
            onPress={handleRestart}
          >
            <Text style={styles.buttonText}>
              {t('gameOver.restart')}
            </Text>
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
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#FF0000',
    alignItems: 'center',
    width: '80%',
  },
  title: {
    fontSize: 28,
    color: '#FF0000',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  message: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  }
}); 