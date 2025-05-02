import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-elements';

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
  const { theme } = useTheme();

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

  // 색상 객체 생성
  const colors = {
    primary: theme.colors.secondary,
    secondary: theme.colors.primary,
    disabled: theme.colors.disabled,
    text: theme.colors.white,
    textDisabled: theme.colors.grey4,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      style={[
        buttonStyle,
        // variant에 따른 색상 설정 적용
        variant === 'primary' && { backgroundColor: colors.primary },
        variant === 'secondary' && { backgroundColor: colors.secondary },
        variant === 'outline' && { borderColor: colors.primary },
        isDisabled && { backgroundColor: colors.disabled, borderColor: 'transparent' },
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' || variant === 'link'
              ? colors.primary
              : colors.text
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              buttonTextStyle,
              variant === 'primary' && { color: colors.text },
              variant === 'secondary' && { color: colors.text },
              variant === 'outline' && { color: colors.primary },
              variant === 'ghost' && { color: colors.primary },
              variant === 'link' && { color: colors.primary },
              isDisabled && { color: colors.textDisabled },
            ]}
          >
            {title}
          </Text>
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
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  secondary: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    // 테마 적용으로 인해 색상 제거, 직접 설정
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
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  secondaryText: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  outlineText: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  ghostText: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  linkText: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
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
    // 테마 적용으로 인해 색상 제거, 직접 설정
  },
  disabledText: {
    // 테마 적용으로 인해 색상 제거, 직접 설정
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
