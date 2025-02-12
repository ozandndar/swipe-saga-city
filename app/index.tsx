import React from 'react';
import { ChapterSelection } from '@/components/ChapterSelection';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ChapterSelectionScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ChapterSelection />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
});