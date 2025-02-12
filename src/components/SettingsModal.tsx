import { View, StyleSheet, Modal, Pressable, Dimensions, ScrollView } from 'react-native';
import { Text } from '@/components/base/Text';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '@/stores/languageStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LANGUAGES } from '@/constants/languages';

const { width } = Dimensions.get('window');

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function SettingsModal({ visible, onClose }: SettingsModalProps) {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguageStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const selectedLanguage = LANGUAGES.find(lang => lang.code === language);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('settings.title')}</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('settings.language')}</Text>
            
            <Pressable 
              style={styles.dropdown}
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={styles.dropdownText}>
                {selectedLanguage?.label}
              </Text>
              <Ionicons 
                name={isDropdownOpen ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="#FFFFFF" 
              />
            </Pressable>

            {isDropdownOpen && (
              <View style={styles.dropdownContainer}>
                <ScrollView style={styles.dropdownList}>
                  {LANGUAGES.map((lang) => (
                    <Pressable
                      key={lang.code}
                      style={[
                        styles.dropdownItem,
                        language === lang.code && styles.dropdownItemActive
                      ]}
                      onPress={() => {
                        setLanguage(lang.code);
                        setIsDropdownOpen(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{lang.label}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <Pressable 
            style={({ pressed }) => [
              styles.closeButton,
              pressed && styles.buttonPressed
            ]} 
            onPress={onClose}
          >
            <Text style={styles.closeButtonText}>{t('common.close')}</Text>
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
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    marginBottom: 12,
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  dropdownText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  dropdownContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    maxHeight: 200,
    zIndex: 99999,
  },
  dropdownList: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginTop: 4,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  dropdownItemActive: {
    backgroundColor: '#FFD700',
  },
  dropdownItemText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    zIndex: -1,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 