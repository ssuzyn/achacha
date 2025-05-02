import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

/**
 * 기본 버튼 컴포넌트
 */
export const Button = ({
  onPress,
  title,
  variant = 'primary', // primary, secondary, outline, ghost, link
  size = 'md', // sm, md, lg
  isDisabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  style,
  textStyle,
  ...props
}) => {
  // 버튼 스타일 가져오기
  const buttonStyle = [
    styles.button,
    styles[variant],
    styles[`${size}Size`],
    isDisabled && styles.disabled,
    style,
  ];

  // 텍스트 스타일 가져오기
  const buttonTextStyle = [
    styles.text,
    styles[`${variant}Text`],
    styles[`${size}Text`],
    isDisabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      style={buttonStyle}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' || variant === 'link' ? '#278CCC' : 'white'
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text style={buttonTextStyle}>{title}</Text>
          {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 버튼 변형
  primary: {
    backgroundColor: '#278CCC',
  },
  secondary: {
    backgroundColor: '#56AEE9',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#278CCC',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  link: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 0,
  },
  // 버튼 사이즈
  smSize: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  mdSize: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  lgSize: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  // 텍스트 스타일
  text: {
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#FFFFFF',
  },
  outlineText: {
    color: '#278CCC',
  },
  ghostText: {
    color: '#278CCC',
  },
  linkText: {
    color: '#278CCC',
    textDecorationLine: 'underline',
  },
  // 텍스트 사이즈
  smText: {
    fontSize: 12,
  },
  mdText: {
    fontSize: 14,
  },
  lgText: {
    fontSize: 16,
  },
  // 비활성화 스타일
  disabled: {
    backgroundColor: '#E5E5E5',
    borderColor: 'transparent',
  },
  disabledText: {
    color: '#999999',
  },
  // 아이콘 스타일
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});

export default Button;
