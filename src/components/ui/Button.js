import React from 'react';
import { Button, ButtonText, ButtonGroup, ButtonIcon, ButtonSpinner } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Button 스타일 설정
const buttonStyle = tva({
  base: {
    borderRadius: '$md',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  variants: {
    variant: {
      solid: {
        backgroundColor: '$colorButtonPrimary',
        color: '$colorButtonText',
      },
      outline: {
        borderWidth: '$borderWidthMedium',
        borderColor: '$colorButtonPrimary',
        color: '$colorButtonPrimary',
        backgroundColor: 'transparent',
      },
      link: {
        backgroundColor: 'transparent',
        color: '$colorButtonPrimary',
        borderWidth: 0,
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
        paddingVertical: '$spacingSm',
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
    action: {
      primary: {
        backgroundColor: '$colorButtonPrimary',
        color: '$colorButtonText',
        _pressed: {
          backgroundColor: '$colorSecondary',
        },
      },
      secondary: {
        backgroundColor: '$colorButtonSecondary',
        color: '$colorButtonText',
        _pressed: {
          backgroundColor: '$colorPrimary',
        },
      },
      positive: {
        backgroundColor: '$colorButtonSuccess',
        color: '$colorButtonText',
        _pressed: {
          backgroundColor: '$colorSuccess',
          opacity: 0.8,
        },
      },
      negative: {
        backgroundColor: '$colorButtonDanger',
        color: '$colorButtonText',
        _pressed: {
          backgroundColor: '$colorDanger',
          opacity: 0.8,
        },
      },
    },
    disabled: {
      true: {
        opacity: 0.6,
        _text: {
          opacity: 0.6,
        },
      },
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    action: 'primary',
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
    colorButtonPrimary: { value: '$buttonPrimary' },
    colorButtonSecondary: { value: '$buttonSecondary' },
    colorButtonSuccess: { value: '$buttonSuccess' },
    colorButtonDanger: { value: '$buttonDanger' },
    colorButtonText: { value: '$buttonText' },
    colorSuccess: { value: '$success' },
    colorDanger: { value: '$danger' },

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
    borderRadiusNone: { value: '$none' },
    borderRadiusSm: { value: '$sm' },
    borderRadiusMd: { value: '$md' },
    borderRadiusLg: { value: '$lg' },
  },
};

export { Button, ButtonText, ButtonGroup, ButtonIcon, ButtonSpinner, buttonStyle, config };
