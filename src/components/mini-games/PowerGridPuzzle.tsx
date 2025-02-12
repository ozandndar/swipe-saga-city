import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Dimensions, GestureResponderEvent, SafeAreaView } from 'react-native';
import { Text } from '@/components/base/Text';
import { useGameStore } from '@/stores/gameStore';
import Svg, { Line, Circle, Rect, Pattern, Path, G, Image } from 'react-native-svg';
import { Animated, Easing } from 'react-native';
import { GAME_RULES } from '@/constants/gameRules';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Point {
  x: number;
  y: number;
  type: 'source' | 'destination';
  id: number;
  connected?: boolean;
}

interface PowerGridProps {
  onComplete: (success: boolean) => void;
}

// Replace COLOR_PAIRS with WIRE_ASSETS
const WIRE_ASSETS = [
  { 
    color: '#FF6B6B',
    image: require('../../../assets/images/mini-games/power-grid/red-wire.png'),
  },
  { 
    color: '#4ECDC4',
    image: require('../../../assets/images/mini-games/power-grid/blue-wire.png'),
  },
  { 
    color: '#FFD93D',
    image: require('../../../assets/images/mini-games/power-grid/yellow-wire.png'),
  },
];

// Double the connector sizes
const CONNECTOR_WIDTH = 200;   // Doubled from 120
const CONNECTOR_HEIGHT = 80;   // Doubled from 40

// Update ColorAssignments type
type ColorAssignments = {
  [key: number]: { color: string; image: any };
};

// Add at the top with other definitions
const WIRE_PATTERN_ID = 'wirePattern';
const WIRE_STROKE_WIDTH = 12;

// Add these styles at the top
const THEME = {
  primary: '#FFD93D',
  secondary: '#7bed9f',
  danger: '#FF6B6B',
  text: '#FFFFFF',
  shadow: 'rgba(0, 0, 0, 0.5)',
};

// Add a constant for vertical offset
const VERTICAL_OFFSET = 100; // Increased from top to account for header

