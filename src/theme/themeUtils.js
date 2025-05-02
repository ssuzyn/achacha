// 테마 관련 유틸리티 함수 모음
import { StyleSheet } from 'react-native';

/**
 * 버튼 스타일 관련 유틸리티 함수
 */
export const buttonUtils = {
  getBackgroundColor: (theme, variant, isDisabled) => {
    if (isDisabled) return theme.colors.disabled;

    switch (variant) {
      case 'primary':
        return theme.colors.secondary;
      case 'secondary':
        return theme.colors.primary;
      case 'outline':
      case 'ghost':
      case 'link':
      default:
        return 'transparent';
    }
  },

  getTextColor: (theme, variant, isDisabled) => {
    if (isDisabled) return theme.colors.grey4;

    switch (variant) {
      case 'primary':
      case 'secondary':
        return theme.colors.white;
      case 'outline':
      case 'ghost':
      case 'link':
      default:
        return theme.colors.primary;
    }
  },

  getBorderColor: (theme, variant, isDisabled) => {
    if (isDisabled) return 'transparent';
    return variant === 'outline' ? theme.colors.primary : 'transparent';
  },

  getButtonStyles: () =>
    StyleSheet.create({
      button: {
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 0,
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
      // 변형 스타일
      outline: {
        borderWidth: 1,
      },
      // 크기 스타일
      smSize: {
        paddingVertical: 6,
        paddingHorizontal: 12,
      },
      mdSize: {
        paddingVertical: 8,
        paddingHorizontal: 16,
      },
      lgSize: {
        paddingVertical: 10,
        paddingHorizontal: 20,
      },
      // 텍스트 크기 스타일
      smText: {
        fontSize: 12,
      },
      mdText: {
        fontSize: 14,
      },
      lgText: {
        fontSize: 16,
      },
      // 아이콘 스타일
      iconLeft: {
        marginRight: 8,
      },
      iconRight: {
        marginLeft: 8,
      },
    }),
};

/**
 * 입력 필드 스타일 관련 유틸리티 함수
 */
export const inputUtils = {
  getContainerStyle: (theme, variant, size, isInvalid, isFocused, isDisabled) => {
    const baseStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      borderWidth: 1,
    };

    // 변형에 따른 스타일
    const variantStyle = {
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
    };

    // 크기에 따른 스타일
    const sizeStyle = {
      sm: { height: 32 },
      md: { height: 40 },
      lg: { height: 48 },
    };

    return {
      ...baseStyle,
      ...variantStyle[variant],
      ...sizeStyle[size],
      borderColor: isInvalid
        ? theme.colors.error
        : isFocused
          ? theme.colors.primary
          : theme.colors.grey3,
      backgroundColor:
        variant === 'filled'
          ? theme.colors.grey0
          : isDisabled
            ? theme.colors.grey1
            : theme.colors.white,
    };
  },

  getInputStyles: () =>
    StyleSheet.create({
      wrapper: {
        width: '100%',
        marginBottom: 16,
      },
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
      label: {
        marginBottom: 6,
        fontSize: 14,
        fontWeight: '500',
      },
      required: {
        // 색상은 테마에서 적용
      },
      helperText: {
        fontSize: 12,
        marginTop: 4,
      },
      iconContainer: {
        paddingHorizontal: 10,
        justifyContent: 'center',
        alignItems: 'center',
      },
    }),
};

/**
 * 스켈레톤 컴포넌트 스타일 관련 유틸리티 함수
 */
export const skeletonUtils = {
  getVariantStyle: (variant, width, height, borderRadius) => {
    switch (variant) {
      case 'circle':
        return {
          width: width || 48,
          height: height || 48,
          borderRadius: borderRadius || 24,
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: borderRadius || 4,
        };
      case 'rect':
      default:
        return {
          width: width || 100,
          height: height || 80,
          borderRadius: borderRadius || 4,
        };
    }
  },

  getSkeletonStyles: () =>
    StyleSheet.create({
      groupContainer: {
        width: '100%',
      },
      listItem: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
      },
      listContent: {
        marginLeft: 10,
        flex: 1,
      },
      card: {
        marginBottom: 16,
        borderRadius: 8,
        overflow: 'hidden',
      },
      cardContent: {
        padding: 12,
      },
      profile: {
        flexDirection: 'row',
        marginBottom: 16,
        alignItems: 'center',
      },
      profileContent: {
        marginLeft: 12,
        flex: 1,
      },
      detail: {
        width: '100%',
      },
      mt5: {
        marginTop: 5,
      },
      mt10: {
        marginTop: 10,
      },
    }),
};
