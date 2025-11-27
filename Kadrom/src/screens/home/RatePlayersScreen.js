import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen';
import { colors } from '../../theme/colors';
import { auth } from '../../config/firebaseConfig';
import { submitBatchRatings } from '../../services/ratingService';

export default function RatePlayersScreen({ route, navigation }) {
  const { teamA, teamB } = route.params; // Maç detayından gelen oyuncu listeleri
  const currentUserId = auth.currentUser.uid;

  // Kendimiz hariç tüm oyuncuları tek listede topla
  const allPlayers = [...(teamA || []), ...(teamB || [])].filter(p => p.id !== currentUserId);

  // State: { 'userId1': 7, 'userId2': 8 } şeklinde puanları tutar
  const [ratings, setRatings] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Puan Değiştirme Helper
  const changeScore = (userId, change) => {
    setRatings(prev => {
        const currentScore = prev[userId] || 5; // Varsayılan 5 başlar
        let newScore = currentScore + change;
        if (newScore > 10) newScore = 10;
        if (newScore < 1) newScore = 1;
        return { ...prev, [userId]: newScore };
    });
  };

  const handleSubmit = async () => {
    // Sadece puanı değiştirilmiş olanları veya hepsini (varsayılan 5 ile) gönderebiliriz.
    // UX Kararı: Sadece puanladıklarını gönderelim.
    const ratingsToSend = Object.keys(ratings).map(userId => ({
        userId,
        score: ratings[userId]
    }));

    if (ratingsToSend.length === 0) {
        Alert.alert("Uyarı", "Kimseye puan vermediniz.");
        return;
    }

    setSubmitting(true);
    try {
        await submitBatchRatings(ratingsToSend);
        Alert.alert("Teşekkürler", "Puanlar kaydedildi!", [
            { text: "Tamam", onPress: () => navigation.popToTop() } // Ana sayfaya dön
        ]);
    } catch (error) {
        Alert.alert("Hata", "Puanlar gönderilemedi.");
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Maçın Adamlarını Seç</Text>
        <Text style={styles.subtitle}>Performanslara göre 1-10 arası puan ver.</Text>

        {allPlayers.map((player) => {
            const score = ratings[player.id] || 5; // Henüz puan verilmediyse 5 göster
            
            // Puana göre renk değişimi (Görsel Zenginlik)
            let scoreColor = colors.text.secondary;
            if (score >= 8) scoreColor = '#FFD700'; // Altın
            else if (score >= 6) scoreColor = colors.primary; // Yeşil
            else if (score <= 4) scoreColor = colors.status.danger; // Kırmızı

            return (
                <View key={player.id} style={styles.playerRow}>
                    <View style={styles.playerInfo}>
                        <Ionicons name="person-circle-outline" size={40} color={colors.text.secondary} />
                        <View style={{marginLeft: 10}}>
                            <Text style={styles.name}>{player.fullName}</Text>
                            <Text style={styles.position}>{player.position}</Text>
                        </View>
                    </View>

                    <View style={styles.ratingControl}>
                        <TouchableOpacity onPress={() => changeScore(player.id, -1)} style={styles.btn}>
                            <Ionicons name="remove" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                        
                        <View style={[styles.scoreBox, { borderColor: scoreColor }]}>
                            <Text style={[styles.scoreText, { color: scoreColor }]}>{score}</Text>
                        </View>

                        <TouchableOpacity onPress={() => changeScore(player.id, 1)} style={styles.btn}>
                            <Ionicons name="add" size={20} color={colors.text.primary} />
                        </TouchableOpacity>
                    </View>
                </View>
            );
        })}

        <TouchableOpacity 
            style={[styles.submitButton, { opacity: submitting ? 0.7 : 1 }]} 
            onPress={handleSubmit}
            disabled={submitting}
        >
            <Text style={styles.submitText}>{submitting ? "KAYDEDİLİYOR..." : "PUANLARI KAYDET"}</Text>
        </TouchableOpacity>

      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 5,
    marginTop: 10
  },
  subtitle: {
    color: colors.text.secondary,
    marginBottom: 20
  },
  playerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 12,
    marginBottom: 10
  },
  playerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  name: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 16
  },
  position: {
    color: colors.text.secondary,
    fontSize: 12
  },
  ratingControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  btn: {
    backgroundColor: colors.background,
    padding: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border
  },
  scoreBox: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 2,
    backgroundColor: colors.background
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  submitButton: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 50,
    alignItems: 'center'
  },
  submitText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: 16
  }
});