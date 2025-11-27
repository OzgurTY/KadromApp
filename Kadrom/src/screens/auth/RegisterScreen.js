import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ModernInput from '../../components/common/ModernInput';
import { registerUser } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if(!email || !password || !fullName) {
        Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen tüm alanları doldurun.' });
        return;
    }
    setLoading(true);
    try {
      await registerUser(email, password, {
        fullName,
        position: '?',
        preferredFoot: '?', 
        age: 0
      });
      Toast.show({ type: 'success', text1: 'Aramıza Hoşgeldin!', text2: 'Kaydın başarıyla oluşturuldu.' });
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Kayıt Hatası', text2: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, '#1a1010']} // Hafif kırmızımsı/gri geçiş (Kayıt için farklı ton)
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        {/* Geri Dön Butonu */}
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Takıma Katıl</Text>
            <Text style={styles.subtitle}>Yeni bir başlangıç yap.</Text>
          </View>

          <View style={styles.form}>
            <ModernInput 
                icon="person-outline" 
                placeholder="Ad Soyad" 
                value={fullName} 
                onChangeText={setFullName} 
            />
            
            <ModernInput 
                icon="mail-outline" 
                placeholder="E-posta Adresi" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address"
            />
            
            <ModernInput 
                icon="lock-closed-outline" 
                placeholder="Şifre Oluştur" 
                value={password} 
                onChangeText={setPassword} 
                secureTextEntry 
            />

            <TouchableOpacity 
                style={styles.registerButton} 
                onPress={handleRegister}
                disabled={loading}
            >
                <LinearGradient
                    colors={[colors.primary, '#00b88a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                >
                    <Text style={styles.registerButtonText}>
                        {loading ? 'KAYIT YAPILIYOR...' : 'KAYIT OL'}
                    </Text>
                    {!loading && <Ionicons name="person-add" size={20} color={colors.background} style={{marginLeft: 10}} />}
                </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
              <Text style={styles.footerText}>Zaten hesabın var mı? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                  <Text style={styles.linkText}>Giriş Yap</Text>
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
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
    padding: 10,
    backgroundColor: colors.surface,
    borderRadius: 10
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: 100
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 16,
  },
  form: {
    marginBottom: 20
  },
  registerButton: {
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  gradientButton: {
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20
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