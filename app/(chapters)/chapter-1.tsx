import { DayCompleteModal } from '@/components/DayCompleteModal';
import { GameOverModal } from '@/components/GameOverModal';
import { SettingsButton } from '@/components/SettingsButton';
import { SettingsModal } from '@/components/SettingsModal';
import { StatsBar } from '@/components/StatsBar';
import { SwipeCard } from '@/components/SwipeCard';
import { PowerGridPuzzle } from '@/components/mini-games/PowerGridPuzzle';
import i18n from '@/i18n';
import { useGameStore } from '@/stores/gameStore';
import type { Dilemma, DilemmaContent } from '@/types/dilemma';
import { getRandomDilemmas } from '@/utils/dilemma';
import React, { useCallback, useEffect, useState } from 'react';
import { Dimensions, ImageBackground, StyleSheet, View, Pressable } from 'react-native';
import Animated, {
    cancelAnimation,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { GAME_RULES } from '@/constants/gameRules';
import { Ionicons } from '@expo/vector-icons';

const AnimatedImageBackground = Animated.createAnimatedComponent(ImageBackground);

const { width, height } = Dimensions.get('window');

// Add new HomeButton component
function HomeButton({ onPress }: { onPress: () => void }) {
    return (
        <Pressable 
            style={({ pressed }) => [
                styles.iconButton,
                styles.homeButton,
                pressed && styles.buttonPressed
            ]} 
            onPress={onPress}
        >
            <Ionicons name="home" size={24} color="#FFFFFF" />
        </Pressable>
    );
}

export default function Chapter1() {
    const {
        day,
        isDayComplete,
        setDayComplete,
        incrementDay,
        addToHistory,
        health,
        budget,
        environment,
        dilemmaHistory,
        setStats,
        startTimer,
        timeLeft,
        isTimerPaused,
        cleanupTimer,
        setGameOver,
        applyPenalty,
        completeChapter,
        getDayDuration
    } = useGameStore();
    const DILEMMAS_PER_DAY = 3;
    const router = useRouter();

    const [dilemmas, setDilemmas] = useState<Dilemma[]>(getRandomDilemmas(DILEMMAS_PER_DAY));
    const [showMiniGame, setShowMiniGame] = useState(() => {
        // 30% chance to show mini-game
        return Math.random() < 0.3;
    });

    // Reset and randomize dilemmas when day changes
    useEffect(() => {
        const randomDilemmas = getRandomDilemmas(DILEMMAS_PER_DAY);
        setDilemmas(randomDilemmas);
    }, [day]);

    // When all dilemmas are done, show completion
    useEffect(() => {
        if (dilemmas.length === 0) {
            setDayComplete(true);
        }
    }, [dilemmas.length, setDayComplete]);

    const scale = useSharedValue(1);
    const overlayOpacity = useSharedValue(0.3);
    const [isSettingsVisible, setIsSettingsVisible] = useState(false);

    React.useEffect(() => {
        if (!isDayComplete) {
            scale.set(1);
            const animation = withRepeat(
                withSequence(
                    withTiming(1.1, { duration: 10000 }),
                    withTiming(1.0, { duration: 10000 }),
                ),
                10,
                true
            );
            scale.set(animation);
        } else {
            cancelAnimation(scale);
            scale.set(withTiming(1, { duration: 300 }));
        }

        return () => {
            cancelAnimation(scale);
        };
    }, [isDayComplete]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.get() }],
    }));

    const overlayStyle = useAnimatedStyle(() => ({
        // backgroundColor: `rgba(0, 0, 0, ${overlayOpacity.get()})`,
    }));

    const handleTimeChange = useCallback((opacity: number) => {
        'worklet';
        overlayOpacity.set(opacity);
    }, []);

    const handleSwipeLeft = (dilemma: Dilemma) => {
        const content = dilemma[i18n.language as keyof typeof dilemma] as DilemmaContent || dilemma.en as DilemmaContent;

        // Apply stats changes
        setStats({
            health: health + dilemma.swipe_left_stats.happiness,
            budget: budget + dilemma.swipe_left_stats.budget,
            environment: environment + dilemma.swipe_left_stats.environment
        });

        addToHistory({
            dilemmaId: dilemma.id,
            day,
            choice: 'left',
            stats: { health, budget, environment },
            extraEffect: content.extra_effect_left,
            effectStats: dilemma.extra_effect_left_stats
        });
        setDilemmas(prev => prev.slice(1));
    };

    const handleSwipeRight = (dilemma: Dilemma) => {
        const content = dilemma[i18n.language as keyof typeof dilemma] as DilemmaContent || dilemma.en as DilemmaContent;

        // Apply stats changes
        setStats({
            health: health + dilemma.swipe_right_stats.happiness,
            budget: budget + dilemma.swipe_right_stats.budget,
            environment: environment + dilemma.swipe_right_stats.environment
        });

        addToHistory({
            dilemmaId: dilemma.id,
            day,
            choice: 'right',
            stats: { health, budget, environment },
            extraEffect: content.extra_effect_right,
            effectStats: dilemma.extra_effect_right_stats
        });
        setDilemmas(prev => prev.slice(1));
    };

    const handleMiniGameComplete = (success: boolean) => {
        setShowMiniGame(false);
        if (!success) {
            applyPenalty('powerGridFailed');
        }
    };

    useEffect(() => {
        // Start timer
        startTimer();

        // Cleanup on unmount
        return () => {
            cleanupTimer();
        };
    }, []);

    // Handle day completion
    useEffect(() => {
        if (isDayComplete && dilemmas.length > 0) {
            // Day ended with undecided dilemmas
            cleanupTimer();
            setStats({ environment: -10 });
            setGameOver(true);
        }
    }, [isDayComplete, dilemmas.length]);

    // Handle time up
    useEffect(() => {
        if (timeLeft <= 0 && !isTimerPaused && dilemmas.length > 0) {
            cleanupTimer();
            applyPenalty('dayIncomplete');
        }
    }, [timeLeft, isTimerPaused, dilemmas.length]);

    useEffect(() => {
        if (day > GAME_RULES.chapters.length) {
            completeChapter(1);
            router.replace('/');
        }
    }, [day]);

    // Update timer duration based on current day
    useEffect(() => {
        const duration = getDayDuration();
        cleanupTimer();
        startTimer(duration);

        return () => {
            cleanupTimer();
        };
    }, [day]);

    // Reset mini-game chance when day changes
    useEffect(() => {
        setShowMiniGame(Math.random() < 0.3);
    }, [day]);

    return (
        <View style={styles.container}>
            {/* Animated Background */}
            <View style={[styles.backgroundContainer, { width, height }]}>
                <AnimatedImageBackground
                    source={require('../../assets/images/chapter1_background.webp')}
                    style={[styles.backgroundImage, animatedStyle]}
                    resizeMode="cover"
                />
            </View>

            {/* Static Overlay with Animation */}
            <Animated.View style={[styles.overlay, overlayStyle]}>
                <StatsBar onTimeChange={handleTimeChange} />
            </Animated.View>

            {/* Game Content */}
            <View style={styles.content}>
                {showMiniGame ? (
                    <PowerGridPuzzle onComplete={handleMiniGameComplete} />
                ) : (
                    dilemmas.map((dilemma, index) => (
                        <SwipeCard
                            key={dilemma.id}
                            dilemma={dilemma}
                            onSwipeLeft={() => handleSwipeLeft(dilemma)}
                            onSwipeRight={() => handleSwipeRight(dilemma)}
                            style={{
                                position: 'absolute',
                                zIndex: dilemmas.length - index,
                                transform: [{ translateY: index * 4 }],
                            }}
                        />
                    ))
                )}
            </View>

            {/* UI Elements */}
            <DayCompleteModal />
            <HomeButton onPress={() => router.replace('/')} />
            <SettingsButton onPress={() => setIsSettingsVisible(true)} />
            <SettingsModal
                visible={isSettingsVisible}
                onClose={() => setIsSettingsVisible(false)}
            />
            <GameOverModal />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    backgroundContainer: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    backgroundImage: {
        width: width * 1.2,
        height: height * 1.2,
        position: 'absolute',
        top: -height * 0.1,
        left: -width * 0.1,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    content: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 2,
    },
    gameArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    cardContent: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255, 215, 0, 0.3)',
    },
    cardTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 16,
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 4,
    },
    cardDescription: {
        fontSize: 18,
        textAlign: 'center',
        color: '#FFFFFF',
        textShadowColor: 'rgba(0, 0, 0, 0.75)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
    iconButton: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
        zIndex: 10,
        left: 20,
    },
    homeButton: {
        bottom: 90,
    },
    buttonPressed: {
        transform: [{ scale: 0.95 }],
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
}); 