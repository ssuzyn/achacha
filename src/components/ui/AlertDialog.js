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
  base: {},
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
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
