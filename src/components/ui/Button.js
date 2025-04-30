import React from 'react';
import { Button, ButtonText, ButtonGroup, ButtonIcon, ButtonSpinner } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Button 스타일 설정
const buttonStyle = tva({
  base: {},
  variants: {
    variant: {
      solid: {},
      outline: {},
      link: {},
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
    action: {
      primary: {},
      secondary: {},
      positive: {},
      negative: {},
    },
  },
  defaultVariants: {
    variant: 'solid',
    size: 'md',
    action: 'primary',
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

export { Button, ButtonText, ButtonGroup, ButtonIcon, ButtonSpinner, buttonStyle, config };
