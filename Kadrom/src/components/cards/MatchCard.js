import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const MatchCard = ({ match, onPress, style }) => {
  const matchDate = new Date(match.date);
  
  // Tarihi formatla (Örn: 24 Kasım)
  const day = matchDate.getDate();
  const month = matchDate.toLocaleString('tr-TR', { month: 'long' });
  const time = matchDate.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  return (
    <TouchableOpacity style={[styles.container, style]} onPress={onPress}>
      {/* Sol taraf: Tarih Kutusu */}
      <View style={styles.dateBox}>
        <Text style={styles.dayText}>{day}</Text>
        <Text style={styles.monthText}>{month.slice(0,3).toUpperCase()}</Text>
      </View>

      {/* Orta taraf: Bilgiler */}
      <View style={styles.infoBox}>
        <Text style={styles.locationText}>{match.location}</Text>
        <View style={styles.row}>
            <Ionicons name="time-outline" size={14} color={colors.primary} />
            <Text style={styles.timeText}> {time}</Text>
        </View>
      </View>

      {/* Sağ taraf: Fiyat ve Durum */}
      <View style={styles.priceBox}>
        <Text style={styles.priceText}>₺{match.price}</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.text.secondary} />
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 15,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dateBox: {
    backgroundColor: colors.background,
    padding: 10,
    borderRadius: 10,
    alignItems: 'center',
    minWidth: 60,
  },
  dayText: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: 'bold',
  },
  monthText: {
    color: colors.text.secondary,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoBox: {
    flex: 1,
    marginLeft: 15,
  },
  locationText: {
    color: colors.text.primary,
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    color: colors.text.secondary,
    fontSize: 14,
  },
  priceBox: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  priceText: {
    color: colors.status.success, // Para rengi
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 5,
  }
});

export default MatchCard;