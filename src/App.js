import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'react-native';
import { TabBarProvider } from './context/TabBarContext';
import { HeaderBarProvider } from './context/HeaderBarContext';
import AppNavigator from './navigation/AppNavigator';
import { config, GluestackUIProviderWrapper } from './components/ui/gluestack-ui-provider';

const App = () => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={config.light['--color-background']} />
      <GluestackUIProviderWrapper colorMode="light">
        <HeaderBarProvider>
          <TabBarProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </TabBarProvider>
        </HeaderBarProvider>
      </GluestackUIProviderWrapper>
    </SafeAreaProvider>
  );
};

export default App;
