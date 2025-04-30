import React from 'react';
import { Skeleton, SkeletonText } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Skeleton 스타일 설정
const skeletonStyle = tva({
  base: {},
  variants: {
    variant: {
      text: {},
      circle: {},
      rect: {},
    },
    size: {
      xs: {},
      sm: {},
      md: {},
      lg: {},
      xl: {},
    },
  },
  defaultVariants: {
    variant: 'rect',
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

export { Skeleton, SkeletonText, skeletonStyle, config };
