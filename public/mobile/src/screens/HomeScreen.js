import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../supabaseClient';
import { COLORS } from '../theme/colors';
import Header from '../components/Header';
import MarketsSection from '../components/MarketsSection';
import { LayoutGrid, CheckCircle2, Circle, ChevronLeft, ChevronRight, Save } from 'lucide-react-native';

const SECTIONS = [
    { id: 'intro', title: 'Introduction', icon: '📋' },
    { id: 'crop', title: 'Crop Production', icon: '🌾' },
    { id: 'livestock', title: 'Livestock', icon: '🐄' },
    { id: 'fisheries', title: 'Fisheries', icon: '🐟' },
    { id: 'markets', title: 'Markets & Trade', icon: '🏪' },
    { id: 'review', title: 'Review & Submit', icon: '✓' }
];

export default function HomeScreen() {
    const navigation = useNavigation();
    const [session, setSession] = useState(null);
    const [currentSection, setCurrentSection] = useState(0);
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('owner'); // Fetch this from DB in real app

    useEffect(() => {
        async function loadData() {
            const { data: { session } } = await supabase.auth.getSession();
            setSession(session);
            // Fetch assessment data here...
            setLoading(false);
        }
        loadData();
    }, []);

    const nextSection = () => {
        if (currentSection < SECTIONS.length - 1) setCurrentSection(currentSection + 1);
    };

    const prevSection = () => {
        if (currentSection > 0) setCurrentSection(currentSection - 1);
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                email={session?.user?.email}
                userRole={userRole}
                onMenuPress={() => navigation.openDrawer()}
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.progressContainer}>
                    <View style={styles.progressHeader}>
                        <View style={styles.progressIconText}>
                            <LayoutGrid size={16} color={COLORS.primary} />
                            <Text style={styles.progressText}>
                                Section {currentSection + 1} of {SECTIONS.length}
                            </Text>
                        </View>
                        <Text style={styles.percentageText}>
                            {Math.round(((currentSection + 1) / SECTIONS.length) * 100)}% OVERALL
                        </Text>
                    </View>

                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${((currentSection + 1) / SECTIONS.length) * 100}%` }
                            ]}
                        />
                    </View>

                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.sectionsScroll}
                    >
                        {SECTIONS.map((section, idx) => (
                            <TouchableOpacity
                                key={section.id}
                                onPress={() => setCurrentSection(idx)}
                                style={[
                                    styles.sectionTab,
                                    currentSection === idx ? styles.activeTab : (currentSection > idx ? styles.completedTab : styles.inactiveTab)
                                ]}
                            >
                                {currentSection > idx ? (
                                    <CheckCircle2 size={16} color="#16a34a" />
                                ) : (
                                    <Circle size={16} color={currentSection === idx ? "#fff" : "#9ca3af"} opacity={0.5} />
                                )}
                                <Text style={[
                                    styles.sectionTabIcon,
                                    { color: currentSection === idx ? '#fff' : '#4b5563' }
                                ]}>
                                    {section.icon}
                                </Text>
                                <Text style={[
                                    styles.sectionTabText,
                                    { color: currentSection === idx ? '#fff' : (currentSection > idx ? '#16a34a' : '#4b5563') }
                                ]}>
                                    {section.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                <View style={styles.formCard}>
                    <Text style={styles.sectionTitle}>{SECTIONS[currentSection].title}</Text>
                    {/* Section Content */}
                    {SECTIONS[currentSection].id === 'markets' ? (
                        <MarketsSection
                            formData={formData}
                            onUpdate={(data) => setFormData({ ...formData, ...data })}
                        />
                    ) : (
                        <View style={styles.placeholderContent}>
                            <Text style={styles.placeholderText}>
                                {SECTIONS[currentSection].id === 'intro' ? 'Introduction Form Fields...' : 'Form fields for ' + SECTIONS[currentSection].title}
                            </Text>
                        </View>
                    )}
                </View>

                <View style={styles.navigationButtons}>
                    <TouchableOpacity
                        onPress={prevSection}
                        disabled={currentSection === 0}
                        style={[styles.navButton, styles.prevButton, currentSection === 0 && styles.disabledButton]}
                    >
                        <ChevronLeft size={20} color={currentSection === 0 ? '#d1d5db' : '#374151'} />
                        <Text style={[styles.navButtonText, { color: currentSection === 0 ? '#d1d5db' : '#374151' }]}>Previous</Text>
                    </TouchableOpacity>

                    {currentSection < SECTIONS.length - 1 ? (
                        <TouchableOpacity onPress={nextSection} style={[styles.navButton, styles.nextButton]}>
                            <Text style={[styles.navButtonText, { color: '#fff' }]}>Next</Text>
                            <ChevronRight size={20} color="#fff" />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity style={[styles.navButton, styles.submitButton]}>
                            <Save size={20} color="#fff" />
                            <Text style={[styles.navButtonText, { color: '#fff' }]}>Submit</Text>
                        </TouchableOpacity>
                    )}
                </View>
                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    progressContainer: {
        marginBottom: 24,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    progressIconText: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    progressText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    percentageText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#6b7280',
    },
    progressBarBg: {
        height: 8,
        backgroundColor: '#e5e7eb',
        borderRadius: 4,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary, // Could use gradient
        borderRadius: 4,
    },
    sectionsScroll: {
        marginTop: 20,
        gap: 12,
        paddingBottom: 4,
    },
    sectionTab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 8,
        borderWidth: 1,
    },
    activeTab: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
        transform: [{ translateY: -2 }],
    },
    completedTab: {
        backgroundColor: '#f0fdf4',
        borderColor: '#bbf7d0',
    },
    inactiveTab: {
        backgroundColor: '#fff',
        borderColor: '#f3f4f6',
    },
    sectionTabIcon: {
        fontSize: 16,
    },
    sectionTabText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        elevation: 5,
        minHeight: 300,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 20,
    },
    placeholderContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        backgroundColor: '#f9fafb',
        borderRadius: 16,
        borderStyle: 'dashed',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    placeholderText: {
        color: '#9ca3af',
        textAlign: 'center',
    },
    navigationButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 24,
        gap: 12,
    },
    navButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    prevButton: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    nextButton: {
        backgroundColor: COLORS.primary,
    },
    submitButton: {
        backgroundColor: COLORS.secondary,
    },
    navButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabledButton: {
        opacity: 0.5,
    }
});
