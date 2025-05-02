import React from 'react';
import {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogBody,
  AlertDialogCloseButton,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
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
    colorBackground: { value: '$background' },
    colorBackgroundAlt: { value: '$backgroundAlt' },
    colorText: { value: '$text' },
    colorTextSecondary: { value: '$textSecondary' },
    colorBorder: { value: '$border' },
    colorBorderLight: { value: '$borderLight' },
    colorPrimary: { value: '$primary' },
    colorSecondary: { value: '$secondary' },
    colorOverlay: { value: '$overlay' },
    colorShadow: { value: '$shadow' },
    colorDanger: { value: '$danger' },
    colorSuccess: { value: '$success' },
    colorWarning: { value: '$warning' },

    // 테두리 별칭
    borderRadiusSm: { value: '$sm' },
    borderRadiusMd: { value: '$md' },
    borderRadiusLg: { value: '$lg' },
    borderRadiusXl: { value: '$xl' },

    // 간격 별칭
    spacingSm: { value: '$sm' },
    spacingMd: { value: '$md' },
    spacingLg: { value: '$lg' },
    spacingXl: { value: '$xl' },
    spacing2xl: { value: '$2xl' },

    // 폰트 사이즈 별칭
    fontSizeXs: { value: '$xs' },
    fontSizeSm: { value: '$sm' },
    fontSizeMd: { value: '$md' },
    fontSizeLg: { value: '$lg' },
    fontSizeXl: { value: '$xl' },
    fontSize2xl: { value: '$2xl' },
    fontSize3xl: { value: '$3xl' },
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
