import React from 'react';
import { Input, InputField, InputIcon, InputSlot, InputGroup } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Input 스타일 설정
const inputStyle = tva({
  base: {
    borderRadius: '$md',
    borderWidth: '$borderWidthThin',
    backgroundColor: 'transparent',
    minHeight: 42,
    width: '100%',
  },
  variants: {
    variant: {
      outline: {
        borderColor: '$colorBorderLight',
        _focus: {
          borderColor: '$colorPrimary',
        },
      },
      rounded: {
        borderRadius: '$full',
        borderColor: '$colorBorderLight',
        _focus: {
          borderColor: '$colorPrimary',
        },
      },
      underlined: {
        borderWidth: 0,
        borderBottomWidth: '$borderWidthThin',
        borderRadius: 0,
        borderColor: '$colorBorderLight',
        _focus: {
          borderColor: '$colorPrimary',
        },
      },
    },
    size: {
      xs: {
        paddingHorizontal: '$spacingXs',
        paddingVertical: '$spacingXs',
        fontSize: '$fontSizeXs',
        minHeight: 30,
      },
      sm: {
        paddingHorizontal: '$spacingSm',
        paddingVertical: '$spacingXs',
        fontSize: '$fontSizeSm',
        minHeight: 36,
      },
      md: {
        paddingHorizontal: '$spacingMd',
        paddingVertical: '$spacingSm',
        fontSize: '$fontSizeMd',
        minHeight: 42,
      },
      lg: {
        paddingHorizontal: '$spacingLg',
        paddingVertical: '$spacingMd',
        fontSize: '$fontSizeLg',
        minHeight: 48,
      },
      xl: {
        paddingHorizontal: '$spacingXl',
        paddingVertical: '$spacingLg',
        fontSize: '$fontSizeXl',
        minHeight: 56,
      },
    },
    state: {
      error: {
        borderColor: '$colorDanger',
        _focus: {
          borderColor: '$colorDanger',
        },
      },
      success: {
        borderColor: '$colorSuccess',
        _focus: {
          borderColor: '$colorSuccess',
        },
      },
    },
  },
  defaultVariants: {
    variant: 'outline',
    size: 'md',
  },
});

// 사용자 정의 설정을 위한 config 객체
const config = {
  twMerge: true,
  twMergeConfig: {
    classGroups: {
      'font-size': [
        {
          text: ['custom-heading-xl'],
        },
      ],
    },
  },
  aliases: {
    // 색상 별칭 매핑
    colorPrimary: { value: 'var(--color-primary)' },
    colorSecondary: { value: 'var(--color-secondary)' },
    colorTertiary: { value: 'var(--color-tertiary)' },
    colorSuccess: { value: 'var(--color-success)' },
    colorDanger: { value: 'var(--color-danger)' },
    colorWarning: { value: 'var(--color-warning)' },
    colorInfo: { value: 'var(--color-info)' },
    colorBorder: { value: 'var(--color-border)' },
    colorBorderLight: { value: 'var(--color-border-light)' },
    colorText: { value: 'var(--color-text)' },
    colorTextSecondary: { value: 'var(--color-text-secondary)' },
    colorDisabled: { value: 'var(--color-disabled)' },

    // 폰트 사이즈 별칭
    fontSizeXs: { value: '{--font-size-xs}px' },
    fontSizeSm: { value: '{--font-size-sm}px' },
    fontSizeMd: { value: '{--font-size-md}px' },
    fontSizeLg: { value: '{--font-size-lg}px' },
    fontSizeXl: { value: '{--font-size-xl}px' },

    // 간격 별칭
    spacingXs: { value: '{--spacing-xs}px' },
    spacingSm: { value: '{--spacing-sm}px' },
    spacingMd: { value: '{--spacing-md}px' },
    spacingLg: { value: '{--spacing-lg}px' },
    spacingXl: { value: '{--spacing-xl}px' },

    // 테두리 별칭
    borderWidthThin: { value: '{--border-width-thin}px' },
    borderWidthMedium: { value: '{--border-width-medium}px' },
    borderWidthThick: { value: '{--border-width-thick}px' },
    borderRadiusNone: { value: '{--border-radius-none}px' },
    borderRadiusSm: { value: '{--border-radius-sm}px' },
    borderRadiusMd: { value: '{--border-radius-md}px' },
    borderRadiusLg: { value: '{--border-radius-lg}px' },
    borderRadiusXl: { value: '{--border-radius-xl}px' },
    borderRadiusFull: { value: '{--border-radius-full}px' },
  },
};

export { Input, InputField, InputIcon, InputSlot, InputGroup, inputStyle, config };
