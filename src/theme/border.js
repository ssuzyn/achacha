// React Native에서는 단위 없이 숫자로만 표현 (px가 아님)
const border = {
  radius: {
    none: 0,
    extraSmall: 2,
    small: 4,
    medium: 8,
    large: 12,
    extraLarge: 16,
    full: 9999,
  },
  width: {
    none: 0,
    thin: 1,
    medium: 2,
    thick: 3,
    extraThick: 4,
  },
  style: {
    solid: 'solid',
    dashed: 'dashed',
    dotted: 'dotted',
  },
};

export default border;
