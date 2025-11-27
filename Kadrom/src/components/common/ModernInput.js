import React, { useState } from 'react';
import { View, TextInput, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

const ModernInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={[
      styles.container, 
      { borderColor: isFocused ? colors.primary : 'transparent' } // Odaklanınca yeşil çerçeve
    ]}>
      {/* Sol taraftaki İkon */}
      <Ionicons 
        name={icon} 
        size={20} 
        color={isFocused ? colors.primary : colors.text.secondary} 
        style={styles.icon}
      />
      
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 14,
    marginBottom: 15,
    borderWidth: 1,
    // Hafif gölge
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: colors.text.primary,
    fontSize: 16,
  },
});

export default ModernInput;