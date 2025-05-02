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

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled || isLoading}
      style={[
        buttonStyle,
        // variant에 따른 색상 설정 적용
        variant === 'primary' && { backgroundColor: theme.colors.secondary },
        variant === 'secondary' && { backgroundColor: theme.colors.primary },
        variant === 'outline' && { borderColor: theme.colors.primary },
        isDisabled && { backgroundColor: theme.colors.disabled },
        isDisabled && { borderColor: theme.colors.transparent },
      ]}
      activeOpacity={0.7}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          size="small"
          color={
            variant === 'outline' || variant === 'ghost' || variant === 'link'
              ? theme.colors.primary
              : theme.colors.white
          }
        />
      ) : (
        <View style={styles.contentContainer}>
          {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
          <Text
            style={[
              buttonTextStyle,
              variant === 'primary' && { color: theme.colors.white },
              variant === 'secondary' && { color: theme.colors.white },
              variant === 'outline' && { color: theme.colors.primary },
              variant === 'ghost' && { color: theme.colors.primary },
              variant === 'link' && { color: theme.colors.primary },
              isDisabled && { color: theme.colors.grey4 },
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
  // 텍스트 스타일
  text: {
    fontWeight: '600',
    textAlign: 'center',
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
