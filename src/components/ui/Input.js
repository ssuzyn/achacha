import React from 'react';
import { Input, InputField, InputIcon, InputSlot, InputGroup } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Input 스타일 설정
const inputStyle = tva({
  base: {},
  variants: {
    variant: {
      outline: {},
      rounded: {},
      underlined: {},
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
    state: {
      error: {},
      success: {},
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

export { Input, InputField, InputIcon, InputSlot, InputGroup, inputStyle, config };
