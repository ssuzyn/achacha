import React from 'react';
import { Switch } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Switch 스타일 설정
const switchStyle = tva({
  base: {},
  variants: {
    size: {
      sm: {},
      md: {},
      lg: {},
    },
    variant: {
      outline: {},
      solid: {},
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
};

export { Switch, switchStyle, config };
