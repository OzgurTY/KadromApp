import { StyleSheet } from 'react-native';
import { colors } from './colors';

export const globalStyles = StyleSheet.create({
  // Container'ı sildik veya boş bıraktık çünkü artık Screen bileşeni kullanacağız.
  // Ama geriye dönük uyumluluk için sadece flex bırakabiliriz.
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 28, // Başlıkları biraz daha büyüttük
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 20,
    marginTop: 10, // Başlık üstüne hafif boşluk
  }
});