import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import Screen from '../../components/common/Screen';
import { colors } from '../../theme/colors';
import { auth } from '../../config/firebaseConfig';
import { getUserData, updateUserProfile } from '../../services/userService';
import ModernInput from '../../components/common/ModernInput';

// Seçenekler
const POSITIONS = ['Kaleci', 'Defans', 'Orta Saha', 'Forvet'];
const FEET = ['Sağ', 'Sol', 'Her İkisi'];

export default function EditProfileScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [position, setPosition] = useState('');
  const [preferredFoot, setPreferredFoot] = useState('');

  // Verileri Çek
  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getUserData(auth.currentUser.uid);
        setFullName(data.fullName);
        setAge(data.age ? data.age.toString() : '');
        setPosition(data.position || '');
        setPreferredFoot(data.preferredFoot || '');
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    loadUser();
  }, []);

  // Kaydet
  const handleSave = async () => {
    setSaving(true);
    try {
      await updateUserProfile(auth.currentUser.uid, {
        fullName,
        age: parseInt(age) || 0,
        position,
        preferredFoot
      });
      Alert.alert("Başarılı", "Profilin güncellendi!");
      navigation.goBack(); // Geri dön
    } catch (error) {
      Alert.alert("Hata", "Güncelleme yapılamadı.");
    } finally {
      setSaving(false);
    }
  };

  // Seçim Butonu Bileşeni (UI Helper)
  const SelectionGroup = ({ label, options, selected, onSelect }) => (
    <View style={{ marginBottom: 20 }}>
      <Text style={styles.label}>{label}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {options.map((opt) => {
            const isActive = selected === opt;
            return (
                <TouchableOpacity
                    key={opt}
                    onPress={() => onSelect(opt)}
                    style={[
                        styles.optionBtn,
                        isActive && { backgroundColor: colors.primary, borderColor: colors.primary }
                    ]}
                >
                    <Text style={[
                        styles.optionText,
                        isActive && { color: colors.background, fontWeight: 'bold' }
                    ]}>
                        {opt}
                    </Text>
                </TouchableOpacity>
            )
        })}
      </View>
    </View>
  );

  if (loading) return <Screen><ActivityIndicator color={colors.primary} /></Screen>;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Profili Düzenle</Text>

        <Text style={styles.label}>Ad Soyad</Text>
        <ModernInput value={fullName} onChangeText={setFullName} />

        <Text style={styles.label}>Yaş</Text>
        <ModernInput value={age} onChangeText={setAge} keyboardType="numeric" placeholder="Örn: 26" />

        <SelectionGroup 
            label="Mevki" 
            options={POSITIONS} 
            selected={position} 
            onSelect={setPosition} 
        />

        <SelectionGroup 
            label="Kullandığın Ayak" 
            options={FEET} 
            selected={preferredFoot} 
            onSelect={setPreferredFoot} 
        />

        <TouchableOpacity 
            style={styles.saveButton} 
            onPress={handleSave}
            disabled={saving}
        >
            <Text style={styles.saveButtonText}>{saving ? "KAYDEDİLİYOR..." : "DEĞİŞİKLİKLERİ KAYDET"}</Text>
        </TouchableOpacity>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20
  },
  label: {
    color: colors.text.secondary,
    marginBottom: 8,
    marginTop: 10,
    fontWeight: 'bold'
  },
  optionBtn: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface
  },
  optionText: {
    color: colors.text.secondary,
  },
  saveButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginTop: 30,
    alignItems: 'center',
    marginBottom: 40
  },
  saveButtonText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16
  }
});