export function PowerGridPuzzle({ onComplete }: PowerGridProps) {
  const { timeLimit } = GAME_RULES.miniGames.powerGrid;
  const [lines, setLines] = useState<{start: Point, end: Point, id: string}[]>([]);
  const [colorAssignments] = useState<ColorAssignments>(() => {
    const assignments: ColorAssignments = {};
    WIRE_ASSETS.forEach((pair, index) => {
      assignments[index + 1] = pair;            // source
      assignments[index + 4] = pair;            // matching destination
    });
    return assignments;
  });

  const [points] = useState<Point[]>(() => {
    const sourcePositions = [
      { x: 0, y: SCREEN_HEIGHT * 0.25 + VERTICAL_OFFSET },
      { x: 0, y: SCREEN_HEIGHT * 0.5 + VERTICAL_OFFSET },
      { x: 0, y: SCREEN_HEIGHT * 0.75 + VERTICAL_OFFSET },
    ];

    const destPositions = [
      { x: SCREEN_WIDTH, y: SCREEN_HEIGHT * 0.25 + VERTICAL_OFFSET },
      { x: SCREEN_WIDTH, y: SCREEN_HEIGHT * 0.5 + VERTICAL_OFFSET },
      { x: SCREEN_WIDTH, y: SCREEN_HEIGHT * 0.75 + VERTICAL_OFFSET },
    ];

    // Shuffle positions
    sourcePositions.sort(() => Math.random() - 0.5);
    destPositions.sort(() => Math.random() - 0.5);

    // Create points with randomized positions
    const sourcePoints: Point[] = sourcePositions.map((pos, idx) => ({
      ...pos,
      type: 'source' as const,
      id: idx + 1,
    }));

    const destPoints: Point[] = destPositions.map((pos, idx) => ({
      ...pos,
      type: 'destination' as const,
      id: idx + 4,
    }));

    return [...sourcePoints, ...destPoints];
  });

  const [timeLeft, setTimeLeft] = useState(timeLimit / 1000); // Convert ms to seconds
  const setStats = useGameStore(state => state.setStats);

  const [activeStartPoint, setActiveStartPoint] = useState<Point | null>(null);
  const [lineValues, setLineValues] = useState({
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
    opacity: 0
  });

  const [isDragging, setIsDragging] = useState(false);
  const [currentPoint, setCurrentPoint] = useState<Point | null>(null);

  const [dashOffset, setDashOffset] = useState(0);

  const progressAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(1)).current;

  const { pauseTimer, resumeTimer } = useGameStore();

  useEffect(() => {
    // Pause main game timer when mini-game starts
    pauseTimer();

    // Reset progress value
    progressAnimation.setValue(1);
    
    // Start progress animation
    Animated.timing(progressAnimation, {
      toValue: 0,
      duration: 30000,
      easing: Easing.linear,
      useNativeDriver: false,
    }).start();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          if (lines.length < 3) {
            setStats({ environment: -10 });
            onComplete(false);
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      progressAnimation.stopAnimation();
      // Resume main game timer when mini-game ends
      resumeTimer();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setDashOffset(prev => (prev - 1) % 16);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Add offset calculation helper
  const getLineEndpoint = (point: Point) => {
    if (point.type === 'source') {
      return {
        x: point.x + CONNECTOR_WIDTH/2,  // Right side of source
        y: point.y
      };
    } else {
      return {
        x: point.x - CONNECTOR_WIDTH/2,  // Left side of destination
        y: point.y
      };
    }
  };

  const findNearestPoint = (x: number, y: number, type: 'source' | 'destination') => {
    const threshold = 60;
    return points.find(point => {
      // Check distance from the connection point instead of center
      const connectionX = type === 'source' 
        ? point.x + CONNECTOR_WIDTH/2  // Right edge for source
        : point.x - CONNECTOR_WIDTH/2;  // Left edge for destination
      
      const distance = Math.hypot(connectionX - x, point.y - y);
      return point.type === type && !point.connected && distance < threshold;
    });
  };

  // Add reset function
  const resetLineValues = () => {
    setLineValues({
      x1: 0,
      y1: 0,
      x2: 0,
      y2: 0,
      opacity: 0
    });
  };

  const handleTouchStart = (event: GestureResponderEvent) => {
    const { locationX, locationY } = event.nativeEvent;
    const point = findNearestPoint(locationX, locationY, 'source');
    
    if (point) {
      setIsDragging(true);
      setCurrentPoint(point);
      setActiveStartPoint(point);
      
      // Set both start and current position
      const startX = point.x + CONNECTOR_WIDTH/2;
      const startY = point.y;
      
      setLineValues({
        x1: startX,
        y1: startY,
        x2: locationX,
        y2: locationY,
        opacity: 0.5
      });
    }
  };

  const handleTouchMove = (event: GestureResponderEvent) => {
    if (isDragging) {
      const { locationX, locationY } = event.nativeEvent;
      setLineValues(prev => ({
        ...prev,
        x2: locationX,
        y2: locationY
      }));
    }
  };

  const isValidConnection = (start: Point, end: Point) => {
    // Check if colors match
    return colorAssignments[start.id].color === colorAssignments[end.id].color;
  };

  const handleTouchEnd = (event: GestureResponderEvent) => {
    if (isDragging && currentPoint && activeStartPoint) {
      const { locationX, locationY } = event.nativeEvent;
      const endPoint = findNearestPoint(locationX, locationY, 'destination');

      if (endPoint && isValidConnection(currentPoint, endPoint)) {
        setLines(prev => [...prev, {
          start: currentPoint,
          end: endPoint,
          id: `${currentPoint.id}-${endPoint.id}`
        }]);
        
        endPoint.connected = true;
        currentPoint.connected = true;

        if (lines.length + 1 >= 3) {
          setTimeout(() => {
            handleCompletion();
          }, 1000);
        }
      }
    }
    // Reset everything at the end
    setIsDragging(false);
    setCurrentPoint(null);
    setActiveStartPoint(null);
    resetLineValues();
  };

  const handleCompletion = () => {
    Animated.timing(fadeAnimation, {
      toValue: 0,
      duration: 1000,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onComplete(true);
    });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      // Auto-fail if time runs out
      onComplete(false);
    }, timeLimit);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <View 
        style={StyleSheet.absoluteFill}
        onStartShouldSetResponder={() => true}
        onMoveShouldSetResponder={() => true}
        onResponderGrant={handleTouchStart}
        onResponderMove={handleTouchMove}
        onResponderRelease={handleTouchEnd}
      >
        <Svg width={SCREEN_WIDTH} height={SCREEN_HEIGHT}>
          {/* Background with pattern */}
          <Rect
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="rgba(0, 0, 0, 0.9)"
          />
          
          {/* Grid pattern */}
          <Pattern
            id="grid"
            width={30}
            height={30}
            patternUnits="userSpaceOnUse"
          >
            <Path
              d="M 30 0 L 0 0 0 30"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="1"
              fill="none"
            />
          </Pattern>
          <Rect
            x={0}
            y={0}
            width={SCREEN_WIDTH}
            height={SCREEN_HEIGHT}
            fill="url(#grid)"
          />

          {/* Wire texture pattern */}
          <Pattern
            id={WIRE_PATTERN_ID}
            width="8"
            height="2"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <Line
              x1="0"
              y1="0"
              x2="8"
              y2="0"
              stroke="#e8993a"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </Pattern>

          {/* Completed Lines */}
          {lines.map(line => (
            <G key={line.id}>
              {/* Line shadow */}
              <Line
                x1={getLineEndpoint(line.start).x}
                y1={getLineEndpoint(line.start).y}
                x2={getLineEndpoint(line.end).x}
                y2={getLineEndpoint(line.end).y}
                stroke="rgba(0,0,0,0.3)"
                strokeWidth={WIRE_STROKE_WIDTH + 4}
                strokeLinecap="round"
              />
              
              {/* Success glow effect */}
              <Line
                x1={getLineEndpoint(line.start).x}
                y1={getLineEndpoint(line.start).y}
                x2={getLineEndpoint(line.end).x}
                y2={getLineEndpoint(line.end).y}
                stroke="#52c41a"
                strokeWidth={WIRE_STROKE_WIDTH + 12}
                strokeLinecap="round"
                opacity={0.2}
              />
              
              {/* Base line */}
              <Line
                x1={getLineEndpoint(line.start).x}
                y1={getLineEndpoint(line.start).y}
                x2={getLineEndpoint(line.end).x}
                y2={getLineEndpoint(line.end).y}
                stroke="#52c41a"
                strokeWidth={WIRE_STROKE_WIDTH}
                strokeLinecap="round"
              />
              
              {/* Animated energy flow */}
              <Line
                x1={getLineEndpoint(line.start).x}
                y1={getLineEndpoint(line.start).y}
                x2={getLineEndpoint(line.end).x}
                y2={getLineEndpoint(line.end).y}
                stroke="#7bed9f"
                strokeWidth={WIRE_STROKE_WIDTH - 4}
                strokeLinecap="round"
                strokeDasharray="8,8"
                strokeDashoffset={dashOffset}
                opacity={0.8}
              />

              {/* Energy particles */}
              <Circle
                cx={getLineEndpoint(line.start).x + ((getLineEndpoint(line.end).x - getLineEndpoint(line.start).x) * (Math.abs(dashOffset) % 16) / 16)}
                cy={getLineEndpoint(line.start).y + ((getLineEndpoint(line.end).y - getLineEndpoint(line.start).y) * (Math.abs(dashOffset) % 16) / 16)}
                r={4}
                fill="#fff"
                opacity={0.8}
              />
            </G>
          ))}

          {/* Active Line with Effects */}
          <G>
            {/* Glow effect */}
            <Line
              x1={lineValues.x1}
              y1={lineValues.y1}
              x2={lineValues.x2}
              y2={lineValues.y2}
              opacity={lineValues.opacity * 0.4}
              stroke="#ce7925"
              strokeWidth={WIRE_STROKE_WIDTH + 8}
              strokeLinecap="round"
            />
            
            {/* Base line */}
            <Line
              x1={lineValues.x1}
              y1={lineValues.y1}
              x2={lineValues.x2}
              y2={lineValues.y2}
              opacity={lineValues.opacity}
              stroke="#ce7925"
              strokeWidth={WIRE_STROKE_WIDTH}
              strokeLinecap="round"
            />
            
            {/* Animated dash pattern */}
            <Line
              x1={lineValues.x1}
              y1={lineValues.y1}
              x2={lineValues.x2}
              y2={lineValues.y2}
              opacity={lineValues.opacity * 0.8}
              stroke="#f4a261"
              strokeWidth={WIRE_STROKE_WIDTH - 4}
              strokeLinecap="round"
              strokeDasharray="8,8"
              strokeDashoffset={dashOffset}
            />
          </G>

          {/* Connection Points */}
          {points.map(point => (
            <G key={point.id}>
              {/* Only keep the Image */}
              <Image
                x={point.x - CONNECTOR_WIDTH/2}
                y={point.y - CONNECTOR_HEIGHT/2}
                width={CONNECTOR_WIDTH}
                height={CONNECTOR_HEIGHT}
                href={colorAssignments[point.id].image}
                opacity={1}  // Remove opacity change when connected
                rotation={point.type === 'destination' ? 180 : 0}
                originX={point.x}
                originY={point.y}
              />

              {/* Electricity Effect */}
              {!point.connected && (
                <Circle
                  cx={point.x}
                  cy={point.y}
                  r={5}
                  fill={colorAssignments[point.id].color}
                  opacity={0.8}
                />
              )}
            </G>
          ))}
        </Svg>
      </View>

      <SafeAreaView>
        <Animated.View style={[styles.overlay, { opacity: fadeAnimation }]}>
          <View style={styles.headerContainer}>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Energy Distribution</Text>
              <Text style={styles.subtitle}>Connect the city's power lines!</Text>
              <View style={styles.progressContainer}>
                <Animated.View 
                  style={[
                    styles.progressBar,
                    { 
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%']
                      })
                    },
                    timeLeft < 10 && styles.progressWarning
                  ]} 
                />
              </View>
            </View>
            <View style={styles.timerContainer}>
              <Text style={[styles.timerLabel, timeLeft < 10 && styles.timerWarning]}>
                POWER TIME
              </Text>
              <Text style={[styles.timerValue, timeLeft < 10 && styles.timerWarning]}>
                {timeLeft}s
              </Text>
            </View>
          </View>
        </Animated.View>
      </SafeAreaView>
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
    zIndex: 999,
    paddingTop: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 15,
    padding: 15,
    margin: 20,
    borderWidth: 2,
    borderColor: THEME.primary,
    shadowColor: THEME.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  titleContainer: {
    flex: 1,
    marginRight: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.primary,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: THEME.text,
    opacity: 0.9,
    marginTop: 5,
  },
  timerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.secondary,
  },
  timerLabel: {
    fontSize: 12,
    color: THEME.secondary,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  timerValue: {
    fontSize: 24,
    color: THEME.text,
    fontWeight: 'bold',
    marginTop: 2,
  },
  timerWarning: {
    color: THEME.danger,
  },
  progressContainer: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 4,
    marginTop: 15,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: THEME.secondary,
    borderRadius: 4,
  },
  progressWarning: {
    backgroundColor: THEME.danger,
  },
}); 