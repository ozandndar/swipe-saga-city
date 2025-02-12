import { View, Image, Dimensions, ImageBackground } from 'react-native';
import { Text } from '@/components/base/Text';
import { useStyles } from '@/hooks/useStyles';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';
import React from 'react';

export function LoadingScreen() {
  const { width, height } = Dimensions.get('window');
  const progress = useSharedValue(0);
  
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
    },
    backgroundImage: {
      width,
      height,
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent overlay
    },
    logo: {
      width: width,
      height: width,
      resizeMode: 'contain',
      marginBottom: 40,
    },
    loadingContainer: {
      width: width * 0.8,
      height: 25, // Made taller
      backgroundColor: 'rgba(255, 255, 255, 0.3)', // More translucent background
      borderRadius: 15, // More rounded corners
      overflow: 'hidden',
      marginBottom: 16,
      borderWidth: 2, // Add border
      borderColor: '#FFFFFF', // White border
    },
    loadingBar: {
      height: '100%',
      backgroundColor: '#8A2BE2', // Bright purple
      borderRadius: 15, // Match container's border radius
      shadowColor: '#8A2BE2',
      shadowOffset: {
        width: 0,
        height: 0,
      },
      shadowOpacity: 0.6,
      shadowRadius: 8,
      elevation: 5, // For Android shadow
    },
    loadingText: {
      marginTop: 16,
      color: '#FFFFFF',
      fontSize: 18, // Made text slightly bigger
      textShadowColor: 'rgba(0, 0, 0, 0.5)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 3,
    },
  }));

  // Animate the loading bar
  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, []);

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require('../../assets/images/loading_background.webp')}
        style={styles.backgroundImage}
      >
        <View style={styles.content}>
          <Image 
            source={require('../../assets/images/logo_big.png')} 
            style={styles.logo}
          />
          
          <View style={styles.loadingContainer}>
            <Animated.View style={[styles.loadingBar, progressStyle]} />
          </View>

          <Text style={styles.loadingText}>Loading your city...</Text>
        </View>
      </ImageBackground>
    </View>
  );
} 