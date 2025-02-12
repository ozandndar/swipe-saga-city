import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SettingsButtonProps {
  onPress: () => void;
}

export function SettingsButton({ onPress }: SettingsButtonProps) {
  return (
    <Pressable 
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed
      ]} 
      onPress={onPress}
    >
      <Ionicons name="settings" size={24} color="#FFFFFF" />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 10
  },
  buttonPressed: {
    transform: [{ scale: 0.95 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
}); 