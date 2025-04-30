import React from 'react';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Slider 스타일 설정
const sliderStyle = tva({
  base: {
    width: '100%',
    _track: {
      bg: '$colorBorderLight',
      borderRadius: '$full',
    },
    _filledTrack: {
      bg: '$colorPrimary',
      borderRadius: '$full',
    },
    _thumb: {
      bg: '$colorBackground',
      borderWidth: '$borderWidthThin',
      borderColor: '$colorPrimary',
      shadowColor: '$colorShadow',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
  },
  variants: {
    orientation: {
      horizontal: {
        height: 4,
        _thumb: {
          width: 20,
          height: 20,
          borderRadius: '$full',
        },
      },
      vertical: {
        width: 4,
        _thumb: {
          width: 20,
          height: 20,
          borderRadius: '$full',
        },
      },
    },
    size: {
      sm: {
        _track: {
          height: 2,
        },
        _thumb: {
          width: 16,
          height: 16,
        },
      },
      md: {
        _track: {
          height: 4,
        },
        _thumb: {
          width: 20,
          height: 20,
        },
      },
      lg: {
        _track: {
          height: 6,
        },
        _thumb: {
          width: 24,
          height: 24,
        },
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
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
    colorBackground: { value: 'var(--color-background)' },
    colorBorderLight: { value: 'var(--color-border-light)' },
    colorShadow: { value: 'var(--color-shadow)' },

    // 테두리 별칭
    borderWidthThin: { value: '{--border-width-thin}px' },
    borderWidthMedium: { value: '{--border-width-medium}px' },
    borderRadiusSm: { value: '{--border-radius-sm}px' },
    borderRadiusMd: { value: '{--border-radius-md}px' },
    borderRadiusLg: { value: '{--border-radius-lg}px' },
    borderRadiusFull: { value: '{--border-radius-full}px' },
  },
};

export { Slider, SliderFilledTrack, SliderThumb, SliderTrack, sliderStyle, config };
