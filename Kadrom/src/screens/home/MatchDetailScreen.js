import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen';
import { colors } from '../../theme/colors';
import { getMatchDetails, joinOrSwitchTeam, leaveMatch, updateTeamColor, balanceTeamsAlgorithm, deleteMatch } from '../../services/matchService';
import { auth } from '../../config/firebaseConfig';
import { getUserData } from '../../services/userService';
import CustomInput from '../../components/common/CustomInput';
import { addGuestPlayer } from '../../services/matchService';
import Toast from 'react-native-toast-message';

// Forma renk seçenekleri
const JERSEY_COLORS = ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6', '#FFFFFF', '#000000'];

export default function MatchDetailScreen({ route, navigation }) {
    const { matchId } = route.params;
    const [match, setMatch] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [selectedTeamForColor, setSelectedTeamForColor] = useState(null); // 'A' veya 'B'
    const [guestModalVisible, setGuestModalVisible] = useState(false);
    const [targetTeamForGuest, setTargetTeamForGuest] = useState(null); // 'A' veya 'B'
    const [guestName, setGuestName] = useState('');
    const [guestRating, setGuestRating] = useState('5.0');

    // Verileri Yükle
    const loadData = async () => {
        try {
            const matchData = await getMatchDetails(matchId);
            const userData = await getUserData(auth.currentUser.uid);
            setMatch(matchData);
            setCurrentUser(userData);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        loadData();
        // Gerçek zamanlı dinleme (onSnapshot) daha iyi olurdu ama şimdilik manuel yenileme yapıyoruz.
        // Kullanıcı bir işlem yaptığında loadData() çağıracağız.
    }, []);

    // Takım İşlemleri (Katıl / Değiştir / Çık)
    const handleTeamAction = async (targetTeam) => {
        if (!currentUser || !match) return;

        // Hangi takımda?
        const inTeamA = match.teamA?.some(p => p.id === currentUser.id);
        const inTeamB = match.teamB?.some(p => p.id === currentUser.id);
        const currentTeam = inTeamA ? 'A' : (inTeamB ? 'B' : null);

        // 1. Senaryo: Zaten o takımdaysa -> Çıkmak mı istiyor?
        if (currentTeam === targetTeam) {
            Alert.alert(
                "Takımdan Ayrıl",
                "Takımdan çıkmak istiyor musun?",
                [
                    { text: "İptal", style: 'cancel' },
                    {
                        text: "Çık", style: 'destructive', onPress: async () => {
                            await leaveMatch(matchId, currentUser);
                            loadData();
                        }
                    }
                ]
            );
            return;
        }

        // 2. Senaryo: Takım değiştiriyor veya yeni katılıyor
        try {
            await joinOrSwitchTeam(matchId, targetTeam, currentUser);
            loadData();
        } catch (error) {
            Toast.show({
                type: 'error',
                text1: 'Hata',
                text2: 'Takım değiştirilemedi.'
            });
        }
    };

    // Dengeleme
    const handleBalance = async () => {
        Alert.alert("Takımları Dengele", "Oyuncular puanlarına göre otomatik dağıtılacak. Onaylıyor musun?", [
            { text: "İptal", style: 'cancel' },
            {
                text: "Dengele", onPress: async () => {
                    await balanceTeamsAlgorithm(matchId);
                    loadData();
                    Alert.alert("Başarılı", "Takımlar dengelendi!");
                }
            }
        ]);
    };

    // Renk Seçimi
    const openColorPicker = (team) => {
        setSelectedTeamForColor(team);
        setColorPickerVisible(true);
    };

    const handleColorSelect = async (color) => {
        await updateTeamColor(matchId, selectedTeamForColor, color);
        setColorPickerVisible(false);
        loadData();
    };

    if (!match) return <Screen><Text style={{ color: 'white' }}>Yükleniyor...</Text></Screen>;

    // Takım Renklerini Belirle (Varsayılan veya Seçilen)
    const colorA = match.colorA || colors.primary;
    const colorB = match.colorB || colors.status.danger;

    const handleAddGuest = async () => {
        if (!guestName) return;
        try {
            await addGuestPlayer(matchId, targetTeamForGuest, guestName, guestRating);
            setGuestModalVisible(false);
            setGuestName('');
            setGuestRating('5.0');
            loadData();
        } catch (e) {
            Alert.alert("Hata", "Misafir eklenemedi");
        }
    };

    const openGuestModal = (team) => {
        setTargetTeamForGuest(team);
        setGuestModalVisible(true);
    };

    const handleDeleteMatch = () => {
        Alert.alert(
            "Maçı İptal Et",
            "Bu maçı ve tüm kadroları kalıcı olarak silmek istediğine emin misin?",
            [
                { text: "Vazgeç", style: "cancel" },
                {
                    text: "Evet, Sil",
                    style: "destructive", // Kırmızı yazar (iOS)
                    onPress: async () => {
                        try {
                            await deleteMatch(matchId);
                            Toast.show({
                                type: 'success',
                                text1: 'Maç İptal Edildi',
                                text2: 'Organizasyon başarıyla silindi.'
                            });
                            navigation.goBack(); // Listeye dön
                        } catch (error) {
                            Toast.show({
                                type: 'error',
                                text1: 'Hata',
                                text2: 'Maç silinemedi.'
                            });
                        }
                    }
                }
            ]
        );
    };

    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false}>

                {/* Header Kısmı */}
                <View style={styles.header}>
                    <Text style={styles.title}>{match.location}</Text>

                    <View style={{ flexDirection: 'row', gap: 10 }}>

                        {/* YENİ: Sadece Oluşturan Kişi Silebilir */}
                        {match.createdBy === auth.currentUser?.uid && (
                            <TouchableOpacity
                                onPress={handleDeleteMatch}
                                style={[styles.toolButton, { backgroundColor: colors.surface }]} // İstersen kırmızıya çalabilir
                            >
                                <Ionicons name="trash-outline" size={20} color={colors.status.danger} />
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity onPress={handleBalance} style={styles.toolButton}>
                            <Ionicons name="shuffle" size={20} color={colors.text.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => Share.share({ message: `Maça gel: ${match.location}` })} style={styles.toolButton}>
                            <Ionicons name="share-social-outline" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={styles.dateInfo}>
                    {new Date(match.date).toLocaleString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}
                </Text>

                {/* --- KADROLAR --- */}
                <View style={styles.fieldContainer}>

                    {/* TAKIM A */}
                    <View style={styles.teamContainer}>
                        <TouchableOpacity
                            style={[styles.teamHeader, { backgroundColor: colorA }]}
                            onPress={() => openColorPicker('A')}
                        >
                            <Ionicons name="shirt" size={16} color={colorA === '#FFFFFF' ? '#000' : '#FFF'} />
                            <Text style={[styles.teamTitle, { color: colorA === '#FFFFFF' ? '#000' : '#FFF' }]}>
                                TAKIM A ({match.teamA?.length || 0})
                            </Text>
                        </TouchableOpacity>

                        {match.teamA?.map((p, i) => (
                            <View key={i} style={styles.playerRow}>
                                <Text style={styles.playerText}>{p.fullName}</Text>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>{p.rating}</Text>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleTeamAction('A')}>
                            <Text style={styles.actionText}>
                                {match.teamA?.some(p => p.id === auth.currentUser?.uid) ? "ÇIK" : "KATIL"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', marginBottom: 10 }} onPress={() => openGuestModal('A')}>
                            <Text style={{ color: colors.text.secondary, fontSize: 11, textDecorationLine: 'underline' }}>+ Misafir Ekle</Text>
                        </TouchableOpacity>
                    </View>

                    {/* VS Çizgisi */}
                    <View style={styles.centerLine}>
                        <View style={styles.line} />
                        <View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View>
                        <View style={styles.line} />
                    </View>

                    {/* TAKIM B */}
                    <View style={styles.teamContainer}>
                        <TouchableOpacity
                            style={[styles.teamHeader, { backgroundColor: colorB }]}
                            onPress={() => openColorPicker('B')}
                        >
                            <Ionicons name="shirt" size={16} color={colorB === '#FFFFFF' ? '#000' : '#FFF'} />
                            <Text style={[styles.teamTitle, { color: colorB === '#FFFFFF' ? '#000' : '#FFF' }]}>
                                TAKIM B ({match.teamB?.length || 0})
                            </Text>
                        </TouchableOpacity>

                        {match.teamB?.map((p, i) => (
                            <View key={i} style={styles.playerRow}>
                                <Text style={styles.playerText}>{p.fullName}</Text>
                                <View style={styles.ratingBadge}>
                                    <Text style={styles.ratingText}>{p.rating}</Text>
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity style={styles.actionButton} onPress={() => handleTeamAction('B')}>
                            <Text style={styles.actionText}>
                                {match.teamB?.some(p => p.id === auth.currentUser?.uid) ? "ÇIK" : "KATIL"}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ alignItems: 'center', marginBottom: 10 }} onPress={() => openGuestModal('B')}>
                            <Text style={{ color: colors.text.secondary, fontSize: 11, textDecorationLine: 'underline' }}>+ Misafir Ekle</Text>
                        </TouchableOpacity>
                    </View>

                </View>

                {/* Renk Seçici Modal */}
                <Modal visible={colorPickerVisible} transparent animationType="fade">
                    <TouchableOpacity
                        style={styles.modalOverlay}
                        activeOpacity={1}
                        onPress={() => setColorPickerVisible(false)}
                    >
                        <View style={styles.colorPickerContainer}>
                            <Text style={{ color: colors.text.primary, marginBottom: 15, fontWeight: 'bold' }}>Forma Rengi Seç</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' }}>
                                {JERSEY_COLORS.map(c => (
                                    <TouchableOpacity
                                        key={c}
                                        style={[styles.colorCircle, { backgroundColor: c }]}
                                        onPress={() => handleColorSelect(c)}
                                    />
                                ))}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
                {/* Misafir Oyuncu Modalı */}
                <Modal visible={guestModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.colorPickerContainer, { width: '90%' }]}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: colors.text.primary, marginBottom: 15 }}>
                                Misafir Oyuncu Ekle ({targetTeamForGuest} Takımı)
                            </Text>

                            <CustomInput placeholder="İsim (Örn: Ahmet)" value={guestName} onChangeText={setGuestName} />
                            <CustomInput placeholder="Puan (1-10)" value={guestRating} onChangeText={setGuestRating} keyboardType="numeric" />

                            <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                                <TouchableOpacity
                                    style={{ flex: 1, padding: 15, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border }}
                                    onPress={() => setGuestModalVisible(false)}
                                >
                                    <Text style={{ color: colors.text.secondary, textAlign: 'center' }}>İptal</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={{ flex: 1, padding: 15, backgroundColor: colors.primary, borderRadius: 10 }}
                                    onPress={handleAddGuest}
                                >
                                    <Text style={{ color: colors.background, fontWeight: 'bold', textAlign: 'center' }}>Ekle</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
                {/* Maç Sonu Aksiyonları */}
                {new Date() > new Date(match.date) && (
                    <View style={{ marginTop: 20, marginBottom: 40 }}>
                        <Text style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: 10 }}>
                            Maç süresi doldu. Performansları değerlendir.
                        </Text>
                        <TouchableOpacity
                            style={{
                                backgroundColor: colors.status.warning, // Dikkat çekici sarı/altın renk
                                padding: 15,
                                borderRadius: 10,
                                alignItems: 'center',
                                flexDirection: 'row',
                                justifyContent: 'center',
                                gap: 10
                            }}
                            onPress={() => navigation.navigate('RatePlayers', {
                                teamA: match.teamA,
                                teamB: match.teamB
                            })}
                        >
                            <Ionicons name="star" size={24} color="#000" />
                            <Text style={{ color: '#000', fontWeight: 'bold', fontSize: 16 }}>
                                OYUNCULARI PUANLA
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text.primary
    },
    toolButton: {
        backgroundColor: colors.surface,
        padding: 8,
        borderRadius: 8
    },
    dateInfo: {
        color: colors.text.secondary,
        marginBottom: 20
    },
    fieldContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    teamContainer: {
        width: '46%',
        backgroundColor: colors.surface,
        borderRadius: 12,
        paddingBottom: 10,
        overflow: 'hidden'
    },
    teamHeader: {
        padding: 10,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 5
    },
    teamTitle: {
        fontWeight: 'bold',
        fontSize: 14
    },
    playerRow: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    playerText: {
        color: colors.text.primary,
        fontSize: 12,
        maxWidth: '80%'
    },
    ratingBadge: {
        backgroundColor: colors.background,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4
    },
    ratingText: {
        color: colors.status.warning,
        fontSize: 10,
        fontWeight: 'bold'
    },
    actionButton: {
        margin: 10,
        padding: 8,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 6,
        alignItems: 'center',
        borderStyle: 'dashed'
    },
    actionText: {
        color: colors.text.secondary,
        fontSize: 12,
        fontWeight: 'bold'
    },
    centerLine: {
        width: '8%',
        alignItems: 'center',
        justifyContent: 'center'
    },
    line: {
        width: 1,
        flex: 1,
        backgroundColor: colors.border
    },
    vsBadge: {
        backgroundColor: colors.border,
        padding: 4,
        borderRadius: 4,
        marginVertical: 5
    },
    vsText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.text.secondary
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center'
    },
    colorPickerContainer: {
        backgroundColor: colors.surface,
        padding: 20,
        borderRadius: 15,
        width: '80%',
        alignItems: 'center'
    },
    colorCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: colors.border
    }
});