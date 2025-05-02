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
  base: {
    borderWidth: '$borderWidthThin',
    borderColor: '$colorBorderLight',
    borderRadius: '$md',
    backgroundColor: 'transparent',
    color: '$colorText',
    minHeight: 42,
    width: '100%',
    _focus: {
      borderColor: '$colorPrimary',
    },
  },
  variants: {
    variant: {
      outline: {
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
      rounded: {
        borderRadius: '$full',
        borderColor: '$colorBorderLight',
        _focus: {
          borderColor: '$colorPrimary',
        },
      },
    },
    size: {
      sm: {
        paddingHorizontal: '$spacingSm',
        paddingVertical: '$spacingXs',
        fontSize: '$fontSizeSm',
        minHeight: 36,
        _icon: {
          height: 14,
          width: 14,
        },
      },
      md: {
        paddingHorizontal: '$spacingMd',
        paddingVertical: '$spacingSm',
        fontSize: '$fontSizeMd',
        minHeight: 42,
        _icon: {
          height: 18,
          width: 18,
        },
      },
      lg: {
        paddingHorizontal: '$spacingLg',
        paddingVertical: '$spacingMd',
        fontSize: '$fontSizeLg',
        minHeight: 48,
        _icon: {
          height: 22,
          width: 22,
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
    // 색상 별칭
    colorPrimary: { value: '$primary' },
    colorSecondary: { value: '$secondary' },
    colorText: { value: '$text' },
    colorTextSecondary: { value: '$textSecondary' },
    colorBackground: { value: '$background' },
    colorBackgroundAlt: { value: '$backgroundAlt' },
    colorBorder: { value: '$border' },
    colorBorderLight: { value: '$borderLight' },
    colorDisabled: { value: '$disabled' },
    colorDisabledText: { value: '$disabledText' },

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
    borderRadiusSm: { value: '$sm' },
    borderRadiusMd: { value: '$md' },
    borderRadiusLg: { value: '$lg' },
    borderRadiusFull: { value: '$full' },
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
