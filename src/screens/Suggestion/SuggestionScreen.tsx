// =====================================================
// ULTRA PREMIUM SUGGESTION SCREEN
// HIGH-QUALITY UI
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, StatusBar, Modal, TextInput, Alert, RefreshControl, Platform, KeyboardAvoidingView, Keyboard, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Suggestion, SuggestionCategory } from '../../types/navigation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const SUGGESTION_CATEGORIES: SuggestionCategory[] = [
  { id: '1', name: 'Event Ideas', icon: '🎉', color: '#FF5722', description: 'Suggest new events and activities' },
  { id: '2', name: 'Improvements', icon: '💡', color: '#2196F3', description: 'Suggest improvements to existing programs' },
  { id: '3', name: 'Partnerships', icon: '🤝', color: '#9C27B0', description: 'Suggest potential partners and collaborations' },
  { id: '4', name: 'Programs', icon: '📚', color: '#4CAF50', description: 'Suggest new learning programs' },
  { id: '5', name: 'Other', icon: '💭', color: '#00BCD4', description: 'Other suggestions' },
];

const SAMPLE_SUGGESTIONS: Suggestion[] = [
  { id: '1', category: 'Event Ideas', title: 'Weekend Nature Camping', description: 'Organize a weekend camping trip to explore nature', priority: 'high', status: 'pending', submittedAt: '2026-04-15', votedCount: 45, isAnonymous: false },
  { id: '2', category: 'Improvements', title: 'Better Event Promotion', description: 'Improve event promotion across social media', priority: 'medium', status: 'reviewed', submittedAt: '2026-04-10', votedCount: 32, isAnonymous: false },
  { id: '3', category: 'Partnerships', title: 'Local NGO Collaboration', description: 'Partner with local environmental NGOs', priority: 'high', status: 'implemented', submittedAt: '2026-04-05', votedCount: 28, isAnonymous: true },
  { id: '4', category: 'Programs', title: 'Online Learning Platform', description: 'Create an online learning portal for members', priority: 'medium', status: 'pending', submittedAt: '2026-04-01', votedCount: 22, isAnonymous: false },
  { id: '5', category: 'Other', title: 'Mobile App Feature', description: 'Add a mobile app for easy access', priority: 'high', status: 'reviewed', submittedAt: '2026-03-25', votedCount: 50, isAnonymous: false },
];

