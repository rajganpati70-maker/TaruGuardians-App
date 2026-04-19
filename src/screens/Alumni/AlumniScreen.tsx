// =====================================================
// ULTRA PREMIUM ALUMNI SCREEN
// HIGH-QUALITY UI
// =====================================================

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Dimensions, StatusBar, Modal, Linking, RefreshControl, Platform, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../../constants/colors';
import { Alumni, AlumniStats } from '../../types/navigation';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 375;

const ALUMNI_STATS: AlumniStats = { totalAlumni: 500, avgExperience: 5, placementRate: 95, companiesHired: 50 };

const BATCH_YEARS = ['2025', '2024', '2023', '2022', '2021', '2020'];

const ALUMNI_DATA: Alumni[] = [
  { id: '1', name: 'Rohit Sharma', batch: '2020', role: 'Senior Software Engineer', company: 'Google', location: 'Bangalore', imageUrl: '', email: 'rohit@google.com', linkedin: 'https://linkedin.com/in/rohit', currentRole: 'Engineering Manager', pastRoles: ['Software Engineer', 'Senior Engineer'], achievements: ['Google Excellence Award'], messageToStudents: 'Dream big and work hard!' },
  { id: '2', name: 'Priya Singh', batch: '2021', role: 'Product Manager', company: 'Amazon', location: 'Hyderabad', imageUrl: '', email: 'priya@amazon.com', linkedin: 'https://linkedin.com/in/priya', currentRole: 'Senior Product Manager', pastRoles: ['Associate PM', 'Product Manager'], achievements: ['Amazon Star Award'], messageToStudents: 'Focus on impact, not just features.' },
  { id: '3', name: 'Ankit Patel', batch: '2022', role: 'Data Scientist', company: 'Microsoft', location: 'Bangalore', imageUrl: '', email: 'ankit@microsoft.com', linkedin: 'https://linkedin.com/in/ankit', currentRole: 'ML Engineer', pastRoles: ['Data Analyst', 'Junior DS'], achievements: ['Microsoft AI Award'], messageToStudents: 'Data is the new oil!' },
  { id: '4', name: 'Sneha Gupta', batch: '2023', role: 'UX Designer', company: 'Apple', location: 'Bangalore', imageUrl: '', email: 'sneha@apple.com', linkedin: 'https://linkedin.com/in/sneha', currentRole: 'Senior Designer', pastRoles: ['Junior Designer'], achievements: ['Apple Design Award'], messageToStudents: 'Design with empathy.' },
  { id: '5', name: 'Vikram Kumar', batch: '2024', role: 'Startup Founder', company: 'EcoTech Solutions', location: 'Bangalore', imageUrl: '', email: 'vikram@ecotech.com', linkedin: 'https://linkedin.com/in/vikram', currentRole: 'CEO', pastRoles: ['CTO'], achievements: ['Forbes 30 Under 30'], messageToStudents: 'Solve real problems.' },
  { id: '6', name: 'Meera Shah', batch: '2025', role: 'Consultant', company: 'McKinsey', location: 'Mumbai', imageUrl: '', email: 'meera@mckinsey.com', linkedin: 'https://linkedin.com/in/meera', currentRole: 'Business Analyst', pastRoles: [], achievements: ['Top Performer'], messageToStudents: 'Always be curious.' },
  { id: '7', name: 'Aditya Reddy', batch: '2020', role: 'Investment Banker', company: 'Goldman Sachs', location: 'Bangalore', imageUrl: '', email: 'aditya@gs.com', linkedin: 'https://linkedin.com/in/aditya', currentRole: 'Vice President', pastRoles: ['Analyst', 'Associate'], achievements: ['Best Analyst Award'], messageToStudents: 'Network is net worth.' },
  { id: '8', name: 'Kavya Nair', batch: '2021', role: 'Research Scientist', company: 'ISRO', location: 'Bangalore', imageUrl: '', email: 'kavya@isro.gov.in', linkedin: 'https://linkedin.com/in/kavya', currentRole: 'Scientist', pastRoles: ['Junior Researcher'], achievements: ['ISRO Young Scientist'], messageToStudents: 'Reach for the stars.' },
];

