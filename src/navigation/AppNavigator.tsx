// =====================================================
// ULTRA PREMIUM BOTTOM TAB NAVIGATION
// 6 TABS: Home, Events, Taru Wings, Team, Alumni, Suggestion
// =====================================================

import React from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Colors } from '../constants/colors';

import HomeScreen from '../screens/Home/HomeScreen';
import EventsScreen from '../screens/Events/EventsScreen';
import TaruWingsScreen from '../screens/TaruWings/TaruWingsScreen';
import TeamScreen from '../screens/Team/TeamScreen';
import AlumniScreen from '../screens/Alumni/AlumniScreen';
import SuggestionScreen from '../screens/Suggestion/SuggestionScreen';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const Tab = createBottomTabNavigator();

// =====================================================
// CUSTOM TAB BAR COMPONENT
// =====================================================

const CustomTabBar: React.FC<any> = ({ state, descriptors, navigation, insets }) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  
  const tabIcons: { [key: string]: string } = {
    HomeTab: '🏠',
    EventsTab: '📅',
    TaruWingsTab: '🌿',
    TeamTab: '👥',
    AlumniTab: '🎓',
    SuggestionTab: '💭',
  };

  const tabLabels: { [key: string]: string } = {
    HomeTab: 'Home',
    EventsTab: 'Events',
    TaruWingsTab: 'Taru Wings',
    TeamTab: 'Team',
    AlumniTab: 'Alumni',
    SuggestionTab: 'Suggestion',
  };

  return (
    <View style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              <Animated.View
                style={[
                  styles.tabItem,
                  isFocused && styles.tabItemFocused,
                ]}
              >
                <Text style={styles.tabIcon}>
                  {tabIcons[route.name] || '•'}
                </Text>
                <Animated.Text
                  style={[
                    styles.tabLabel,
                    isFocused && styles.tabLabelFocused,
                  ]}
                >
                  {tabLabels[route.name] || route.name}
                </Animated.Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

// =====================================================
// MAIN NAVIGATION COMPONENT
// =====================================================

const AppNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none',
        },
      }}
    >
      <Tab.Screen 
        name="HomeTab" 
        component={HomeScreen}
        options={{ tabBarAccessibilityLabel: 'Home' }}
      />
      <Tab.Screen 
        name="EventsTab" 
        component={EventsScreen}
        options={{ tabBarAccessibilityLabel: 'Events' }}
      />
      <Tab.Screen 
        name="TaruWingsTab" 
        component={TaruWingsScreen}
        options={{ tabBarAccessibilityLabel: 'Taru Wings' }}
      />
      <Tab.Screen 
        name="TeamTab" 
        component={TeamScreen}
        options={{ tabBarAccessibilityLabel: 'Team' }}
      />
      <Tab.Screen 
        name="AlumniTab" 
        component={AlumniScreen}
        options={{ tabBarAccessibilityLabel: 'Alumni' }}
      />
      <Tab.Screen 
        name="SuggestionTab" 
        component={SuggestionScreen}
        options={{ tabBarAccessibilityLabel: 'Suggestion' }}
      />
    </Tab.Navigator>
  );
};

// =====================================================
// STYLES
// =====================================================

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background.darkGreen,
    borderTopWidth: 0,
    paddingBottom: 5,
    paddingTop: 5,
    height: 70,
    elevation: 0,
    shadowColor: 'transparent',
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    height: '100%',
    backgroundColor: Colors.background.darkGreen,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  tabItemFocused: {
    backgroundColor: Colors.tech.neonBlue + '30',
  },
  tabIcon: {
    fontSize: isSmallScreen ? 20 : 22,
    marginBottom: 2,
  },
  tabLabel: {
    fontSize: isSmallScreen ? 9 : 10,
    color: Colors.text.tertiary,
    fontWeight: '500',
  },
  tabLabelFocused: {
    color: Colors.tech.neonBlue,
    fontWeight: '600',
  },
});

export default AppNavigator;