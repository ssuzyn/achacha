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
    colorPrimary: { value: 'var(--color-primary)' },
    colorSecondary: { value: 'var(--color-secondary)' },
    colorText: { value: 'var(--color-text)' },
    colorTextSecondary: { value: 'var(--color-text-secondary)' },
    colorBackground: { value: 'var(--color-background)' },
    colorBackgroundAlt: { value: 'var(--color-background-alt)' },
    colorBorder: { value: 'var(--color-border)' },
    colorBorderLight: { value: 'var(--color-border-light)' },
    colorDisabled: { value: 'var(--color-disabled)' },
    colorDisabledText: { value: 'var(--color-disabled-text)' },

    // 폰트 사이즈 별칭
    fontSizeXs: { value: '{--font-size-xs}px' },
    fontSizeSm: { value: '{--font-size-sm}px' },
    fontSizeMd: { value: '{--font-size-md}px' },
    fontSizeLg: { value: '{--font-size-lg}px' },
    fontSizeXl: { value: '{--font-size-xl}px' },

    // 간격 별칭
    spacingXs: { value: '{--spacing-xs}px' },
    spacingSm: { value: '{--spacing-sm}px' },
    spacingMd: { value: '{--spacing-md}px' },
    spacingLg: { value: '{--spacing-lg}px' },
    spacingXl: { value: '{--spacing-xl}px' },

    // 테두리 별칭
    borderWidthThin: { value: '{--border-width-thin}px' },
    borderWidthMedium: { value: '{--border-width-medium}px' },
    borderRadiusSm: { value: '{--border-radius-sm}px' },
    borderRadiusMd: { value: '{--border-radius-md}px' },
    borderRadiusLg: { value: '{--border-radius-lg}px' },
    borderRadiusFull: { value: '{--border-radius-full}px' },
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
