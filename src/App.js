import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { TabBarProvider } from './context/TabBarContext';
import { HeaderBarProvider } from './context/HeaderBarContext';
import AppNavigator from './navigation/AppNavigator';
import theme from './theme';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={theme.colors.background} />
      <HeaderBarProvider>
        <TabBarProvider>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </TabBarProvider>
      </HeaderBarProvider>
    </SafeAreaProvider>
  );
};

export default App;
