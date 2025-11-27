import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ModernInput from '../../components/common/ModernInput';
import { loginUser } from '../../services/authService';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email || !password) return;
        setLoading(true);
        try {
            await loginUser(email, password);
            // Başarılı olursa root navigator yönlendirir, burada bir şey yapmaya gerek yok
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Giriş Başarısız', text2: 'E-posta veya şifre hatalı.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[colors.background, '#0f1512']} // Hafif yeşilimsi siyah geçiş
            style={styles.container}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                    {/* Logo Alanı */}
                    <View style={styles.logoContainer}>
                        <View style={styles.logoCircle}>
                            <Ionicons name="football" size={60} color={colors.primary} />
                        </View>
                        <Text style={styles.appName}>KADROM</Text>
                        <Text style={styles.tagline}>Sahalar Bizim!</Text>
                    </View>

                    {/* Form Alanı */}
                    <View style={styles.formContainer}>
                        <Text style={styles.welcomeText}>Giriş Yap</Text>
                        <Text style={styles.subText}>Kaldığın yerden devam et.</Text>

                        <ModernInput
                            icon="mail-outline"
                            placeholder="E-posta Adresi"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                        />

                        <ModernInput
                            icon="lock-closed-outline"
                            placeholder="Şifre"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />

                        {/* Unuttum Linki (Opsiyonel) */}
                        <TouchableOpacity
                            style={{ alignSelf: 'flex-end', marginBottom: 20 }}
                            onPress={() => navigation.navigate('ForgotPassword')} // YENİ: Yönlendirme
                        >
                            <Text style={{ color: colors.text.secondary, fontSize: 13 }}>Şifremi Unuttum?</Text>
                        </TouchableOpacity>

                        {/* Login Butonu */}
                        <TouchableOpacity
                            style={styles.loginButton}
                            onPress={handleLogin}
                            disabled={loading}
                        >
                            <LinearGradient
                                colors={[colors.primary, '#00b88a']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.gradientButton}
                            >
                                <Text style={styles.loginButtonText}>
                                    {loading ? 'GİRİŞ YAPILIYOR...' : 'GİRİŞ YAP'}
                                </Text>
                                {!loading && <Ionicons name="arrow-forward" size={20} color={colors.background} style={{ marginLeft: 10 }} />}
                            </LinearGradient>
                        </TouchableOpacity>

                        {/* Kayıt Ol Linki */}
                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Hesabın yok mu? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.linkText}>Kayıt Ol</Text>
                            </TouchableOpacity>
                        </View>
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
        paddingTop: 60
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(0, 208, 156, 0.1)', // Primary rengin saydam hali
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: 'rgba(0, 208, 156, 0.3)'
    },
    appName: {
        fontSize: 32,
        fontWeight: '900', // Çok kalın
        color: colors.text.primary,
        letterSpacing: 2,
    },
    tagline: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: 'bold',
        letterSpacing: 1
    },
    formContainer: {
        width: '100%',
    },
    welcomeText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text.primary,
        marginBottom: 5,
    },
    subText: {
        color: colors.text.secondary,
        marginBottom: 25,
        fontSize: 15
    },
    loginButton: {
        width: '100%',
        borderRadius: 12,
        overflow: 'hidden', // Gradient taşmasın diye
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
        marginBottom: 30
    },
    gradientButton: {
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10
    },
    footerText: {
        color: colors.text.secondary,
        fontSize: 15
    },
    linkText: {
        color: colors.primary,
        fontWeight: 'bold',
        fontSize: 15
    }
});