const AlumniScreen: React.FC = () => {
  const [selectedBatch, setSelectedBatch] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [alumni, setAlumni] = useState<Alumni[]>(ALUMNI_DATA);
  const [filteredAlumni, setFilteredAlumni] = useState<Alumni[]>(ALUMNI_DATA);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [showAlumniModal, setShowAlumniModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const animationValues = useRef(Array.from({ length: 15 }, () => ({ opacity: new Animated.Value(0), translateY: new Animated.Value(50) }))).current;

  useEffect(() => { startAnimations(); }, []);
  useEffect(() => { filterAlumni(); }, [selectedBatch, searchQuery]);

  const startAnimations = () => {
    animationValues.forEach((anim, index) => {
      Animated.parallel([
        Animated.timing(anim.opacity, { toValue: 1, duration: 500, delay: index * 50, useNativeDriver: true }),
        Animated.timing(anim.translateY, { toValue: 0, duration: 500, delay: index * 50, useNativeDriver: true }),
      ]).start();
    });
  };

  const filterAlumni = () => {
    let filtered = alumni;
    if (selectedBatch !== 'all') filtered = filtered.filter(a => a.batch === selectedBatch);
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a => a.name.toLowerCase().includes(query) || a.company.toLowerCase().includes(query));
    }
    setFilteredAlumni(filtered);
  };

  const onRefresh = useCallback(() => { setRefreshing(true); setTimeout(() => setRefreshing(false), 2000); }, []);

  const handleAlumniPress = (alumnus: Alumni) => { setSelectedAlumni(alumnus); setShowAlumniModal(true); };
  const handleLinkedIn = (alumnus: Alumni) => { if (alumnus.linkedin) Linking.openURL(alumnus.linkedin); };
  const handleEmail = (alumnus: Alumni) => { Linking.openURL(`mailto:${alumnus.email}`); };

  const renderHeader = () => (
    <Animated.View style={[styles.headerContainer, { opacity: animationValues[0].opacity, transform: [{ translateY: animationValues[0].translateY }] }]}>
      <LinearGradient colors={[Colors.background.deepBlack, Colors.accent.softGold]} style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}>🎓 Alumni Network</Text>
          <Text style={styles.subTitle}>Our Successful Graduates</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}><Text style={styles.statValue}>{ALUMNI_STATS.totalAlumni}+</Text><Text style={styles.statLabel}>Alumni</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{ALUMNI_STATS.placementRate}%</Text><Text style={styles.statLabel}>Placed</Text></View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}><Text style={styles.statValue}>{ALUMNI_STATS.companiesHired}+</Text><Text style={styles.statLabel}>Companies</Text></View>
          </View>
          <View style={styles.searchBarContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput style={styles.searchInput} placeholder="Search alumni..." placeholderTextColor={Colors.text.muted} value={searchQuery} onChangeText={setSearchQuery} />
            {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={styles.clearIcon}>✕</Text></TouchableOpacity>}
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  const renderBatchTabs = () => (
    <Animated.View style={[styles.batchContainer, { opacity: animationValues[1].opacity, transform: [{ translateY: animationValues[1].translateY }] }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.batchScroll}>
        <TouchableOpacity style={[styles.batchChip, selectedBatch === 'all' && styles.activeBatchChip]} onPress={() => setSelectedBatch('all')}>
          <Text style={[styles.batchName, selectedBatch === 'all' && styles.activeBatchName]}>All Batches</Text>
        </TouchableOpacity>
        {BATCH_YEARS.map((batch) => (
          <TouchableOpacity key={batch} style={[styles.batchChip, selectedBatch === batch && styles.activeBatchChip]} onPress={() => setSelectedBatch(batch)}>
            <Text style={[styles.batchName, selectedBatch === batch && styles.activeBatchName]}>{batch}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </Animated.View>
  );

  const renderAlumniList = () => (
    <View style={styles.alumniListContainer}>
      {filteredAlumni.length > 0 ? filteredAlumni.map((alumnus, index) => (
        <Animated.View key={alumnus.id} style={[styles.alumniCardContainer, { opacity: animationValues[index + 2]?.opacity || animationValues[0].opacity }]}>
          <TouchableOpacity style={styles.alumniCard} onPress={() => handleAlumniPress(alumnus)}>
            <View style={styles.alumniImageContainer}><View style={styles.alumniImagePlaceholder}><Text style={styles.alumniInitial}>{alumnus.name.charAt(0)}</Text></View></View>
            <View style={styles.alumniInfo}>
              <Text style={styles.alumniName}>{alumnus.name}</Text>
              <Text style={styles.alumniRole}>{alumnus.currentRole} at {alumnus.company}</Text>
              <Text style={styles.alumniBatch}>Class of {alumnus.batch} • {alumnus.location}</Text>
            </View>
            <Text style={styles.alumniArrow}>›</Text>
          </TouchableOpacity>
        </Animated.View>
      )) : (
        <View style={styles.emptyState}><Text style={styles.emptyIcon}>🎓</Text><Text style={styles.emptyTitle}>No Alumni Found</Text></View>
      )}
    </View>
  );

  const renderAlumniModal = () => (
    <Modal visible={showAlumniModal} animationType="slide" transparent onRequestClose={() => setShowAlumniModal(false)}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Alumni Profile</Text>
            <TouchableOpacity style={styles.modalCloseButton} onPress={() => setShowAlumniModal(false)}><Text style={styles.modalCloseText}>✕</Text></TouchableOpacity>
          </View>
          {selectedAlumni && (
            <ScrollView style={styles.modalBody}>
              <View style={styles.modalProfileHeader}>
                <View style={styles.modalProfileImage}><Text style={styles.modalProfileInitial}>{selectedAlumni.name.charAt(0)}</Text></View>
                <Text style={styles.modalAlumniName}>{selectedAlumni.name}</Text>
                <Text style={styles.modalAlumniRole}>{selectedAlumni.currentRole}</Text>
                <Text style={styles.modalAlumniCompany}>🏢 {selectedAlumni.company}</Text>
                <Text style={styles.modalAlumniLocation}>📍 {selectedAlumni.location}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Batch</Text>
                <Text style={styles.modalText}>Class of {selectedAlumni.batch}</Text>
              </View>
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Message to Students</Text>
                <Text style={styles.modalMessage}>"{selectedAlumni.messageToStudents}"</Text>
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.modalActionButton} onPress={() => handleLinkedIn(selectedAlumni)}><Text style={styles.modalActionIcon}>💼</Text><Text style={styles.modalActionText}>LinkedIn</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalActionButton} onPress={() => handleEmail(selectedAlumni)}><Text style={styles.modalActionIcon}>📧</Text><Text style={styles.modalActionText}>Email</Text></TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background.deepBlack} />
      {renderHeader()}
      {renderBatchTabs()}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.accent.softGold} />}>
        {renderAlumniList()}
      </ScrollView>
      {renderAlumniModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background.deepBlack },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 100, paddingHorizontal: 20 },
  headerContainer: { marginBottom: 15 },
  headerGradient: { paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 20, paddingHorizontal: 20 },
  mainTitle: { fontSize: isSmallScreen ? 26 : 30, fontWeight: '700', color: Colors.text.primary },
  subTitle: { fontSize: 14, color: Colors.text.secondary, marginTop: 4, marginBottom: 20 },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-around', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 12, paddingVertical: 15, marginBottom: 20 },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: isSmallScreen ? 22 : 26, fontWeight: '700', color: Colors.accent.softGold },
  statLabel: { fontSize: 12, color: Colors.text.tertiary, marginTop: 4 },
  statDivider: { width: 1, backgroundColor: Colors.text.muted, opacity: 0.3 },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.darkGreen, borderRadius: 12, paddingHorizontal: 15, paddingVertical: 10 },
  searchIcon: { fontSize: 18, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 15, color: Colors.text.primary },
  clearIcon: { fontSize: 16, color: Colors.text.secondary, padding: 5 },
  batchContainer: { marginBottom: 20 },
  batchScroll: { paddingHorizontal: 20 },
  batchChip: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 20, backgroundColor: Colors.background.darkGreen, marginRight: 10 },
  activeBatchChip: { backgroundColor: Colors.accent.softGold },
  batchName: { fontSize: 13, fontWeight: '600', color: Colors.text.secondary },
  activeBatchName: { color: Colors.background.deepBlack },
  alumniListContainer: {},
  alumniCardContainer: { marginBottom: 12 },
  alumniCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.background.darkGreen, borderRadius: 15, padding: 15 },
  alumniImageContainer: { marginRight: 15 },
  alumniImagePlaceholder: { width: 55, height: 55, borderRadius: 28, backgroundColor: Colors.primary.deepGreen, justifyContent: 'center', alignItems: 'center' },
  alumniInitial: { fontSize: 22, fontWeight: '700', color: Colors.text.primary },
  alumniInfo: { flex: 1 },
  alumniName: { fontSize: 16, fontWeight: '600', color: Colors.text.primary },
  alumniRole: { fontSize: 13, color: Colors.text.secondary, marginTop: 3 },
  alumniBatch: { fontSize: 12, color: Colors.text.tertiary, marginTop: 3 },
  alumniArrow: { fontSize: 24, color: Colors.text.tertiary },
  emptyState: { alignItems: 'center', paddingVertical: 40 },
  emptyIcon: { fontSize: 50, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: Colors.text.primary },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: Colors.background.darkGreen, borderTopLeftRadius: 25, borderTopRightRadius: 25, maxHeight: SCREEN_HEIGHT * 0.85 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: Colors.text.muted },
  modalTitle: { fontSize: 18, fontWeight: '700', color: Colors.text.primary },
  modalCloseButton: { width: 35, height: 35, borderRadius: 18, backgroundColor: Colors.background.deepBlack, justifyContent: 'center', alignItems: 'center' },
  modalCloseText: { fontSize: 18, color: Colors.text.secondary },
  modalBody: { padding: 20 },
  modalProfileHeader: { alignItems: 'center', marginBottom: 20 },
  modalProfileImage: { width: 80, height: 80, borderRadius: 40, backgroundColor: Colors.primary.deepGreen, justifyContent: 'center', alignItems: 'center', marginBottom: 15 },
  modalProfileInitial: { fontSize: 32, fontWeight: '700', color: Colors.text.primary },
  modalAlumniName: { fontSize: 22, fontWeight: '700', color: Colors.text.primary, marginBottom: 5 },
  modalAlumniRole: { fontSize: 15, color: Colors.text.secondary, marginBottom: 3 },
  modalAlumniCompany: { fontSize: 14, color: Colors.accent.softGold, marginBottom: 3 },
  modalAlumniLocation: { fontSize: 13, color: Colors.text.tertiary },
  modalSection: { marginBottom: 20 },
  modalSectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text.primary, marginBottom: 8 },
  modalText: { fontSize: 14, color: Colors.text.secondary },
  modalMessage: { fontSize: 14, color: Colors.text.secondary, fontStyle: 'italic', lineHeight: 22 },
  modalActions: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 30 },
  modalActionButton: { alignItems: 'center', backgroundColor: Colors.background.deepBlack, borderRadius: 12, padding: 15, width: 100 },
  modalActionIcon: { fontSize: 24, marginBottom: 5 },
  modalActionText: { fontSize: 12, color: Colors.text.secondary },
});

export default AlumniScreen;