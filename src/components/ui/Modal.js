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
  base: {},
  variants: {
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      full: {},
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
