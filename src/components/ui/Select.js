import React from 'react';
import {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
  SelectFlatList,
  Icon,
  ChevronDownIcon,
  CheckIcon,
} from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Select 스타일 설정
const selectStyle = tva({
  base: {},
  variants: {
    variant: {
      outline: {},
      underlined: {},
      rounded: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
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
};

export {
  Select,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicator,
  SelectDragIndicatorWrapper,
  SelectIcon,
  SelectInput,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectScrollView,
  SelectTrigger,
  SelectFlatList,
  Icon,
  ChevronDownIcon,
  CheckIcon,
  selectStyle,
  config,
};
