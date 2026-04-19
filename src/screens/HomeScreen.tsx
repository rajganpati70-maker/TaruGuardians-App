// =====================================================
// ULTRA PREMIUM HOME SCREEN
// Main App Home Screen
// =====================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import { Colors } from '../constants';

const HomeScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='light-content' backgroundColor={Colors.background.deepBlack} />
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logoIcon}>
            <View style={styles.treeTrunk}>
              <View style={styles.treeTrunkInner} />
            </View>
            <View style={styles.treeCanopy}>
              <View style={[styles.canopyLayer, styles.canopyTop]} />
              <View style={[styles.canopyLayer, styles.canopyMiddle]} />
              <View style={[styles.canopyLayer, styles.canopyBottom]} />
            </View>
            <View style={styles.shield}>
              <View style={styles.shieldInner} />
            </View>
          </View>
        </View>
        
        <Text style={styles.appName}>TARU</Text>
        <Text style={styles.appTitle}>GUARDIANS</Text>
        <Text style={styles.tagline}>Preserving Nature, Protecting Tomorrow</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.welcomeText}>Welcome to the Future</Text>
        <Text style={styles.descriptionText}>
          Your journey to protect and preserve our green heritage begins here.
        </Text>
        
        <View style={styles.featuresContainer}>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.nature.leafGreen }]} />
            <Text style={styles.featureText}>Tree Preservation</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.tech.neonBlue }]} />
            <Text style={styles.featureText}>AI Monitoring</Text>
          </View>
          <View style={styles.featureItem}>
            <View style={[styles.featureIcon, { backgroundColor: Colors.accent.softGold }]} />
            <Text style={styles.featureText}>Community</Text>
          </View>
        </View>
      </View>
      
      <Text style={styles.versionText}>Version 1.0.0</Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.deepBlack,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logoContainer: {
    marginBottom: 30,
  },
  logoIcon: {
    width: 100,
    height: 120,
    position: 'relative',
  },
  treeTrunk: {
    position: 'absolute',
    bottom: 0,
    left: 40,
    width: 20,
    height: 50,
    backgroundColor: Colors.nature.bark,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  treeTrunkInner: {
    width: 8,
    height: 40,
    backgroundColor: Colors.nature.wood,
    borderRadius: 2,
  },
  treeCanopy: {
    position: 'absolute',
    top: 0,
    left: 10,
    width: 80,
    height: 80,
  },
  canopyLayer: {
    position: 'absolute',
    borderRadius: 50,
  },
  canopyTop: {
    width: 70,
    height: 45,
    top: 0,
    left: 5,
    backgroundColor: Colors.nature.leafGreen,
  },
  canopyMiddle: {
    width: 80,
    height: 40,
    top: 20,
    left: 0,
    backgroundColor: Colors.nature.leafLight,
  },
  canopyBottom: {
    width: 60,
    height: 30,
    top: 45,
    left: 10,
    backgroundColor: Colors.nature.vine,
  },
  shield: {
    position: 'absolute',
    bottom: 25,
    right: -5,
    width: 35,
    height: 45,
    backgroundColor: Colors.tech.neonBlue,
    borderRadius: 5,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.glow.blueGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 8,
  },
  shieldInner: {
    width: 18,
    height: 22,
    backgroundColor: Colors.text.primary,
    borderRadius: 3,
    borderTopLeftRadius: 9,
    borderTopRightRadius: 9,
  },
  appName: {
    fontSize: 42,
    fontWeight: '700',
    color: Colors.text.primary,
    letterSpacing: 10,
    textShadowColor: Colors.glow.greenGlow,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 15,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: Colors.accent.softGold,
    letterSpacing: 8,
    marginTop: 5,
    textShadowColor: Colors.accent.gold,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
  tagline: {
    fontSize: 14,
    fontWeight: '300',
    color: Colors.text.tertiary,
    letterSpacing: 2,
    marginTop: 15,
  },
  divider: {
    width: 100,
    height: 1,
    backgroundColor: Colors.text.muted,
    marginTop: 30,
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text.primary,
    marginBottom: 15,
  },
  descriptionText: {
    fontSize: 14,
    color: Colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  featureItem: {
    alignItems: 'center',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    shadowColor: Colors.text.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  featureText: {
    fontSize: 12,
    color: Colors.text.tertiary,
    textAlign: 'center',
  },
  versionText: {
    fontSize: 12,
    color: Colors.text.muted,
    textAlign: 'center',
    paddingBottom: 20,
  },
});

export default HomeScreen;