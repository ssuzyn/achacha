import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  // 입력창 스타일 가져오기
  const containerStyle = [
    styles.container,
    styles[variant],
    styles[`${size}Container`],
    isFocused && styles.focused,
    isInvalid && styles.invalid,
    isDisabled && styles.disabled,
    style,
  ];

  // 입력 필드 스타일
  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    isDisabled && styles.disabledText,
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
          <Icon name={isPasswordVisible ? 'visibility' : 'visibility-off'} size={20} color="#666" />
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
        <Text style={[styles.label, labelStyle]}>
          {label}
          {isRequired && <Text style={styles.required}> *</Text>}
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
          placeholderTextColor="#999999"
          {...props}
        />

        {renderRightElement()}
      </View>

      {(helperText || errorText) && (
        <Text style={[styles.helperText, isInvalid && styles.errorText]}>
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
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
  },
  // 변형 스타일
  outline: {
    borderRadius: 8,
  },
  filled: {
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  underlined: {
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
  // 상태 스타일
  focused: {
    borderColor: '#278CCC',
  },
  invalid: {
    borderColor: '#FF3B30',
  },
  disabled: {
    backgroundColor: '#F0F2F5',
    borderColor: '#E5E5E5',
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
    color: '#333333',
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
    color: '#333333',
  },
  required: {
    color: '#FF3B30',
  },
  // 헬퍼 텍스트 스타일
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
  },
  // 비활성화 텍스트
  disabledText: {
    color: '#999999',
  },
  // 아이콘 컨테이너
  iconContainer: {
    paddingHorizontal: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default Input;
