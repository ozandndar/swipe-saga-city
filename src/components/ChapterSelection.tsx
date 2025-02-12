import React from 'react';
import { View, StyleSheet, Dimensions, Pressable, ScrollView } from 'react-native';
import { Text } from '@/components/base/Text';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle, G, Defs, RadialGradient, Stop, Line } from 'react-native-svg';
import { useGameStore } from '@/stores/gameStore';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const CHAPTER_DATA = [
  {
    id: 1,
    title: "City's Dawn",
    subtitle: "Begin your journey",
    color: "#4ECDC4",
    icon: "home-outline"
  },
  {
    id: 2,
    title: "Urban Growth",
    subtitle: "Expand your influence",
    color: "#FFD93D",
    icon: "business-outline"
  },
  {
    id: 3,
    title: "Industrial Age",
    subtitle: "Face new challenges",
    color: "#FF6B6B",
    icon: "factory-outline"
  },
  {
    id: 4,
    title: "Future City",
    subtitle: "Shape tomorrow",
    color: "#6C5CE7",
    icon: "planet-outline"
  }
];

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ChapterSelection() {
  const router = useRouter();
  const { isChapterCompleted, chapter: currentChapter, day } = useGameStore();
  const { t } = useTranslation();

  const handleChapterPress = (chapterId: number) => {
    if (chapterId <= currentChapter) {
      router.push(`/(chapters)/chapter-${chapterId}` as any);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#1a1a1a', '#2d3436']}
        style={StyleSheet.absoluteFill}
      />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        <View style={styles.timelineContainer}>
          <Svg style={styles.timeline}>
            <Defs>
              <RadialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
                <Stop offset="0%" stopColor="rgba(255,255,255,0.2)" />
                <Stop offset="100%" stopColor="rgba(255,255,255,0)" />
              </RadialGradient>
            </Defs>
            
            {/* Main Timeline */}
            <Line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="rgba(255,255,255,0.1)"
              strokeWidth={6}
              strokeLinecap="round"
            />
            
            {/* Glowing overlay */}
            <Line
              x1="50%"
              y1="0%"
              x2="50%"
              y2="100%"
              stroke="url(#glowGradient)"
              strokeWidth={3}
              strokeDasharray="8,8"
              strokeLinecap="round"
            />
          </Svg>

          {CHAPTER_DATA.map((chapter, index) => {
            const isUnlocked = chapter.id <= currentChapter;
            const isCurrent = chapter.id === currentChapter;
            const isCompleted = isChapterCompleted(chapter.id);
            const position = getChapterPosition(index);
            
            return (
              <AnimatedPressable
                key={chapter.id}
                entering={FadeIn.delay(index * 200)}
                style={[
                  styles.chapterNode,
                  {
                    top: position.y - 50,
                    left: position.x - 50,
                  }
                ]}
                onPress={() => handleChapterPress(chapter.id)}
              >
                <LinearGradient
                  colors={[
                    isUnlocked ? chapter.color : 'rgba(255,255,255,0.1)',
                    isUnlocked ? `${chapter.color}80` : 'rgba(255,255,255,0.05)'
                  ]}
                  style={[
                    styles.nodeOuter,
                    isCurrent && styles.currentNode
                  ]}
                >
                  <View style={styles.nodeInner}>
                    <Ionicons 
                      name={chapter.icon as any}
                      size={32}
                      color={isUnlocked ? '#fff' : 'rgba(255,255,255,0.3)'}
                    />
                    <Text style={[
                      styles.chapterNumber,
                      !isUnlocked && styles.lockedText
                    ]}>
                      {chapter.id}
                    </Text>
                  </View>
                </LinearGradient>
                <View style={styles.chapterInfo}>
                  <Text style={[
                    styles.chapterTitle,
                    isUnlocked && { color: chapter.color }
                  ]}>
                    {chapter.title}
                  </Text>
                  <Text style={styles.chapterSubtitle}>
                    {chapter.subtitle}
                  </Text>
                  {isCompleted ? (
                    <Text style={[styles.chapterSubtitle, { color: chapter.color }]}>
                      {t('chapters.completed')}
                    </Text>
                  ) : isCurrent && (
                    <Text style={[styles.chapterSubtitle, { color: chapter.color }]}>
                      {t('chapters.progress', { day, total: 30 })}
                    </Text>
                  )}
                </View>
              </AnimatedPressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function getChapterPosition(index: number) {
  const spacing = 200; // Fixed spacing between nodes
  const isLeft = index % 2 === 0;
  
  return {
    x: SCREEN_WIDTH * (isLeft ? 0.3 : 0.7),
    y: 100 + (spacing * index) // Start from top with fixed spacing
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  timelineContainer: {
    minHeight: SCREEN_HEIGHT,
    paddingVertical: 100,
    height: (CHAPTER_DATA.length * 200) + 200, // Calculate total height based on spacing
  },
  timeline: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: '100%',
    top: 0,
    left: 0,
  },
  chapterNode: {
    position: 'absolute',
    alignItems: 'center',
    width: 100,
  },
  nodeOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  nodeInner: {
    alignItems: 'center',
  },
  currentNode: {
    borderWidth: 3,
    borderColor: '#fff',
    transform: [{ scale: 1.1 }],
  },
  chapterNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  lockedText: {
    color: 'rgba(255,255,255,0.3)',
  },
  chapterInfo: {
    marginTop: 10,
    alignItems: 'center',
  },
  chapterTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  chapterSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    marginTop: 4,
  },
}); 