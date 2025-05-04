// GifticonBottomSheet.js
import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import MapGifticonList from './MapGifticonList';

const GifticonBottomSheet = ({ gifticons, onUseGifticon }) => {
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['4%', '25%', '50%'], []);

  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.indicator}
      backgroundStyle={styles.background}
    >
      <View style={styles.contentContainer}>
        <MapGifticonList gifticons={gifticons} onUseGifticon={onUseGifticon} />
      </View>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flex: 1,
    backgroundColor: '#F9F9F9',
  },
  handle: {
    backgroundColor: '#F9F9F9',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingVertical: 10,
  },
  indicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
    height: 4,
  },
  background: {
    backgroundColor: 'white',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
});

export default GifticonBottomSheet;
