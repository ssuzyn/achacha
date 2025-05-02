import React from 'react';
import { View, Image as RNImage } from 'react-native';
import { Card as RNECard, Text, Divider } from 'react-native-elements';
import useTheme from '../../hooks/useTheme';

/**
 * 기본 Card 컴포넌트
 */
const Card = ({ children, containerStyle, wrapperStyle, variant = 'default', ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();
  const variantStyle = card.getVariantStyle(variant);

  return (
    <RNECard
      containerStyle={[variantStyle, cardStyles.container, containerStyle]}
      wrapperStyle={[cardStyles.wrapper, wrapperStyle]}
      {...props}
    >
      {children}
    </RNECard>
  );
};

/**
 * Card.Title 컴포넌트
 */
const CardTitle = ({ children, style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return (
    <Text style={[cardStyles.title, style]} {...props}>
      {children}
    </Text>
  );
};

/**
 * Card.Divider 컴포넌트
 */
const CardDivider = ({ style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return <Divider style={[cardStyles.divider, style]} {...props} />;
};

/**
 * Card.Image 컴포넌트
 */
const CardImage = ({ source, style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return (
    <RNImage source={source} style={[cardStyles.image, style]} resizeMode="cover" {...props} />
  );
};

/**
 * Card.FeaturedTitle 컴포넌트
 */
const CardFeaturedTitle = ({ children, style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return (
    <Text style={[cardStyles.featuredTitle, style]} {...props}>
      {children}
    </Text>
  );
};

/**
 * Card.FeaturedSubtitle 컴포넌트
 */
const CardFeaturedSubtitle = ({ children, style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return (
    <Text style={[cardStyles.featuredSubtitle, style]} {...props}>
      {children}
    </Text>
  );
};

/**
 * 피처링된 카드 컨텐츠를 위한 래퍼 컴포넌트
 */
const FeaturedWrapper = ({ children, style, ...props }) => {
  const { card } = useTheme();
  const cardStyles = card.getStyles();

  return (
    <View style={[cardStyles.featuredContainer, style]} {...props}>
      {children}
      <View style={cardStyles.featuredContent}>{children}</View>
    </View>
  );
};

// 컴포넌트 연결
Card.Title = CardTitle;
Card.Divider = CardDivider;
Card.Image = CardImage;
Card.FeaturedTitle = CardFeaturedTitle;
Card.FeaturedSubtitle = CardFeaturedSubtitle;
Card.FeaturedWrapper = FeaturedWrapper;

export default Card;
