import React from 'react';
import { Switch } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Switch 스타일 설정
const switchStyle = tva({
  base: {
    trackColor: {
      false: '$colorBorderLight',
      true: '$colorPrimary',
    },
    thumbColor: '$colorBackground',
    onThumbColor: '$colorBackground',
    offThumbColor: '$colorBackground',
    _disabled: {
      opacity: 0.5,
    },
  },
  variants: {
    size: {
      sm: {
        transform: [{ scale: 0.7 }],
      },
      md: {
        transform: [{ scale: 0.9 }],
      },
      lg: {
        transform: [{ scale: 1.1 }],
      },
    },
    variant: {
      outline: {
        _track: {
          borderWidth: 1,
          borderColor: '$colorBorder',
        },
      },
      solid: {
        // 기본값 유지
      },
    },
  },
  defaultVariants: {
    size: 'md',
    variant: 'solid',
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
    colorBackground: { value: '$background' },
    colorBorder: { value: '$border' },
    colorBorderLight: { value: '$borderLight' },
    colorDisabled: { value: '$disabled' },
  },
};

export { Switch, switchStyle, config };
