import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GameProvider, useGame } from './context/GameContext';
import { AppNavigator } from './navigation/AppNavigator';

function AppContent() {
  const { isLoaded } = useGame();

  if (!isLoaded) {
    // Delay rendering until user progress is successfully loaded from AsyncStorage
    return null;
  }

  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}
