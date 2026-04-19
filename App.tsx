// =====================================================
// ULTRA PREMIUM MAIN APP ENTRY POINT
// WITH BOTTOM TAB NAVIGATION - 6 TABS
// =====================================================

import React, { useState, useEffect } from 'react';
import { View, StyleSheet, StatusBar, Animated, Platform } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from './src/constants';
import { SplashScreen } from './src/components/splash';
import { AppNavigator } from './src/navigation/AppNavigator';

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.tech.neonBlue,
    background: Colors.background.deepBlack,
    card: Colors.background.darkGreen,
    text: Colors.text.primary,
    border: Colors.text.muted,
    notification: Colors.tech.neonBlue,
  },
};

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSplashComplete, setIsSplashComplete] = useState(false);
  const appOpacity = useState(new Animated.Value(0))[0];

  const handleSplashComplete = () => {
    setIsLoading(false);
    setIsSplashComplete(true);
    Animated.timing(appOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    // Auto-trigger splash if not already complete
    if (!isSplashComplete) {
      const timer = setTimeout(() => {
        handleSplashComplete();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading && !isSplashComplete) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.background.deepBlack} />
        <SplashScreen onComplete={handleSplashComplete} duration={3000} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <NavigationContainer theme={CustomTheme}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.background.deepBlack}
          translucent={Platform.OS === 'android'}
        />
        <Animated.View style={[styles.container, { opacity: appOpacity }]}>
          <AppNavigator />
        </Animated.View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
});

export default App;