import React from 'react';
import { SafeAreaView, StyleSheet, View, Platform, StatusBar } from 'react-native';
import { colors } from '../../theme/colors';

export default function Screen({ children, style }) {
  return (
    <SafeAreaView style={[styles.screen, style]}>
      {/* Android için üst bar boşluğu ekle, iOS bunu otomatik halleder */}
      <View style={[styles.view, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    flex: 1,
    backgroundColor: colors.background, // Tüm ekranların zemin rengi
  },
  view: {
    flex: 1,
    paddingHorizontal: 20, // Kenarlardan genel boşluk
  },
});