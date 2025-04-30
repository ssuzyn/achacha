import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTypeMap,
  Heading,
  Icon,
  CloseIcon,
  Button,
  ButtonText,
  Text,
} from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Alert Dialog 스타일 설정
const alertDialogStyle = tva({
  base: {
    bg: '$colorBackground',
    borderRadius: '$lg',
    overflow: 'hidden',
    maxWidth: '90%',
    shadowColor: '$colorShadow',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    _backdrop: {
      bg: '$colorOverlay',
    },
    _header: {
      borderBottomWidth: 1,
      borderBottomColor: '$colorBorderLight',
      paddingVertical: '$spacingMd',
      paddingHorizontal: '$spacingLg',
    },
    _body: {
      paddingVertical: '$spacingLg',
      paddingHorizontal: '$spacingLg',
    },
    _footer: {
      borderTopWidth: 1,
      borderTopColor: '$colorBorderLight',
      paddingVertical: '$spacingMd',
      paddingHorizontal: '$spacingLg',
    },
    _closeButton: {
      position: 'absolute',
      right: 12,
      top: 12,
      zIndex: 1,
      p: '$spacingSm',
    },
  },
  variants: {
    size: {
      sm: {
        width: 300,
      },
      md: {
        width: 400,
      },
      lg: {
        width: 520,
      },
    },
  },
  defaultVariants: {
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
    colorBackground: { value: 'var(--color-background)' },
    colorBackgroundAlt: { value: 'var(--color-background-alt)' },
    colorText: { value: 'var(--color-text)' },
    colorTextSecondary: { value: 'var(--color-text-secondary)' },
    colorBorder: { value: 'var(--color-border)' },
    colorBorderLight: { value: 'var(--color-border-light)' },
    colorPrimary: { value: 'var(--color-primary)' },
    colorSecondary: { value: 'var(--color-secondary)' },
    colorOverlay: { value: 'var(--color-overlay)' },
    colorShadow: { value: 'var(--color-shadow)' },
    colorDanger: { value: 'var(--color-danger)' },
    colorSuccess: { value: 'var(--color-success)' },
    colorWarning: { value: 'var(--color-warning)' },

    // 테두리 별칭
    borderRadiusSm: { value: '{--border-radius-sm}px' },
    borderRadiusMd: { value: '{--border-radius-md}px' },
    borderRadiusLg: { value: '{--border-radius-lg}px' },
    borderRadiusXl: { value: '{--border-radius-xl}px' },

    // 간격 별칭
    spacingSm: { value: '{--spacing-sm}px' },
    spacingMd: { value: '{--spacing-md}px' },
    spacingLg: { value: '{--spacing-lg}px' },
    spacingXl: { value: '{--spacing-xl}px' },
    spacing2xl: { value: '{--spacing-2xl}px' },

    // 폰트 사이즈 별칭
    fontSizeXs: { value: '{--font-size-xs}px' },
    fontSizeSm: { value: '{--font-size-sm}px' },
    fontSizeMd: { value: '{--font-size-md}px' },
    fontSizeLg: { value: '{--font-size-lg}px' },
    fontSizeXl: { value: '{--font-size-xl}px' },
    fontSize2xl: { value: '{--font-size-2xl}px' },
    fontSize3xl: { value: '{--font-size-3xl}px' },
  },
};

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  Button,
  ButtonText,
  Heading,
  Icon,
  CloseIcon,
  Text,
  alertDialogStyle,
  config,
};
