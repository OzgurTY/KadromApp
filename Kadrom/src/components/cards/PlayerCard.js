import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const PlayerCard = ({ player }) => {
  // Puan rengini belirle (Yüksek puan altın, düşük bronz gibi düşünülebilir, şimdilik tema rengi)
  const ratingColor = player.rating >= 8.0 ? '#FFD700' : colors.primary;

  return (
    <View style={styles.cardContainer}>
      {/* Kartın Arkaplanı - Hafif Gradient */}
      <LinearGradient
        colors={[colors.surface, '#1a1a1a']}
        style={styles.cardBackground}
      >
        {/* Üst Kısım: Puan ve Pozisyon */}
        <View style={styles.header}>
          <View style={styles.ratingContainer}>
            <Text style={[styles.rating, { color: ratingColor }]}>{player.rating.toFixed(1)}</Text>
            <Text style={styles.ratingLabel}>GEN</Text>
          </View>
          
          <View style={styles.positionContainer}>
            <Text style={styles.position}>{player.position?.toUpperCase().slice(0, 3)}</Text>
            <Ionicons name="shirt-outline" size={24} color={colors.text.secondary} />
          </View>
        </View>

        {/* Orta Kısım: Avatar (İkon) */}
        <View style={styles.avatarContainer}>
            <Ionicons name="person" size={80} color={colors.text.secondary} />
        </View>

        {/* Alt Kısım: İsim ve Detaylar */}
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{player.fullName}</Text>
          
          <View style={styles.divider} />
          
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>AYAK</Text>
              <Text style={styles.statValue}>{player.preferredFoot}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>MAÇ</Text>
              <Text style={styles.statValue}>{player.matchCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>YAŞ</Text>
              <Text style={styles.statValue}>{player.age}</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    width: '100%',
    aspectRatio: 0.7, // Futbolcu kartı oranı
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10, // Android gölgesi
    marginBottom: 20,
  },
  cardBackground: {
    flex: 1,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rating: {
    fontSize: 42,
    fontWeight: 'bold',
  },
  ratingLabel: {
    color: colors.text.secondary,
    fontSize: 12,
    textAlign: 'center',
    marginTop: -5
  },
  position: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    textAlign: 'right'
  },
  avatarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  infoContainer: {
    alignItems: 'center',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 10,
    textTransform: 'uppercase'
  },
  divider: {
    width: '80%',
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: colors.text.secondary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  statValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  }
});

export default PlayerCard;