import React from 'react';
import { Slider, SliderFilledTrack, SliderThumb, SliderTrack } from '@gluestack-ui/themed';
import { tva } from '@gluestack-style/react';

// Slider 스타일 설정
const sliderStyle = tva({
  base: {},
  variants: {
    orientation: {
      horizontal: {},
      vertical: {},
    },
    size: {
      sm: {},
      md: {},
      lg: {},
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
};

export { Slider, SliderFilledTrack, SliderThumb, SliderTrack, sliderStyle, config };
