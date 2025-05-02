import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { useTheme } from 'react-native-elements';

/**
 * 커스텀 스위치 컴포넌트
 */
export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  label,
  labelPosition = 'left', // left, right, top, bottom
  size = 'md', // sm, md, lg
  style,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const { theme } = useTheme();
  const translateX = React.useRef(new Animated.Value(value ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: value ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [value, translateX]);

  // 사이즈에 따른 스타일 결정
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          width: 44,
          height: 24,
          borderRadius: 12,
          thumbSize: 18,
        };
      case 'lg':
        return {
          width: 60,
          height: 32,
          borderRadius: 16,
          thumbSize: 26,
        };
      case 'md':
      default:
        return {
          width: 52,
          height: 28,
          borderRadius: 14,
          thumbSize: 22,
        };
    }
  };

  const sizeStyle = getSizeStyle();

  // 레이블 위치에 따른 컨테이너 스타일 결정
  const getContainerStyle = () => {
    switch (labelPosition) {
      case 'right':
        return styles.containerRow;
      case 'top':
        return styles.containerColumnReverse;
      case 'bottom':
        return styles.containerColumn;
      case 'left':
      default:
        return styles.containerRowReverse;
    }
  };

  // 트랙 색상 계산
  const currentTrackColor = value
    ? trackColor?.true || '#e3f2fd' // 활성화 시 연한 파란색 배경
    : trackColor?.false || '#ffffff'; // 비활성화 시 흰색 배경

  // 트랙 테두리 색상
  const trackBorderColor = value
    ? 'transparent' // 활성화 시 테두리 없음
    : '#64b5f6'; // 비활성화 시 하늘색 테두리

  // 썸 색상 계산
  const currentThumbColor = value
    ? thumbColor?.true || '#2196f3' // 활성화 시 진한 파란색
    : thumbColor?.false || '#64b5f6'; // 비활성화 시 하늘색

  // 썸의 위치 계산
  const translateXInterpolate = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: [4, sizeStyle.width - sizeStyle.thumbSize - 4],
  });

  // 스위치 상태 변경 핸들러
  const handleToggle = () => {
    if (!disabled && onValueChange) {
      onValueChange(!value);
    }
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            { color: disabled ? theme.colors.grey4 : theme.colors.black },
            ['top', 'bottom'].includes(labelPosition) && styles.verticalLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handleToggle}
        disabled={disabled}
        style={[style]}
      >
        <View
          style={[
            styles.track,
            {
              width: sizeStyle.width,
              height: sizeStyle.height,
              borderRadius: sizeStyle.borderRadius,
              backgroundColor: currentTrackColor,
              borderColor: trackBorderColor,
              borderWidth: value ? 0 : 1,
            },
            disabled && styles.disabledTrack,
          ]}
        >
          <Animated.View
            style={[
              styles.thumb,
              {
                width: sizeStyle.thumbSize,
                height: sizeStyle.thumbSize,
                borderRadius: sizeStyle.thumbSize / 2,
                backgroundColor: currentThumbColor,
                transform: [{ translateX: translateXInterpolate }],
              },
              disabled && styles.disabledThumb,
            ]}
          />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  containerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerRowReverse: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  containerColumn: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  containerColumnReverse: {
    flexDirection: 'column-reverse',
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 14,
    marginHorizontal: 8,
  },
  verticalLabel: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
  track: {
    justifyContent: 'center',
  },
  thumb: {
    position: 'absolute',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  disabledTrack: {
    opacity: 0.8,
  },
  disabledThumb: {
    opacity: 0.8,
  },
});

export default Switch;
