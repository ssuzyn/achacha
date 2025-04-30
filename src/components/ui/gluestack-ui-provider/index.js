import React from 'react';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { config } from './config';

export function GluestackUIProviderWrapper({ children, colorMode = 'light' }) {
  return (
    <GluestackUIProvider config={config.theme} colorMode={colorMode}>
      {children}
    </GluestackUIProvider>
  );
}

export { config };
