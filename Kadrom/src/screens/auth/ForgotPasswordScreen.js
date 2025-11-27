import React, { useState } from 'react';
import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import ModernInput from '../../components/common/ModernInput';
import { resetPassword } from '../../services/authService';
import Toast from 'react-native-toast-message';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Toast.show({ type: 'error', text1: 'Eksik Bilgi', text2: 'Lütfen e-posta adresini gir.' });
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      
      Toast.show({ 
        type: 'success', 
        text1: 'E-posta Gönderildi', 
        text2: 'Şifre sıfırlama linki e-postana gönderildi.' 
      });
      
      // Kullanıcıyı Login'e geri gönder
      setTimeout(() => {
        navigation.goBack();
      }, 2000);

    } catch (error) {
      let errorMessage = "Bir hata oluştu.";
      if (error.code === 'auth/user-not-found') errorMessage = "Bu e-posta ile kayıtlı kullanıcı bulunamadı.";
      if (error.code === 'auth/invalid-email') errorMessage = "Geçersiz e-posta formatı.";
      
      Toast.show({ type: 'error', text1: 'Hata', text2: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.background, '#101a15']}
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
          
          <View style={styles.iconContainer}>
            <View style={styles.iconCircle}>
                <Ionicons name="key-outline" size={50} color={colors.primary} />
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Şifreni mi Unuttun?</Text>
            <Text style={styles.subtitle}>E-posta adresini gir, sana bir sıfırlama linki gönderelim.</Text>
          </View>

          <View style={styles.form}>
            <ModernInput 
                icon="mail-outline" 
                placeholder="E-posta Adresi" 
                value={email} 
                onChangeText={setEmail} 
                keyboardType="email-address"
            />
            
            <TouchableOpacity 
                style={styles.resetButton} 
                onPress={handleReset}
                disabled={loading}
            >
                <LinearGradient
                    colors={[colors.primary, '#00b88a']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.gradientButton}
                >
                    <Text style={styles.resetButtonText}>
                        {loading ? 'GÖNDERİLİYOR...' : 'LİNKİ GÖNDER'}
                    </Text>
                    {!loading && <Ionicons name="paper-plane-outline" size={20} color={colors.background} style={{marginLeft: 10}} />}
                </LinearGradient>
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
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 30
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 208, 156, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.primary
  },
  header: {
    marginBottom: 30,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
  },
  subtitle: {
    color: colors.text.secondary,
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22
  },
  form: {
    width: '100%'
  },
  resetButton: {
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
  resetButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16,
  }
});