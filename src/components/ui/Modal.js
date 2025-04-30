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
