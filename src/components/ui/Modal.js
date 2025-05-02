import React from 'react';
import {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Heading,
  Icon,
  CloseIcon,
} from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Modal 스타일 설정
const modalStyle = tva({
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
  },
  variants: {
    size: {
      xs: {
        width: 240,
      },
      sm: {
        width: 300,
      },
      md: {
        width: 400,
      },
      lg: {
        width: 520,
      },
      full: {
        width: '100%',
        maxWidth: '100%',
        height: '100%',
        maxHeight: '100%',
        marginBottom: 0,
        marginTop: 0,
        borderRadius: 0,
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
  },
};

export {
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Heading,
  Icon,
  CloseIcon,
  modalStyle,
  config,
};
