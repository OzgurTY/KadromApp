import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen';
import { colors } from '../../theme/colors';
import { getLeaderboard } from '../../services/userService';
import { useFocusEffect } from '@react-navigation/native';

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Sayfaya her gelindiğinde güncellensin
  useFocusEffect(
    React.useCallback(() => {
        const loadData = async () => {
            const data = await getLeaderboard();
            setPlayers(data);
            setLoading(false);
        };
        loadData();
    }, [])
  );

  const getRankStyle = (index) => {
      switch(index) {
          case 0: return { color: '#FFD700', icon: 'trophy', size: 30 }; // Altın
          case 1: return { color: '#C0C0C0', icon: 'medal', size: 26 }; // Gümüş
          case 2: return { color: '#CD7F32', icon: 'medal', size: 24 }; // Bronz
          default: return { color: colors.text.secondary, icon: null, size: 16 };
      }
  };

  const renderItem = ({ item, index }) => {
      const rank = getRankStyle(index);
      
      return (
          <View style={[styles.row, index < 3 && styles.topThreeRow]}>
              {/* Sıralama / Rank */}
              <View style={styles.rankContainer}>
                  {rank.icon ? (
                      <Ionicons name={rank.icon} size={rank.size} color={rank.color} />
                  ) : (
                      <Text style={styles.rankText}>{index + 1}</Text>
                  )}
              </View>

              {/* İsim ve Bilgi */}
              <View style={styles.infoContainer}>
                  <Text style={[styles.name, index === 0 && {fontSize: 18}]}>
                      {item.fullName}
                  </Text>
                  <Text style={styles.subText}>{item.matchCount} Maç • {item.position || 'Belirsiz'}</Text>
              </View>

              {/* Puan */}
              <View style={styles.ratingContainer}>
                  <Text style={[styles.rating, { color: rank.color === colors.text.secondary ? colors.primary : rank.color }]}>
                      {item.rating.toFixed(1)}
                  </Text>
              </View>
          </View>
      );
  };

  if (loading) return <Screen><ActivityIndicator color={colors.primary} style={{marginTop:50}}/></Screen>;

  return (
    <Screen>
        <View style={styles.header}>
            <Text style={globalStyles.title}>Liderlik Tablosu</Text>
            <Text style={styles.subtitle}>En az 3 maça çıkan efsaneler.</Text>
        </View>

        <FlatList
            data={players}
            keyExtractor={item => item.id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 50 }}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <Text style={{color: colors.text.secondary, textAlign:'center', marginTop: 50}}>
                    Henüz yeterli veri yok.
                </Text>
            }
        />
    </Screen>
  );
}

const globalStyles = { title: { fontSize: 28, fontWeight: 'bold', color: colors.text.primary } };

const styles = StyleSheet.create({
  header: {
      marginBottom: 20
  },
  subtitle: {
      color: colors.text.secondary,
      marginTop: 5
  },
  row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      marginBottom: 10,
      padding: 15,
      borderRadius: 12,
  },
  topThreeRow: {
      borderWidth: 1,
      borderColor: colors.border,
      paddingVertical: 20
  },
  rankContainer: {
      width: 40,
      alignItems: 'center',
      justifyContent: 'center'
  },
  rankText: {
      color: colors.text.secondary,
      fontWeight: 'bold',
      fontSize: 16
  },
  infoContainer: {
      flex: 1,
      marginLeft: 15
  },
  name: {
      color: colors.text.primary,
      fontWeight: 'bold',
      fontSize: 16
  },
  subText: {
      color: colors.text.secondary,
      fontSize: 12,
      marginTop: 2
  },
  ratingContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: 50
  },
  rating: {
      fontSize: 20,
      fontWeight: 'bold'
  }
});