import React from 'react';
import { View, StyleSheet, Image, Text } from 'react-native';
import { Icon } from 'react-native-elements';

/**
 * 기본 Card 컴포넌트
 */
const Card = ({ children, style, ...props }) => {
  return (
    <View style={[styles.card, style]} {...props}>
      {children}
    </View>
  );
};

/**
 * GiftCard 컴포넌트 - HomeScreen의 기프티콘 카드
 */
const GiftCard = ({ brand, name, image, daysLeft, style, ...props }) => {
  return (
    <View style={[styles.giftCard, style]} {...props}>
      <View style={styles.giftImageContainer}>
        <Image source={image} style={styles.giftImage} resizeMode="contain" />
      </View>
      <View style={styles.giftInfo}>
        <Text style={styles.giftBrand}>{brand}</Text>
        <Text style={styles.giftName} numberOfLines={1} ellipsizeMode="tail">
          {name}
        </Text>
      </View>
      <View style={styles.dDayContainer}>
        <Text style={styles.dDayText}>D-{daysLeft}</Text>
      </View>
    </View>
  );
};

/**
 * FeatureCard 컴포넌트 - HomeScreen의 쉐어박스 카드
 */
const FeatureCard = ({ title, iconName, count, style, ...props }) => {
  return (
    <View style={[styles.featureCard, style]} {...props}>
      <Text style={styles.featureTitle}>{title}</Text>
      {iconName && count && (
        <View style={styles.shareBoxIcon}>
          <Icon name={iconName} size={24} color="#888" />
          <Text style={styles.shareBoxCount}>{count}</Text>
        </View>
      )}
    </View>
  );
};

/**
 * RadarCard 컴포넌트 - HomeScreen의 레이더 카드
 */
const RadarCard = ({ text, image, style, ...props }) => {
  return (
    <View style={[styles.radarCard, style]} {...props}>
      <Text style={styles.radarText}>{text}</Text>
      <Image source={image} style={styles.fullRadarImage} />
    </View>
  );
};

/**
 * GiftCard2 컴포넌트 - HomeScreen의 하단 선물 카드
 */
const GiftCard2 = ({ title, subtitle, image, style, ...props }) => {
  return (
    <View style={[styles.giftCard2, style]} {...props}>
      <View style={styles.giftCard2Content}>
        <View>
          <Text style={styles.giftCard2Text}>{title}</Text>
          <Text style={styles.giftCard2SubText}>{subtitle}</Text>
        </View>
        <Image source={image} style={styles.giftCard2Image} resizeMode="contain" />
      </View>
    </View>
  );
};

// 스타일 정의
const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  // GiftCard 스타일
  giftCard: {
    width: 180,
    height: 200,
    marginRight: 10,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    margin: 1,
  },
  giftImageContainer: {
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 10,
    borderRadius: 8,
  },
  giftImage: {
    width: '65%',
    height: '65%',
  },
  giftInfo: {
    paddingHorizontal: 10,
  },
  giftBrand: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    textAlign: 'center',
  },
  giftName: {
    fontSize: 14,
    fontWeight: '500',
    color: 'black',
    textAlign: 'center',
  },
  dDayContainer: {
    backgroundColor: '#F6C5C5',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 8,
  },
  dDayText: {
    color: '#D33434',
    fontSize: 14,
    fontWeight: '600',
  },
  // FeatureCard 스타일
  featureCard: {
    width: '48%',
    height: 160,
    paddingVertical: 14,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    justifyContent: 'start',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    margin: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    lineHeight: 24,
  },
  shareBoxIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'absolute',
    bottom: 14,
    left: 12,
  },
  shareBoxCount: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  // RadarCard 스타일
  radarCard: {
    width: '48%',
    height: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    overflow: 'hidden',
    padding: 0,
    position: 'relative',
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    margin: 1,
  },
  radarText: {
    fontSize: 18,
    fontWeight: '800',
    color: '#333',
    textAlign: 'right',
    position: 'absolute',
    top: 60,
    left: 0,
    right: 16,
    zIndex: 1,
    lineHeight: 24,
  },
  fullRadarImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    resizeMode: 'cover',
  },
  // GiftCard2 스타일
  giftCard2: {
    padding: 16,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    margin: 1,
  },
  giftCard2Content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  giftCard2Text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  giftCard2SubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  giftCard2Image: {
    width: 140,
    height: 80,
  },
});

// 컴포넌트 연결
Card.GiftCard = GiftCard;
Card.FeatureCard = FeatureCard;
Card.RadarCard = RadarCard;
Card.GiftCard2 = GiftCard2;

export default Card;
