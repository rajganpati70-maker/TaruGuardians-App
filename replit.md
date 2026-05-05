# Taru Guardians App

## Overview

A React Native / Expo mobile app for the Taru Guardians tech club. Features a premium dark-themed UI with nature + technology aesthetics, animated splash screen, and 6 navigation tabs.

## Architecture

- **Framework**: Expo (SDK ~52) with React Native
- **Language**: TypeScript
- **Navigation**: React Navigation v7 (bottom tabs)
- **Platform**: Mobile (iOS/Android) + Web via Expo Web

## Project Structure

```
App.tsx                  # Root component with splash screen + navigation
index.js                 # Entry point (registerRootComponent)
src/
  components/
    splash/              # 40+ animated splash screen effects
    TeamComponents/      # Team member card, modal, utils
  constants/
    colors.ts            # App color palette
    animation.ts         # Animation constants
    teamData.ts          # Team member data
    index.ts             # Barrel exports
  navigation/
    AppNavigator.tsx     # Bottom tab navigator (6 tabs)
  screens/
    Home/HomeScreen.tsx
    Events/EventsScreen.tsx
    TaruWings/TaruWingsScreen.tsx
    Team/TeamScreen.tsx
    Alumni/AlumniScreen.tsx
    Suggestion/SuggestionScreen.tsx
  types/
    navigation.ts        # Navigation type definitions
```

## Tabs

1. **Home** — Dashboard with stats, weather, quick actions
2. **Events** — Event listings and details
3. **Taru Wings** — Club wings/divisions
4. **Team** — Team members with cards and modals
5. **Alumni** — Alumni network
6. **Suggestion** — Submit suggestions

## Workflows

- **Start application**: `npx expo start --web --port 5000`
  - Runs Expo dev server on port 5000
  - Web preview accessible in Replit preview pane

## Deployment

- Target: Static site (Expo web export)
- Build: `npx expo export --platform web --output-dir dist`
- Public dir: `dist`

## Dependencies

Key packages:
- `expo` ~52.0.0
- `react-native` ^0.76.9
- `@react-navigation/bottom-tabs` ^7.15.9
- `react-native-web` ~0.19.13
- `expo-linear-gradient`, `expo-font`, `expo-splash-screen`
- `react-native-reanimated` ~3.16.0
- `react-native-gesture-handler` ~2.20.0

## Notes

- The app uses hex opacity appended to rgba colors (e.g. `rgba(...)22`) which produces browser warnings on web but works correctly on native platforms
- `useNativeDriver: true` animations fall back to JS-based on web (expected behavior)
