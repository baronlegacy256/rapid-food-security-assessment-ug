import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image } from 'react-native';
import { supabase } from '../../supabaseClient';
import { COLORS } from '../theme/colors';
import Header from '../components/Header';
import { User, Mail, Shield, LogOut, ChevronRight, Settings } from 'lucide-react-native';

export default function ProfileScreen() {
    const [session, setSession] = useState(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });
    }, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <View style={styles.container}>
            <Header
                email={session?.user?.email}
                userRole="owner"
                onMenuPress={() => { }}
            />

            <ScrollView style={styles.content}>
                <View style={styles.profileHeader}>
                    <View style={styles.avatarLarge}>
                        <Text style={styles.avatarTextLarge}>{session?.user?.email?.substring(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.emailText}>{session?.user?.email}</Text>
                    <View style={styles.roleBadge}>
                        <Shield size={12} color={COLORS.primary} />
                        <Text style={styles.roleText}>District Officer</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ACCOUNT SETTINGS</Text>
                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <User size={20} color={COLORS.textLight} />
                        </View>
                        <Text style={styles.menuText}>Personal Information</Text>
                        <ChevronRight size={18} color="#d1d5db" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem}>
                        <View style={styles.menuIconContainer}>
                            <Settings size={20} color={COLORS.textLight} />
                        </View>
                        <Text style={styles.menuText}>Preferences</Text>
                        <ChevronRight size={18} color="#d1d5db" />
                    </TouchableOpacity>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>DANGER ZONE</Text>
                    <TouchableOpacity style={styles.menuItem} onPress={handleSignOut}>
                        <View style={[styles.menuIconContainer, { backgroundColor: '#fef2f2' }]}>
                            <LogOut size={20} color={COLORS.error} />
                        </View>
                        <Text style={[styles.menuText, { color: COLORS.error }]}>Sign Out</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.versionText}>Version 1.0.0 (Build 20260123)</Text>
                    <Text style={styles.copyrightText}>© 2026 MAAIF Uganda</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    profileHeader: {
        alignItems: 'center',
        marginVertical: 32,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
        borderWidth: 4,
        borderColor: '#fff',
    },
    avatarTextLarge: {
        color: '#fff',
        fontSize: 28,
        fontWeight: 'bold',
    },
    emailText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginTop: 16,
    },
    roleBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.blueLight,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 20,
        marginTop: 8,
        gap: 6,
    },
    roleText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: COLORS.primary,
        textTransform: 'uppercase',
    },
    section: {
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 2,
    },
    sectionLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 1.5,
        marginBottom: 12,
        marginTop: 12,
        marginLeft: 12,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 12,
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 10,
        backgroundColor: '#f9fafb',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    menuText: {
        flex: 1,
        fontSize: 15,
        fontWeight: '600',
        color: '#374151',
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 40,
    },
    versionText: {
        fontSize: 10,
        color: '#9ca3af',
    },
    copyrightText: {
        fontSize: 10,
        color: '#9ca3af',
        marginTop: 4,
    }
});