const SuggestionScreen: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [suggestions, setSuggestions] = useState<Suggestion[]>(SAMPLE_SUGGESTIONS);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Suggestion[]>(SAMPLE_SUGGESTIONS);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitCategory, setSubmitCategory] = useState('');
  const [submitTitle, setSubmitTitle] = useState('');
  const [submitDescription, setSubmitDescription] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const animationValues = useRef(Array.from({ length: 15 }, () => ({ opacity: new Animated.Value(0), translateY: new Animated.Value(50) }))).current;

  useEffect(() => { startAnimations(); }, []);
  useEffect(() => { filterSuggestions(); }, [selectedCategory]);

  const startAnimations = () => {
    animationValues.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, duration: 500, delay: index * 50, useNativeDriver: true }),
        Animated.timing(anim.translateY, { toValue: 0, duration: 500, delay: index * 50, useNativeDriver: true }),
      ]).start();
    });
  };

  const filterSuggestions = () => {
    const filtered = selectedCategory === 'all' ? suggestions : suggestions.filter(s => s.category === selectedCategory);
    setFilteredSuggestions(filtered);
  };

  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 2000); }, []);

  const handleCategorySelect = (category: string) => {
    setSubmitCategory(category);
    setShowSubmitModal(true);
  };

  const handleVote = (suggestion: Suggestion) => {
    Alert.alert('Vote Cast', 'Thank you for your feedback!', [{ text: 'OK' }]);
  };

  const submitSuggestion = () => {
    if (!submitTitle.trim() || !submitDescription.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const newSuggestion: Suggestion = {
      id: String(suggestions.length + 1),
      category: submitCategory,
      title: submitTitle,
      description: submitDescription,
      priority: 'medium',
      status: 'pending',
      submittedAt: new Date().toISOString().split('T')[0],
      votedCount: 0,
      isAnonymous,
    };
    setSuggestions([newSuggestion, ...suggestions]);
    setShowSubmitModal(false);
    setSubmitTitle('');
    setSubmitDescription('');
    setIsAnonymous(false);
    Alert.alert('Success', 'Your suggestion has been submitted!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'implemented': return '#4CAF50';
      case 'reviewed': return '#2196F3';
      case 'pending': return '#FF9800';
      case 'rejected': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: animationValues[0].opacity, transform: [{ translateY: animationValues[0].translateY }] }]}>
      <LinearGradient colors={[Colors.background.deepBlack, '#1A237E']} style={styles.headerGradient}>
        <View style={styles.headerInner}>
          <Text style={styles.mainTitle}>💭 Suggestions</Text>
          <Text style={styles.subTitle}>Share Your Ideas With Us</Text>
          <View style={styles.introCard}>
            <Text style={styles.introText}>We value your feedback! Submit suggestions to help us improve and grow.</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderCategoryCards = () => (
    <Animated.View style={[styles.categoryContainer, { opacity: animationValues[1].opacity, transform: [{ translateY: animationValues[1].translateY }] }]}>
      <Text style={styles.sectionTitle}>Choose a Category</Text>
      <View style={styles.categoryGrid}>
        {SUGGESTION_CATEGORIES.map((cat, index) => (
          <Animated.View key={cat.id} style={{ opacity: animationValues[index + 2]?.opacity || animationValues[0].opacity }}>
            <TouchableOpacity style={[styles.categoryCard, { backgroundColor: cat.color + '20' }]} onPress={() => handleCategorySelect(cat.name)}>
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={[styles.categoryName, { color: cat.color }]}>{cat.name}</Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>{cat.description}</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>
    </Animated.View>
  );

  const renderSuggestionsList = () => (
    <Animated.View style={[styles.suggestionsContainer, { opacity: animationValues[7]?.opacity, transform: [{ translateY: animationValues[7]?.translateY }] }]}>
      <Text style={styles.sectionTitle}>Recent Suggestions</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity style={[styles.filterChip, selectedCategory === 'all' && styles.activeFilterChip]} onPress={() => setSelectedCategory('all')}>
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.activeFilterText]}>All</Text>
        </TouchableOpacity>
        {SUGGESTION_CATEGORIES.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.filterChip, selectedCategory === cat.name && { backgroundColor: cat.color }]} onPress={() => setSelectedCategory(cat.name)}>
            <Text style={[styles.filterText, selectedCategory === cat.name && styles.activeFilterText]}>{cat.icon} {cat.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {filteredSuggestions.length > 0 ? filteredSuggestions.map((suggestion, index) => (
        <Animated.View key={suggestion.id} style={[styles.suggestionCardContainer, { opacity: animationValues[index + 8]?.opacity || animationValues[0].opacity }]}>
          <TouchableOpacity style={styles.suggestionCard}>
            <View style={styles.suggestionHeader}>
              <View style={[styles.priorityDot, { backgroundColor: suggestion.priority === 'high' ? '#F44336' : suggestion.priority === 'medium' ? '#FF9800' : '#4CAF50' }]} />
              <Text style={styles.suggestionCategory}>{suggestion.category}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(suggestion.status) }]}>
                <Text style={styles.statusText}>{suggestion.status}</Text>
              </View>
            </View>
            <Text style={styles.suggestionTitle}>{suggestion.title}</Text>
            <Text style={styles.suggestionDescription} numberOfLines={2}>{suggestion.description}</Text>
            <View style={styles.suggestionFooter}>
              <Text style={styles.suggestionDate}>{suggestion.submittedAt}</Text>
              <TouchableOpacity style={styles.voteButton} onPress={() => handleVote(suggestion)}>
                <Text style={styles.voteIcon}>👍</Text>
                <Text style={styles.voteCount}>{suggestion.votedCount}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )) : (
        <View style={styles.emptyState}><Text style={styles.emptyIcon}>💭</Text><Text style={styles.emptyTitle}>No Suggestions Yet</Text></View>
      )}
    </Animated.View>
  );

  const renderSubmitModal = () => (
    <Modal visible={showSubmitModal} animationType="slide" transparent onRequestClose={() => setShowSubmitModal(false)}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Submit Suggestion</Text>
                <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowSubmitModal(false)}><Text style={styles.modalCloseText}>✕</Text></TouchableOpacity>
              </View>
              <ScrollView style={styles.modalBody}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categorySelector}>
                  {SUGGESTION_CATEGORIES.map((cat) => (
                    <TouchableOpacity key={cat.id} style={[styles.categoryOption, submitCategory === cat.name && { backgroundColor: cat.color }]} onPress={() => setSubmitCategory(cat.name)}>
                      <Text style={[styles.categoryOptionText, submitCategory === cat.name && { color: Colors.text.primary }]}>{cat.icon} {cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput style={styles.input} placeholder="Enter your suggestion title..." placeholderTextColor={Colors.text.muted} value={submitTitle} onChangeText={setSubmitTitle} />
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput style={[styles.input, styles.textArea]} placeholder="Describe your suggestion in detail..." placeholderTextColor={Colors.text.muted} value={submitDescription} onChangeText={setSubmitDescription} multiline numberOfLines={5} />
                <TouchableOpacity style={styles.anonymousToggle} onPress={() => setIsAnonymous(!isAnonymous)}>
                  <View style={[styles.checkbox, isAnonymous && styles.checkboxChecked]}><Text style={styles.checkmark}>✓</Text></View>
                  <Text style={styles.anonymousText}>Submit anonymously</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.submitButton} onPress={submitSuggestion}>
                  <Text style={styles.submitButtonText}>Submit Suggestion</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.deepBlack} />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.tech.neonBlue} />}>
        {renderHeader()}
        {renderCategoryCards()}
        {renderSuggestionsList()}
      </ScrollView>
      {renderSubmitModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100 },
  headerContainer: { marginBottom: 20 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 30, paddingHorizontal: 20 },
  headerInner: { alignItems: 'flex-start' },
  mainTitle: { fontSize: isSmallScreen ? 26 : 30, fontWeight: '700', color: Colors.text.primary },
  subTitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, marginBottom: 20 },
  introCard: { backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: 15 },
  introText: { fontSize: 14, color: Colors.text.secondary, textAlign: 'center' },
  categoryContainer: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary, marginBottom: 15 },
  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: (SCREEN_WIDTH - 55) / 2, borderRadius: 15, padding: 20, marginBottom: 15, alignItems: 'center' },
  categoryIcon: { fontSize: 32, marginBottom: 10 },
  categoryName: { fontSize: 14, fontWeight: '600', marginBottom: 5 },
  categoryDescription: { fontSize: 11, color: Colors.text.tertiary, textAlign: 'center' },
  suggestionsContainer: { paddingHorizontal: 20 },
  filterScroll: { marginBottom: 15 },
  filterChip: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20, backgroundColor: Colors.background.darkGreen, marginRight: 10 },
  activeFilterChip: { backgroundColor: Colors.tech.neonBlue },
  filterText: { fontSize: 13, color: Colors.text.secondary, fontWeight: '500' },
  activeFilterText: { color: Colors.text.primary },
  suggestionCardContainer: { marginBottom: 12 },
  suggestionCard: { backgroundColor: Colors.background.darkGreen, borderRadius: 15, padding: 15 },
  suggestionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  priorityDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  suggestionCategory: { flex: 1, fontSize: 12, color: Colors.text.tertiary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  statusText: { fontSize: 10, fontWeight: '600', color: Colors.text.primary, textTransform: 'capitalize' },
  suggestionTitle: { fontSize: 16, fontWeight: '600', color: Colors.text.primary, marginBottom: 5 },
  suggestionDescription: { fontSize: 13, color: Colors.text.secondary, lineHeight: 20, marginBottom: 10 },
  suggestionFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  suggestionDate: { fontSize: 12, color: Colors.text.tertiary },
  voteButton: { flexDirection: 'row', alignItems: 'center' },
  voteIcon: { fontSize: 16, marginRight: 4 },
  voteCount: { fontSize: 13, color: Colors.tech.neonBlue, fontWeight: '600' },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background.darkGreen, borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: SCREEN_HEIGHT * 0.85 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.text.muted },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  modalCloseButton: { width: 35, height: 35, borderRadius: 18, backgroundColor: Colors.background.deepBlack, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 18, color: Colors.text.secondary },
  modalBody: { padding: 20 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: Colors.text.primary, marginBottom: 10, marginTop: 15 },
  categorySelector: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 },
  categoryOption: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, backgroundColor: Colors.background.deepBlack, marginRight: 8, marginBottom: 8 },
  categoryOptionText: { fontSize: 12, color: Colors.text.secondary },
  input: { backgroundColor: Colors.background.deepBlack, borderRadius: 12, padding: 15, fontSize: 15, color: Colors.text.primary, marginBottom: 10 },
  textArea: { height: 120, textAlignVertical: 'top' },
  anonymousToggle: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  checkbox: { width: 25, height: 25, borderRadius: 13, borderWidth: 2, borderColor: Colors.text.muted, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  checkboxChecked: { backgroundColor: Colors.tech.neonBlue, borderColor: Colors.tech.neonBlue },
  checkmark: { fontSize: 14, color: Colors.text.primary, fontWeight: '700' },
  anonymousText: { fontSize: 14, color: Colors.text.secondary },
  submitButton: { backgroundColor: Colors.tech.neonBlue, paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginBottom: 30 },
  submitButtonText: { fontSize: 16, fontWeight: '700', color: Colors.text.primary },
});

export default SuggestionScreen;