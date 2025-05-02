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
    colorPrimary: { value: '$primary' },
    colorSecondary: { value: '$secondary' },
    colorTertiary: { value: '$tertiary' },
    colorSuccess: { value: '$success' },
    colorDanger: { value: '$danger' },
    colorWarning: { value: '$warning' },
    colorInfo: { value: '$info' },
    colorBorder: { value: '$border' },
    colorBorderLight: { value: '$borderLight' },
    colorText: { value: '$text' },
    colorTextSecondary: { value: '$textSecondary' },
    colorDisabled: { value: '$disabled' },

    // 폰트 사이즈 별칭
    fontSizeXs: { value: '$xs' },
    fontSizeSm: { value: '$sm' },
    fontSizeMd: { value: '$md' },
    fontSizeLg: { value: '$lg' },
    fontSizeXl: { value: '$xl' },

    // 간격 별칭
    spacingXs: { value: '$xs' },
    spacingSm: { value: '$sm' },
    spacingMd: { value: '$md' },
    spacingLg: { value: '$lg' },
    spacingXl: { value: '$xl' },

    // 테두리 별칭
    borderWidthThin: { value: '$thin' },
    borderWidthMedium: { value: '$medium' },
    borderWidthThick: { value: '$thick' },
    borderRadiusNone: { value: '$none' },
    borderRadiusSm: { value: '$sm' },
    borderRadiusMd: { value: '$md' },
    borderRadiusLg: { value: '$lg' },
    borderRadiusXl: { value: '$xl' },
    borderRadiusFull: { value: '$full' },
  },
};

export { Input, InputField, InputIcon, InputSlot, InputGroup, inputStyle, config };
