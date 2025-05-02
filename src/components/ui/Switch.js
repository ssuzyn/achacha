import React from 'react';
import { Switch as RNESwitch } from 'react-native-elements';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-elements';

/**
 * 스위치 컴포넌트
 */
export const Switch = ({
  value,
  onValueChange,
  disabled = false,
  trackColor,
  thumbColor,
  ios_backgroundColor,
  label,
  labelPosition = 'left', // left, right, top, bottom
  size = 'md', // sm, md, lg
  style,
  labelStyle,
  containerStyle,
  ...props
}) => {
  const { theme } = useTheme();

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
      ? theme.colors.grey1
      : thumbColor?.true || theme.colors.white
    : disabled
      ? theme.colors.grey1
      : thumbColor?.false || theme.colors.white;

  // 현재 상태에 따른 트랙 색상 결정
  const currentTrackColor = {
    false: disabled ? theme.colors.grey1 : trackColor?.false || theme.colors.grey2,
    true: disabled ? theme.colors.grey3 : trackColor?.true || theme.colors.primary,
  };

  const currentIosBackgroundColor = ios_backgroundColor || theme.colors.grey2;

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

      <RNESwitch
        value={value}
        onValueChange={disabled ? undefined : onValueChange}
        disabled={disabled}
        trackColor={currentTrackColor}
        thumbColor={currentThumbColor}
        ios_backgroundColor={currentIosBackgroundColor}
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
    marginHorizontal: 8,
  },
  verticalLabel: {
    marginVertical: 4,
    marginHorizontal: 0,
  },
});

export default Switch;
