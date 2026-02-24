import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { supabase } from '../../supabaseClient';
import { COLORS } from '../theme/colors';
import { LogIn, Loader2 } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [error, setError] = useState(null);

    const handleAuth = async () => {
        setLoading(true);
        setError(null);
        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                alert('Check your email for the login link!');
            } else {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
            }
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={['#eff6ff', '#ffffff', '#f0fdf4']}
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/uganda-coat-of-arms.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.title}>MAAIF Uganda</Text>
                        <Text style={styles.subtitle}>Rapid Food Security Assessment</Text>
                    </View>

                    <View style={styles.card}>
                        <View style={styles.topBar} />

                        {error && (
                            <View style={styles.errorContainer}>
                                <Text style={styles.errorText}>{error}</Text>
                            </View>
                        )}

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email address</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="officer@maaif.go.ug"
                                value={email}
                                onChangeText={setEmail}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="••••••••"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <TouchableOpacity
                            style={styles.button}
                            onPress={handleAuth}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isSignUp ? 'Create Account' : 'Sign in to Portal'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.dividerContainer}>
                            <View style={styles.divider} />
                            <Text style={styles.dividerText}>External Auth</Text>
                            <View style={styles.divider} />
                        </View>

                        <TouchableOpacity style={styles.googleButton}>
                            <Image
                                source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg' }}
                                style={styles.googleIcon}
                            />
                            <Text style={styles.googleButtonText}>Continue with Google</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.switchButton}
                            onPress={() => setIsSignUp(!isSignUp)}
                        >
                            <Text style={styles.switchButtonText}>
                                {isSignUp ? "Already have an account? Sign in" : "New officer? Create an account"}
                            </Text>
                        </TouchableOpacity>
                    </View>


                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: 20,
        paddingTop: 60,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        width: 64,
        height: 64,
        backgroundColor: '#fff',
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        padding: 8,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    logo: {
        width: '100%',
        height: '100%',
    },
    title: {
        fontSize: 28,
        fontWeight: '800',
        color: '#111827',
        marginTop: 24,
    },
    subtitle: {
        fontSize: 14,
        color: '#4b5563',
        marginTop: 8,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.15,
        shadowRadius: 30,
        elevation: 10,
        borderWidth: 1,
        borderColor: '#f3f4f6',
        position: 'relative',
        overflow: 'hidden',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 4,
        backgroundColor: '#22c55e', // gradient simulated or solid
    },
    errorContainer: {
        backgroundColor: '#fef2f2',
        borderWidth: 1,
        borderColor: '#fee2e2',
        padding: 12,
        borderRadius: 12,
        marginBottom: 20,
    },
    errorText: {
        color: '#dc2626',
        fontSize: 14,
        fontWeight: '500',
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: '#374151',
        marginLeft: 4,
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        color: '#111827',
    },
    button: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
        marginTop: 10,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 24,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: '#f3f4f6',
    },
    dividerText: {
        marginHorizontal: 12,
        fontSize: 14,
        color: '#9ca3af',
        fontWeight: '500',
    },
    googleButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 12,
        paddingVertical: 12,
    },
    googleIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
    },
    googleButtonText: {
        color: '#374151',
        fontSize: 15,
        fontWeight: '700',
    },
    switchButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    switchButtonText: {
        color: '#2563eb',
        fontSize: 14,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    partnerSection: {
        marginTop: 48,
        alignItems: 'center',
    },
    partnerTitle: {
        fontSize: 10,
        fontWeight: '900',
        color: '#9ca3af',
        letterSpacing: 2,
        marginBottom: 20,
    },
    partnerLogos: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 32,
        opacity: 0.6,
    },
    partnerLogo: {
        height: 40,
        width: 80,
    }
});
