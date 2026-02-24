import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { Bell, Menu } from 'lucide-react-native';
import { COLORS } from '../theme/colors';

export default function Header({ onMenuPress, onNotificationsPress, email, userRole }) {
    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <View style={styles.left}>
                    <TouchableOpacity onPress={onMenuPress} style={styles.iconButton}>
                        <Menu size={24} color={COLORS.textLight} />
                    </TouchableOpacity>
                    <View style={styles.brand}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/uganda-coat-of-arms.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <View>
                            <Text style={styles.brandTitle}>Food Security</Text>
                            <Text style={styles.brandSubtitle}>MAAIF UG</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.right}>
                    <TouchableOpacity onPress={onNotificationsPress} style={styles.iconButton}>
                        <Bell size={20} color={COLORS.textLight} />
                        <View style={styles.badge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.profileButton}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>{email?.substring(0, 2).toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    left: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    brand: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logoContainer: {
        width: 32,
        height: 32,
        backgroundColor: '#fff',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        padding: 4,
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    brandTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#111827',
    },
    brandSubtitle: {
        fontSize: 8,
        fontWeight: 'bold',
        color: COLORS.primary,
        letterSpacing: 1,
    },
    right: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconButton: {
        padding: 8,
        borderRadius: 20,
        backgroundColor: '#f9fafb',
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        backgroundColor: COLORS.error,
        borderRadius: 4,
        borderWidth: 1.5,
        borderColor: '#fff',
    },
    avatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    profileButton: {
        marginLeft: 4,
    }
});
