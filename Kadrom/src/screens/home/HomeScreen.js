import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Screen from '../../components/common/Screen'; // Screen bileşenimizi kullanıyoruz
import { colors } from '../../theme/colors';
import { getMatchesByStatus } from '../../services/matchService'; // Yeni fonksiyon
import MatchCard from '../../components/cards/MatchCard';

export default function HomeScreen({ navigation }) {
  const [matches, setMatches] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' veya 'past'

  const fetchMatches = async () => {
    setRefreshing(true);
    try {
      // Seçili sekmeye göre veri çek
      const data = await getMatchesByStatus(activeTab);
      setMatches(data);
    } catch (error) {
      console.log(error);
    } finally {
      setRefreshing(false);
    }
  };

  // Sekme değiştiğinde veya sayfa odaklandığında çalışır
  useFocusEffect(
    useCallback(() => {
      fetchMatches();
    }, [activeTab]) // activeTab değişince tetikle
  );

  // Sekme Butonu Bileşeni (Local Component)
  const TabButton = ({ title, value }) => {
    const isActive = activeTab === value;
    return (
      <TouchableOpacity 
        style={[styles.tabButton, isActive && styles.activeTabButton]}
        onPress={() => setActiveTab(value)}
      >
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>
            {title}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <Screen>
      {/* Üst Başlık ve Switch */}
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Maçlar</Text>
        
        {/* Switch Container */}
        <View style={styles.switchContainer}>
            <TabButton title="Gelecek" value="upcoming" />
            <TabButton title="Geçmiş" value="past" />
        </View>
      </View>

      {/* Liste */}
      <FlatList
        data={matches}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MatchCard 
            match={item} 
            // Geçmiş maçlar için biraz daha soluk opacity verebiliriz
            style={{ opacity: activeTab === 'past' ? 0.7 : 1 }}
            onPress={() => navigation.navigate('MatchDetail', { matchId: item.id })} 
          />
        )}
        refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={fetchMatches} tintColor={colors.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="football-outline" size={50} color={colors.text.secondary} style={{opacity: 0.5}} />
            <Text style={styles.emptyText}>
              {activeTab === 'upcoming' 
                ? "Yakınlarda planlanmış maç yok." 
                : "Henüz oynanmış maç bulunmuyor."}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      />

      {/* Yeni Maç Ekle Butonu (Sadece Gelecek sekmesinde veya her zaman görünebilir) */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreateMatch')}
      >
        <Ionicons name="add" size={32} color={colors.background} />
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    marginBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.text.secondary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  activeTabText: {
    color: colors.background, // Aktifken yazı rengi koyu olsun (zemin yeşil)
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: colors.text.secondary,
    marginTop: 10,
    textAlign: 'center'
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: colors.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5
  }
});