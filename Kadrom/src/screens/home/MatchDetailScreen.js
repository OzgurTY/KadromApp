import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import Screen from '../../components/common/Screen';
import { colors } from '../../theme/colors';
import { getMatchDetails, joinOrSwitchTeam, leaveMatch, updateTeamColor, balanceTeamsAlgorithm, deleteMatch, addGuestPlayer, kickPlayer, finishMatch } from '../../services/matchService';
import { auth } from '../../config/firebaseConfig';
import { getUserData } from '../../services/userService';
import ModernInput from '../../components/common/ModernInput';
import Toast from 'react-native-toast-message';

const JERSEY_COLORS = ['#E74C3C', '#3498DB', '#F1C40F', '#2ECC71', '#9B59B6', '#FFFFFF', '#000000'];

export default function MatchDetailScreen({ route, navigation }) {
    const { matchId } = route.params;
    
    const [match, setMatch] = useState(null);
    const [currentUser, setCurrentUser] = useState(null);
    const [creatorName, setCreatorName] = useState('');

    const [colorPickerVisible, setColorPickerVisible] = useState(false);
    const [selectedTeamForColor, setSelectedTeamForColor] = useState(null);
    const [guestModalVisible, setGuestModalVisible] = useState(false);
    const [targetTeamForGuest, setTargetTeamForGuest] = useState(null);
    const [guestName, setGuestName] = useState('');
    const [guestRating, setGuestRating] = useState('5.0');

    const loadData = async () => {
        try {
            const matchData = await getMatchDetails(matchId);
            setMatch(matchData);
            const userData = await getUserData(auth.currentUser.uid);
            setCurrentUser(userData);
            if (matchData.createdBy) {
                const creator = await getUserData(matchData.createdBy);
                setCreatorName(creator.fullName);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => { loadData(); }, []);

    // Durum Kontrolleri
    const isMatchFinished = match ? new Date() > new Date(match.date) : false;
    const isOrganizer = match && currentUser && match.createdBy === currentUser.id;
    const isParticipant = match && currentUser && (
        match.teamA?.some(p => p.id === currentUser.id) || 
        match.teamB?.some(p => p.id === currentUser.id)
    );

    const handleCopyIBAN = async () => {
        if (match.iban) {
            await Clipboard.setStringAsync(match.iban);
            Toast.show({ type: 'success', text1: 'Kopyalandı', text2: 'IBAN panoya kopyalandı.' });
        }
    };

    const handleTeamAction = async (targetTeam) => {
        if (!currentUser || !match) return;
        if (isMatchFinished) {
            Toast.show({ type: 'info', text1: 'Maç Bitti', text2: 'Kadro değişiklikleri kapatıldı.' });
            return;
        }

        const inTeamA = match.teamA?.some(p => p.id === currentUser.id);
        const inTeamB = match.teamB?.some(p => p.id === currentUser.id);
        const currentTeam = inTeamA ? 'A' : (inTeamB ? 'B' : null);

        if (currentTeam === targetTeam) {
            Alert.alert("Takımdan Ayrıl", "Çıkmak istiyor musun?", [
                { text: "İptal", style: 'cancel' },
                { text: "Çık", style: 'destructive', onPress: async () => { await leaveMatch(matchId, currentUser); loadData(); } }
            ]);
            return;
        }
        try {
            await joinOrSwitchTeam(matchId, targetTeam, currentUser);
            loadData();
        } catch (error) {
            Toast.show({ type: 'error', text1: 'Hata', text2: 'İşlem başarısız.' });
        }
    };

    const handleKickPlayer = (team, player) => {
        if (isMatchFinished) return;
        Alert.alert("Oyuncuyu Çıkar", `${player.fullName} kadrodan çıkarılsın mı?`, [
            { text: "İptal", style: 'cancel' },
            { text: "Çıkar", style: 'destructive', onPress: async () => {
                try {
                    await kickPlayer(matchId, team, player.id);
                    loadData();
                    Toast.show({ type: 'success', text1: 'Güncellendi', text2: 'Oyuncu çıkarıldı.' });
                } catch (error) {
                    Toast.show({ type: 'error', text1: 'Hata', text2: 'Oyuncu çıkarılamadı.' });
                }
            }}
        ]);
    };

    const handleBalance = () => {
        if (isMatchFinished) {
             Toast.show({ type: 'info', text1: 'Uyarı', text2: 'Maç bittiği için dengeleme yapılamaz.' });
             return;
        }
        Alert.alert("Takımları Dengele", "Onaylıyor musun?", [
            { text: "İptal", style: 'cancel' },
            { text: "Dengele", onPress: async () => { await balanceTeamsAlgorithm(matchId); loadData(); Toast.show({type:'success', text1:'Dengelendi'}); } }
        ]);
    };

    const handleColorSelect = async (color) => {
        await updateTeamColor(matchId, selectedTeamForColor, color);
        setColorPickerVisible(false);
        loadData();
    };

    const handleAddGuest = async () => {
        if (isMatchFinished) return;
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

    const handleDeleteMatch = () => {
        Alert.alert("Maçı İptal Et", "Silmek istediğine emin misin?", [
            { text: "Vazgeç", style: "cancel" },
            { text: "Evet, Sil", style: "destructive", onPress: async () => { 
                try { await deleteMatch(matchId); Toast.show({ type: 'success', text1: 'Silindi' }); navigation.goBack(); } 
                catch (error) { Toast.show({ type: 'error', text1: 'Hata' }); } 
            }}
        ]);
    };

    if (!match) return <Screen><Text style={{ color: 'white', textAlign:'center', marginTop:20 }}>Yükleniyor...</Text></Screen>;

    const colorA = match.colorA || colors.primary;
    const colorB = match.colorB || colors.status.danger;

    const renderPlayerRow = (player, teamType) => (
        <View key={player.id} style={styles.playerRow}>
            <View style={{flex:1}}>
                <Text style={styles.playerText}>{player.fullName}</Text>
            </View>
            <View style={{flexDirection:'row', alignItems:'center', gap: 10}}>
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>{typeof player.rating === 'number' ? player.rating.toFixed(1) : player.rating}</Text>
                </View>
                {/* Organizatör Butonu: Kendi kendini atamasın */}
                {isOrganizer && !isMatchFinished && player.id !== currentUser.id && (
                    <TouchableOpacity onPress={() => handleKickPlayer(teamType, player)}>
                        <Ionicons name="close-circle-outline" size={22} color={colors.text.secondary} />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    const isMatchCompleted = match ? new Date() > new Date(match.date) : false;
    const isMatchCompletedDb = match?.status === 'completed';

    return (
        <Screen>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                <View style={styles.header}>
                    <View style={{flex: 1}}>
                        <Text style={styles.title}>{match.location}</Text>
                        <Text style={styles.dateInfo}>{new Date(match.date).toLocaleString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 10 }}>
                        {isOrganizer && (
                            <TouchableOpacity onPress={handleDeleteMatch} style={[styles.toolButton, { backgroundColor: colors.surface }]}>
                                <Ionicons name="trash-outline" size={20} color={colors.status.danger} />
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity onPress={handleBalance} style={[styles.toolButton, isMatchFinished && {opacity: 0.5}]}>
                            <Ionicons name="shuffle" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => Share.share({ message: `Maça gel: ${match.location}` })} style={styles.toolButton}>
                            <Ionicons name="share-social-outline" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.infoCard}>
                    <View style={styles.infoRow}>
                        <Ionicons name="cash-outline" size={20} color={colors.primary} />
                        <Text style={styles.infoText}>Kişi Başı: <Text style={{fontWeight:'bold', color: colors.text.primary}}>₺{match.price}</Text></Text>
                    </View>
                    {match.iban ? (
                        <View style={styles.infoRow}>
                            <Ionicons name="card-outline" size={20} color={colors.text.secondary} />
                            <View style={{flex: 1}}>
                                <Text style={styles.infoText} numberOfLines={1} ellipsizeMode='middle'>{match.iban}</Text>
                                <Text style={styles.creatorText}>Organizatör: {creatorName || 'Bilinmiyor'}</Text>
                            </View>
                            <TouchableOpacity onPress={handleCopyIBAN} style={styles.copyButton}>
                                <Ionicons name="copy-outline" size={16} color={colors.background} />
                                <Text style={styles.copyText}>Kopyala</Text>
                            </TouchableOpacity>
                        </View>
                    ) : null}
                </View>

                <View style={styles.fieldContainer}>
                    {/* TAKIM A */}
                    <View style={styles.teamContainer}>
                        <TouchableOpacity style={[styles.teamHeader, { backgroundColor: colorA }]} onPress={() => { setSelectedTeamForColor('A'); setColorPickerVisible(true); }}>
                            <Ionicons name="shirt" size={16} color={colorA === '#FFFFFF' ? '#000' : '#FFF'} />
                            <Text style={[styles.teamTitle, { color: colorA === '#FFFFFF' ? '#000' : '#FFF' }]}>TAKIM A ({match.teamA?.length || 0})</Text>
                        </TouchableOpacity>
                        {match.teamA?.map(p => renderPlayerRow(p, 'A'))}
                        {!isMatchFinished && (
                            <>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleTeamAction('A')}>
                                    <Text style={styles.actionText}>{match.teamA?.some(p => p.id === auth.currentUser?.uid) ? "ÇIK" : "KATIL"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.guestLink} onPress={() => { setTargetTeamForGuest('A'); setGuestModalVisible(true); }}>
                                    <Text style={styles.guestLinkText}>+ Misafir Ekle</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>

                    <View style={styles.centerLine}><View style={styles.line} /><View style={styles.vsBadge}><Text style={styles.vsText}>VS</Text></View><View style={styles.line} /></View>

                    {/* TAKIM B */}
                    <View style={styles.teamContainer}>
                        <TouchableOpacity style={[styles.teamHeader, { backgroundColor: colorB }]} onPress={() => { setSelectedTeamForColor('B'); setColorPickerVisible(true); }}>
                            <Ionicons name="shirt" size={16} color={colorB === '#FFFFFF' ? '#000' : '#FFF'} />
                            <Text style={[styles.teamTitle, { color: colorB === '#FFFFFF' ? '#000' : '#FFF' }]}>TAKIM B ({match.teamB?.length || 0})</Text>
                        </TouchableOpacity>
                        {match.teamB?.map(p => renderPlayerRow(p, 'B'))}
                        {!isMatchFinished && (
                            <>
                                <TouchableOpacity style={styles.actionButton} onPress={() => handleTeamAction('B')}>
                                    <Text style={styles.actionText}>{match.teamB?.some(p => p.id === auth.currentUser?.uid) ? "ÇIK" : "KATIL"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.guestLink} onPress={() => { setTargetTeamForGuest('B'); setGuestModalVisible(true); }}>
                                    <Text style={styles.guestLinkText}>+ Misafir Ekle</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>

                {/* Modallar */}
                <Modal visible={colorPickerVisible} transparent animationType="fade">
                    <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setColorPickerVisible(false)}>
                        <View style={styles.colorPickerContainer}>
                            <Text style={styles.modalTitle}>Forma Rengi Seç</Text>
                            <View style={styles.colorGrid}>
                                {JERSEY_COLORS.map(c => (<TouchableOpacity key={c} style={[styles.colorCircle, { backgroundColor: c }]} onPress={() => handleColorSelect(c)} />))}
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>

                <Modal visible={guestModalVisible} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <View style={[styles.colorPickerContainer, { width: '90%' }]}>
                            <Text style={styles.modalTitle}>Misafir Oyuncu Ekle</Text>
                            <ModernInput icon="person-add-outline" placeholder="İsim (Örn: Ahmet)" value={guestName} onChangeText={setGuestName} />
                            <ModernInput icon="star-outline" placeholder="Puan (1-10)" value={guestRating} onChangeText={setGuestRating} keyboardType="numeric" />
                            <View style={styles.modalActions}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setGuestModalVisible(false)}><Text style={{ color: colors.text.secondary }}>İptal</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.confirmBtn} onPress={handleAddGuest}><Text style={{ color: colors.background, fontWeight: 'bold' }}>Ekle</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Maç Sonu Aksiyonları */}
                {isMatchFinished && (
                    <View style={{ marginTop: 20, paddingBottom: 40 }}>
                        <Text style={{ color: colors.text.secondary, textAlign: 'center', marginBottom: 10 }}>
                            {isMatchCompletedDb ? "Maç tamamlandı." : "Maç süresi doldu, güncelleniyor..."}
                        </Text>

                        {/* PUANLAMA BUTONU (Sadece maçta oynayanlar ve maç işlendiyse veya süre dolduysa) */}
                        {isParticipant ? (
                            <TouchableOpacity style={styles.rateButton} onPress={() => navigation.navigate('RatePlayers', { teamA: match.teamA, teamB: match.teamB })}>
                                <Ionicons name="star" size={20} color="#000" />
                                <Text style={styles.rateButtonText}>OYUNCULARI PUANLA</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={{ color: colors.text.secondary, textAlign: 'center', fontStyle: 'italic', fontSize: 12 }}>
                                Sadece kadrodaki oyuncular puanlama yapabilir.
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </Screen>
    );
}

const styles = StyleSheet.create({
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 10, marginBottom: 15 },
    title: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary, flexWrap: 'wrap' },
    dateInfo: { color: colors.text.secondary, marginTop: 4, fontSize: 14 },
    toolButton: { backgroundColor: colors.surface, padding: 8, borderRadius: 8 },
    infoCard: { backgroundColor: colors.surface, borderRadius: 12, padding: 15, marginBottom: 20 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
    infoText: { color: colors.text.secondary, fontSize: 14, flex: 1 },
    creatorText: { color: colors.primary, fontSize: 12, fontWeight: 'bold', marginTop: 2 },
    copyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.primary, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6, gap: 4 },
    copyText: { color: colors.background, fontSize: 12, fontWeight: 'bold' },
    fieldContainer: { flexDirection: 'row', justifyContent: 'space-between' },
    teamContainer: { width: '46%', backgroundColor: colors.surface, borderRadius: 12, paddingBottom: 10, overflow: 'hidden' },
    teamHeader: { padding: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 5 },
    teamTitle: { fontWeight: 'bold', fontSize: 14 },
    playerRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: colors.border, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    playerText: { color: colors.text.primary, fontSize: 12, flex: 1 },
    ratingBadge: { backgroundColor: colors.background, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    ratingText: { color: colors.status.warning, fontSize: 10, fontWeight: 'bold' },
    actionButton: { margin: 10, padding: 8, borderWidth: 1, borderColor: colors.border, borderRadius: 6, alignItems: 'center', borderStyle: 'dashed' },
    actionText: { color: colors.text.secondary, fontSize: 12, fontWeight: 'bold' },
    guestLink: { alignItems: 'center', marginBottom: 10 },
    guestLinkText: { color: colors.text.secondary, fontSize: 11, textDecorationLine: 'underline' },
    centerLine: { width: '8%', alignItems: 'center', justifyContent: 'center' },
    line: { width: 1, flex: 1, backgroundColor: colors.border },
    vsBadge: { backgroundColor: colors.border, padding: 4, borderRadius: 4, marginVertical: 5 },
    vsText: { fontSize: 10, fontWeight: 'bold', color: colors.text.secondary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
    colorPickerContainer: { backgroundColor: colors.surface, padding: 20, borderRadius: 15, width: '80%', alignItems: 'center' },
    modalTitle: { color: colors.text.primary, marginBottom: 15, fontWeight: 'bold', fontSize: 16 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 15, justifyContent: 'center' },
    colorCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: colors.border },
    modalActions: { flexDirection: 'row', gap: 10, marginTop: 10, width: '100%' },
    cancelBtn: { flex: 1, padding: 15, backgroundColor: colors.surface, borderRadius: 10, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
    confirmBtn: { flex: 1, padding: 15, backgroundColor: colors.primary, borderRadius: 10, alignItems: 'center' },
    finishButton: { backgroundColor: colors.primary, padding: 15, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 10 },
    finishButtonText: { color: colors.background, fontWeight: 'bold', fontSize: 14},
    rateButton: { backgroundColor: colors.status.warning, padding: 15, borderRadius: 10, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 10 },
    rateButtonText: { color: '#000', fontWeight: 'bold', fontSize: 16 }
});