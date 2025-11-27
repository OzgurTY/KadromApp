import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform, Alert, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { globalStyles } from '../../theme/globalStyles';
import { colors } from '../../theme/colors';
import CustomInput from '../../components/common/CustomInput';
import { createMatch } from '../../services/matchService';
import Screen from '../../components/common/Screen';
import Toast from 'react-native-toast-message';

export default function CreateMatchScreen({ navigation }) {
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('');
    const [iban, setIban] = useState('');
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!location || !price) {
            Toast.show({
                type: 'error', // Config dosyasındaki 'error' tasarımını kullanır
                text1: 'Eksik Bilgi',
                text2: 'Lütfen konum ve fiyat bilgilerini girin.'
            });
            return;
        }

        setLoading(true);
        try {
            await createMatch({
                location,
                price,
                iban,
                date: date.toISOString(), // Tarihi string olarak saklıyoruz
            });
            Toast.show({
                type: 'success',
                text1: 'Harika!',
                text2: 'Maç başarıyla oluşturuldu.'
            });

            // Kullanıcı mesajı görsün diye hafif bir gecikmeyle geri dönelim
            setTimeout(() => {
                navigation.goBack();
            }, 1500);
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Maç oluşturulurken bir sorun çıktı.'
            });
        } finally {
            setLoading(false);
        }
    };

    const onDateChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios'); // iOS'te kalıcı olabilir, Android'de kapanır
        setDate(currentDate);
    };

    return (
        <Screen>
            <View style={globalStyles.container}>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <Text style={globalStyles.title}>Yeni Maç Oluştur</Text>

                    <Text style={styles.label}>Saha / Konum</Text>
                    <CustomInput placeholder="Örn: Yıldız Halısaha" value={location} onChangeText={setLocation} />

                    <Text style={styles.label}>Tarih ve Saat</Text>
                    {/* Tarih Seçici Butonu */}
                    <TouchableOpacity
                        style={styles.dateButton}
                        onPress={() => setShowDatePicker(true)}
                    >
                        <Text style={{ color: colors.text.primary, fontSize: 16 }}>
                            {date.toLocaleString('tr-TR')}
                        </Text>
                    </TouchableOpacity>

                    {showDatePicker && (
                        <DateTimePicker
                            value={date}
                            mode="datetime"
                            display="default"
                            onChange={onDateChange}
                            themeVariant="dark"
                            minimumDate={new Date()}
                        />
                    )}

                    <Text style={styles.label}>Kişi Başı Ücret (TL)</Text>
                    <CustomInput placeholder="150" value={price} onChangeText={setPrice} keyboardType="numeric" />

                    <Text style={styles.label}>IBAN (Opsiyonel)</Text>
                    <CustomInput placeholder="TR..." value={iban} onChangeText={setIban} />

                    <TouchableOpacity
                        style={[styles.createButton, { opacity: loading ? 0.7 : 1 }]}
                        onPress={handleCreate}
                        disabled={loading}
                    >
                        <Text style={styles.createButtonText}>
                            {loading ? "OLUŞTURULUYOR..." : "MAÇI OLUŞTUR"}
                        </Text>
                    </TouchableOpacity>

                </ScrollView>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    label: {
        color: colors.text.secondary,
        marginTop: 15,
        marginBottom: 5,
        marginLeft: 5,
        fontSize: 14,
        fontWeight: 'bold'
    },
    dateButton: {
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: colors.border,
        marginBottom: 10
    },
    createButton: {
        backgroundColor: colors.primary,
        padding: 18,
        borderRadius: 12,
        marginTop: 30,
        alignItems: 'center',
        marginBottom: 50
    },
    createButtonText: {
        color: colors.background,
        fontWeight: 'bold',
        fontSize: 16
    }
});