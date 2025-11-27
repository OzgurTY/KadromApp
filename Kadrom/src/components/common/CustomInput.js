import React from 'react';
import { TextInput, StyleSheet, View } from 'react-native';
import { colors } from '../../theme/colors';

const CustomInput = ({ placeholder, value, onChangeText, secureTextEntry }) => {
  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor={colors.text.secondary}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  input: {
    backgroundColor: colors.surface,
    padding: 15,
    borderRadius: 10,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
  },
});

export default CustomInput;