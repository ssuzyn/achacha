import React from 'react';
import { Switch as RNESwitch } from 'react-native-elements';
import { View, Text, StyleSheet } from 'react-native';

/**
 * 스위치 컴포넌트
 */
export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  trackColor = { false: '#D3D3D3', true: '#278CCC' },
  thumbColor = { false: '#FFFFFF', true: '#FFFFFF' },
  ios_backgroundColor = '#D3D3D3',
  label,
  labelPosition = 'left', // left, right, top, bottom
  size = 'md', // sm, md, lg
  style,
  labelStyle,
  containerStyle,
  ...props
}) => {
  // 사이즈에 따른 스타일 결정
  const getSizeStyle = () => {
    switch (size) {
      case 'sm':
        return {
          transform: [{ scale: 0.8 }],
        };
      case 'lg':
        return {
          transform: [{ scale: 1.2 }],
        };
      case 'md':
      default:
        return {
          transform: [{ scale: 1 }],
        };
    }
  };

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

  // 현재 상태에 따른 썸 색상 결정
  const currentThumbColor = value
    ? disabled
      ? '#E5E5E5'
      : thumbColor.true
    : disabled
      ? '#E5E5E5'
      : thumbColor.false;

  // 현재 상태에 따른 트랙 색상 결정
  const currentTrackColor = {
    false: disabled ? '#F0F0F0' : trackColor.false,
    true: disabled ? '#AAAAAA' : trackColor.true,
  };

  return (
    <View style={[getContainerStyle(), containerStyle]}>
      {label && (
        <Text
          style={[
            styles.label,
            disabled && styles.disabledLabel,
            ['top', 'bottom'].includes(labelPosition) && styles.verticalLabel,
            labelStyle,
          ]}
        >
          {label}
        </Text>
      )}

      <RNESwitch
        value={value}
        onValueChange={disabled ? undefined : onValueChange}
        disabled={disabled}
        trackColor={currentTrackColor}
        thumbColor={currentThumbColor}
        ios_backgroundColor={ios_backgroundColor}
        style={[getSizeStyle(), style]}
        {...props}
      />
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
    color: '#333333',
    marginHorizontal: 8,
  },
  disabledLabel: {
    color: '#999999',
  },
  verticalLabel: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
});

export default Switch;
