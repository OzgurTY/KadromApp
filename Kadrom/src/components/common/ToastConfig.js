import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { colors } from '../../theme/colors';
import { Ionicons } from '@expo/vector-icons';

/*
  Toast mesajlarının tasarımını burada yapıyoruz.
  Uygulamanın geri kalanıyla bütünlük sağlaması için
  colors.surface ve colors.primary kullanacağız.
*/

export const toastConfig = {
  // 1. BAŞARILI İŞLEM (SUCCESS)
  success: (props) => (
    <View style={[styles.container, { borderLeftColor: colors.primary }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  ),

  // 2. HATALI İŞLEM (ERROR)
  error: (props) => (
    <View style={[styles.container, { borderLeftColor: colors.status.danger }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="alert-circle" size={24} color={colors.status.danger} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  ),

  // 3. BİLGİLENDİRME (INFO)
  info: (props) => (
    <View style={[styles.container, { borderLeftColor: colors.status.warning }]}>
      <View style={styles.iconContainer}>
        <Ionicons name="information-circle" size={24} color={colors.status.warning} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{props.text1}</Text>
        <Text style={styles.message}>{props.text2}</Text>
      </View>
    </View>
  )
};

const styles = StyleSheet.create({
  container: {
    height: 70,
    width: '90%',
    backgroundColor: colors.surface, // Koyu gri zemin
    borderRadius: 12,
    borderLeftWidth: 6, // Soldaki renkli çizgi
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    paddingHorizontal: 15
  },
  iconContainer: {
    marginRight: 15
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  title: {
    color: colors.text.primary,
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 2
  },
  message: {
    color: colors.text.secondary,
    fontSize: 13
  }
});