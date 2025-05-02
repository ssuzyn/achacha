import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from 'react-native-elements';

/**
 * 기본 입력 컴포넌트
 */
export const Input = ({
  value,
  onChangeText,
  placeholder,
  label,
  helperText,
  errorText,
  isInvalid = false,
  isDisabled = false,
  isRequired = false,
  secureTextEntry = false,
  keyboardType = 'default',
  leftIcon,
  rightIcon,
  size = 'md', // sm, md, lg
  variant = 'outline', // outline, filled, underlined
  style,
  inputStyle,
  labelStyle,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(!secureTextEntry);
  const { theme } = useTheme();

  const colors = {
    border: theme.colors.grey3,
    borderFocused: theme.colors.primary,
    borderInvalid: theme.colors.error,
    background: theme.colors.white,
    backgroundFilled: theme.colors.grey0,
    backgroundDisabled: theme.colors.grey1,
    text: theme.colors.black,
    textDisabled: theme.colors.grey4,
    placeholder: theme.colors.grey4,
    icon: theme.colors.grey5,
    required: theme.colors.error,
    helperText: theme.colors.grey5,
    errorText: theme.colors.error,
  };

  // 입력창 스타일 가져오기
  const containerStyle = [
    styles.container,
    styles[variant],
    styles[`${size}Container`],
    {
      borderColor: isInvalid
        ? colors.borderInvalid
        : isFocused
          ? colors.borderFocused
          : colors.border,
      backgroundColor:
        variant === 'filled'
          ? colors.backgroundFilled
          : isDisabled
            ? colors.backgroundDisabled
            : colors.background,
    },
    style,
  ];

  // 입력 필드 스타일
  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    { color: isDisabled ? colors.textDisabled : colors.text },
    leftIcon && styles.inputWithLeftIcon,
    rightIcon && styles.inputWithRightIcon,
    inputStyle,
  ];

  // 아이콘 및 비밀번호 토글 버튼 처리
  const renderRightElement = () => {
    if (secureTextEntry) {
      return (
        <TouchableOpacity
          onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          style={styles.iconContainer}
        >
          <Icon
            name={isPasswordVisible ? 'visibility' : 'visibility-off'}
            size={20}
            color={colors.icon}
          />
        </TouchableOpacity>
      );
    }

    if (rightIcon) {
      return <View style={styles.iconContainer}>{rightIcon}</View>;
    }

    return null;
  };

  return (
    <View style={styles.wrapper}>
      {label && (
        <Text style={[styles.label, { color: colors.text }, labelStyle]}>
          {label}
          {isRequired && <Text style={[styles.required, { color: colors.required }]}> *</Text>}
        </Text>
      )}

      <View style={containerStyle}>
        {leftIcon && <View style={styles.iconContainer}>{leftIcon}</View>}

        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          keyboardType={keyboardType}
          style={textInputStyle}
          editable={!isDisabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholderTextColor={colors.placeholder}
          {...props}
        />

        {renderRightElement()}
      </View>

      {(helperText || errorText) && (
        <Text
          style={[styles.helperText, { color: isInvalid ? colors.errorText : colors.helperText }]}
        >
          {isInvalid ? errorText : helperText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    marginBottom: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
  },
  // 변형 스타일
  outline: {
    borderRadius: 8,
  },
  filled: {
    borderRadius: 8,
  },
  underlined: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
  // 크기 스타일
  smContainer: {
    height: 32,
  },
  mdContainer: {
    height: 40,
  },
  lgContainer: {
    height: 48,
  },
  // 입력 필드 스타일
  input: {
    flex: 1,
    paddingHorizontal: 12,
  },
  smInput: {
    fontSize: 12,
  },
  mdInput: {
    fontSize: 14,
  },
  lgInput: {
    fontSize: 16,
  },
  inputWithLeftIcon: {
    paddingLeft: 8,
  },
  inputWithRightIcon: {
    paddingRight: 8,
  },
  // 레이블 스타일
  label: {
    marginBottom: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    // 색상은 테마에서 적용
  },
  // 헬퍼 텍스트 스타일
  helperText: {
    fontSize: 12,
    marginTop: 4,
  },
  // 아이콘 컨테이너
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;
