import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { globalStyles } from '../../theme/globalStyles';
import { colors } from '../../theme/colors';
import { auth } from '../../config/firebaseConfig';
import { getUserData, updateUserBadges } from '../../services/userService';
import { logoutUser } from '../../services/authService';
import PlayerCard from '../../components/cards/PlayerCard';
import CustomButton from '../../components/common/CustomButton'; // Bunu henüz yapmadık, aşağıda buton koyacağız
import Screen from '../../components/common/Screen';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BADGE_DEFINITIONS } from '../../utils/badges';

export default function ProfileScreen({ navigation }) {
    const [playerData, setPlayerData] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(React.useCallback(() => {
        const fetchProfile = async () => {
            try {
                const uid = auth.currentUser.uid;
                await updateUserBadges(uid);
                const data = await getUserData(uid);
                setPlayerData(data);
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []));

    if (loading) {
        return (
            <View style={[globalStyles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <Screen>
            <View style={globalStyles.container}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 40 }}>

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <Text style={globalStyles.title}>PROFİLİM</Text>

                        <TouchableOpacity
                            onPress={() => navigation.navigate('EditProfile')}
                            style={{ padding: 10, backgroundColor: colors.surface, borderRadius: 10 }}
                        >
                            <Ionicons name="settings-outline" size={24} color={colors.primary} />
                        </TouchableOpacity>
                    </View>

                    {playerData && <PlayerCard player={playerData} />}

                    {/* ROZETLER ALANI */}
                    <View style={{ marginTop: 20, marginBottom: 10 }}>
                        <Text style={[globalStyles.title, { fontSize: 18, marginBottom: 10, marginLeft: 5 }]}>
                            Rozetlerim
                        </Text>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ paddingLeft: 5 }}>
                            {BADGE_DEFINITIONS.map((badge) => {
                                // Kullanıcı bu rozete sahip mi?
                                const hasBadge = playerData?.badges?.includes(badge.id);

                                return (
                                    <View
                                        key={badge.id}
                                        style={{
                                            backgroundColor: hasBadge ? colors.surface : '#222', // Sahip değilse daha koyu
                                            marginRight: 15,
                                            padding: 15,
                                            borderRadius: 12,
                                            alignItems: 'center',
                                            width: 100,
                                            borderWidth: 1,
                                            borderColor: hasBadge ? badge.color : '#333',
                                            opacity: hasBadge ? 1 : 0.4 // Sahip değilse silik göster
                                        }}
                                    >
                                        <Ionicons name={badge.icon} size={32} color={hasBadge ? badge.color : '#555'} />
                                        <Text style={{
                                            color: colors.text.primary,
                                            fontWeight: 'bold',
                                            marginTop: 5,
                                            fontSize: 12,
                                            textAlign: 'center'
                                        }}>
                                            {badge.title}
                                        </Text>
                                        {/* Sahip değilse kilit ikonu koyabiliriz */}
                                        {!hasBadge && (
                                            <View style={{ position: 'absolute', top: 5, right: 5 }}>
                                                <Ionicons name="lock-closed" size={12} color="#555" />
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.statsOverview}>
                        <Text style={styles.motivationalText}>
                            "Sahanın hakimi sensin, {playerData?.fullName.split(' ')[0]}!"
                        </Text>
                    </View>

                    {/* Geçici Buton Stili - Common Button yapınca değiştireceğiz */}
                    <View style={{ marginTop: 20 }}>
                        <Text
                            onPress={() => logoutUser()}
                            style={{
                                color: colors.status.danger,
                                textAlign: 'center',
                                padding: 15,
                                fontWeight: 'bold'
                            }}>
                            ÇIKIŞ YAP
                        </Text>
                    </View>

                </ScrollView>
            </View>
        </Screen>
    );
}

const styles = StyleSheet.create({
    statsOverview: {
        backgroundColor: colors.surface,
        padding: 15,
        borderRadius: 10,
        marginVertical: 10,
        alignItems: 'center'
    },
    motivationalText: {
        color: colors.text.secondary,
        fontStyle: 'italic',
        textAlign: 'center'
    }
});