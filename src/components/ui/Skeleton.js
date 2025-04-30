import React from 'react';
import { Skeleton, SkeletonText } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Skeleton 스타일 설정
const skeletonStyle = tva({
  base: {
    bg: '$colorBorderLight',
    startColor: '$colorBorderLight',
    endColor: '$colorBackgroundAlt',
    speed: 0.8,
    overflow: 'hidden',
  },
  variants: {
    variant: {
      text: {
        height: 12,
        borderRadius: '$sm',
        width: '100%',
      },
      circle: {
        borderRadius: '$full',
        aspectRatio: 1,
      },
      rect: {
        borderRadius: '$md',
        width: '100%',
      },
    },
    size: {
      xs: {
        height: 16,
        width: 16,
        _text: {
          height: 8,
          marginVertical: 2,
        },
      },
      sm: {
        height: 24,
        width: 24,
        _text: {
          height: 10,
          marginVertical: 3,
        },
      },
      md: {
        height: 32,
        width: 32,
        _text: {
          height: 12,
          marginVertical: 4,
        },
      },
      lg: {
        height: 48,
        width: 48,
        _text: {
          height: 14,
          marginVertical: 5,
        },
      },
      xl: {
        height: 64,
        width: 64,
        _text: {
          height: 16,
          marginVertical: 6,
        },
      },
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
  aliases: {
    // 색상 별칭
    colorBackground: { value: 'var(--color-background)' },
    colorBackgroundAlt: { value: 'var(--color-background-alt)' },
    colorBackgroundDark: { value: 'var(--color-background-dark)' },
    colorBorder: { value: 'var(--color-border)' },
    colorBorderLight: { value: 'var(--color-border-light)' },

    // 테두리 별칭
    borderRadiusSm: { value: '{--border-radius-sm}px' },
    borderRadiusMd: { value: '{--border-radius-md}px' },
    borderRadiusLg: { value: '{--border-radius-lg}px' },
    borderRadiusFull: { value: '{--border-radius-full}px' },
  },
};

export { Skeleton, SkeletonText, skeletonStyle, config };
