import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTheme } from '../../hooks/useTheme';
import { inputUtils } from '../../theme/themeUtils';

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
  const styles = inputUtils.getInputStyles();

  // 입력창 스타일 가져오기 - inputUtils 사용
  const containerStyle = [
    inputUtils.getContainerStyle(theme, variant, size, isInvalid, isFocused, isDisabled),
    style,
  ];

  // 입력 필드 스타일
  const textInputStyle = [
    styles.input,
    styles[`${size}Input`],
    { color: isDisabled ? theme.colors.grey4 : theme.colors.black },
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
            color={theme.colors.grey5}
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
        <Text style={[styles.label, { color: theme.colors.black }, labelStyle]}>
          {label}
          {isRequired && <Text style={[styles.required, { color: theme.colors.error }]}> *</Text>}
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
          placeholderTextColor={theme.colors.grey4}
          {...props}
        />

        {renderRightElement()}
      </View>

      {(helperText || errorText) && (
        <Text
          style={[
            styles.helperText,
            { color: isInvalid ? theme.colors.error : theme.colors.grey5 },
          ]}
        >
          {isInvalid ? errorText : helperText}
        </Text>
      )}
    </View>
  );
};

export default Input;
