import React from 'react';
import { StatusBar } from 'expo-status-bar';
import RootNavigator from './src/navigation/RootNavigator';
import Toast from 'react-native-toast-message'; // İçe aktar
import { toastConfig } from './src/components/common/ToastConfig'; // Config dosyamız

export default function App() {
  return (
    <>
      <StatusBar style="light" />
      <RootNavigator />
      <Toast config={toastConfig} />
    </>
  );
}