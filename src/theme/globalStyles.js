import { StyleSheet } from 'react-native';
import Fonts from '../constants/fonts';

export const globalStyles = StyleSheet.create({
  text: {
    fontFamily: Fonts.regular,
    color: '#000',
  },
  heading1: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    lineHeight: 36,
  },
  heading2: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    lineHeight: 32,
  },
  heading3: {
    fontFamily: Fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
  },
  heading4: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    lineHeight: 24,
  },
  subtitle1: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    lineHeight: 22,
  },
  subtitle2: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
  body1: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    lineHeight: 24,
  },
  body2: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    lineHeight: 20,
  },
  caption: {
    fontFamily: Fonts.light,
    fontSize: 12,
    lineHeight: 16,
  },
  button: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default globalStyles;
