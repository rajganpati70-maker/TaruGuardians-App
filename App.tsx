import React, { useState, useRef } from 'react';
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

const linking = {
  prefixes: [],
  config: {
    screens: {
      HomeTab: '/',
      EventsTab: '/events',
      TaruWingsTab: '/wings',
      TeamTab: '/team',
      AlumniTab: '/alumni',
      SuggestionTab: '/suggestion',
    },
  },
};

const App: React.FC = () => {
  const [splashDone, setSplashDone] = useState(false);
  const appOpacity = useRef(new Animated.Value(0)).current;

  const handleSplashComplete = () => {
    setSplashDone(true);
    Animated.timing(appOpacity, {
      toValue: 1,
      duration: 700,
      useNativeDriver: true,
    }).start();
  };

  if (!splashDone) {
    return (
      <View style={styles.root}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#000000"
          translucent={Platform.OS === 'android'}
        />
        <SplashScreen onComplete={handleSplashComplete} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <NavigationContainer theme={CustomTheme} linking={linking}>
        <StatusBar
          barStyle="light-content"
          backgroundColor={Colors.background.deepBlack}
          translucent={Platform.OS === 'android'}
        />
        <Animated.View style={[styles.root, { opacity: appOpacity }]}>
          <AppNavigator />
        </Animated.View>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

export default App;
