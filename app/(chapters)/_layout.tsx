import { Stack } from 'expo-router';

export default function ChaptersLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="chapter-1" />
    </Stack>
  );
} 