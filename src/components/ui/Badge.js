import React from 'react';
import { Badge as RNEBadge } from 'react-native-elements';
import { StyleSheet } from 'react-native';

/**
 * 뱃지 컴포넌트
 */
export const Badge = ({
  value,
  status = 'primary', // primary, success, warning, error, info
  variant = 'solid', // solid, outline
  size = 'md', // sm, md, lg
  containerStyle,
  textStyle,
  ...props
}) => {
  // 변형과 상태에 따른 배경 및 텍스트 색상 설정
  const getStatusColor = () => {
    const colors = {
      primary: '#278CCC',
      success: '#28a745',
      warning: '#ffc107',
      error: '#dc3545',
      info: '#17a2b8',
    };

    return colors[status] || colors.primary;
  };

  // 사이즈에 따른 스타일 설정
  const getSizeStyle = () => {
    const sizeStyles = {
      sm: {
        height: 16,
        minWidth: 16,
        borderRadius: 8,
        fontSize: 10,
      },
      md: {
        height: 20,
        minWidth: 20,
        borderRadius: 10,
        fontSize: 12,
      },
      lg: {
        height: 24,
        minWidth: 24,
        borderRadius: 12,
        fontSize: 14,
      },
    };

    return sizeStyles[size] || sizeStyles.md;
  };

  const badgeColor = getStatusColor();
  const sizeStyle = getSizeStyle();

  return (
    <RNEBadge
      value={value}
      badgeStyle={[
        styles.badge,
        {
          backgroundColor: variant === 'outline' ? 'transparent' : badgeColor,
          borderColor: badgeColor,
          borderWidth: variant === 'outline' ? 1 : 0,
          height: sizeStyle.height,
          minWidth: sizeStyle.minWidth,
          borderRadius: sizeStyle.borderRadius,
        },
        containerStyle,
      ]}
      textStyle={[
        styles.text,
        {
          color: variant === 'outline' ? badgeColor : 'white',
          fontSize: sizeStyle.fontSize,
        },
        textStyle,
      ]}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 6,
  },
  text: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default Badge;
