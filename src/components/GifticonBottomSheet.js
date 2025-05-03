import React, { useCallback, useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import MapGifticonList from './MapGifticonList';

const GifticonBottomSheet = ({ gifticons, onUseGifticon }) => {
  // ref
  const bottomSheetRef = useRef(null);
  // 스냅 포인트 설정 (화면 높이의 비율)
  const snapPoints = useMemo(() => ['17%', '50%', '85%'], []);

  // 콜백
  const handleSheetChanges = useCallback(index => {
    console.log('handleSheetChanges', index);
  }, []);

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      snapPoints={snapPoints}
      onChange={handleSheetChanges}
      handleStyle={styles.handle}
      handleIndicatorStyle={styles.indicator}
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
  },
  handle: {
    backgroundColor: 'white',
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    paddingVertical: 10,
  },
  indicator: {
    backgroundColor: '#CCCCCC',
    width: 40,
    height: 4,
  },
});

export default GifticonBottomSheet;
