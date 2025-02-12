import { View, Image, Dimensions } from 'react-native';
import { useStyles } from '@/hooks/useStyles';

export function SplashScreen() {
  const { width, height } = Dimensions.get('window');
  
  const styles = useStyles(colors => ({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    image: {
      width,
      height,
      resizeMode: 'cover',
    },
  }));

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/splash-screen.jpg')} 
        style={styles.image}
      />
    </View>
  );
} 