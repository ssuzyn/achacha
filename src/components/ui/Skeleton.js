import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Skeleton as RNESkeleton, useTheme } from 'react-native-elements';

/**
 * 스켈레톤 로딩 컴포넌트
 */
export const Skeleton = ({
  width,
  height,
  variant = 'rect', // rect, circle, text
  animation = true,
  style,
  borderRadius,
  ...props
}) => {
  const { theme } = useTheme();

  // 변형에 따른 스타일 계산
  const getVariantStyle = () => {
    switch (variant) {
      case 'circle':
        return {
          width: width || 48,
          height: height || 48,
          borderRadius: borderRadius || 24,
        };
      case 'text':
        return {
          width: width || '100%',
          height: height || 16,
          borderRadius: borderRadius || 4,
        };
      case 'rect':
      default:
        return {
          width: width || 100,
          height: height || 80,
          borderRadius: borderRadius || 4,
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <RNESkeleton
      animation={animation ? 'wave' : 'none'}
      width={variantStyle.width}
      height={variantStyle.height}
      style={[{ borderRadius: variantStyle.borderRadius }, style]}
      {...props}
    />
  );
};

// 미리 정의된 스켈레톤 패턴
export const SkeletonGroup = ({
  type = 'list', // list, card, profile, detail
  count = 1,
  style,
}) => {
  const { theme } = useTheme();

  const renderItems = () => {
    const items = [];

    for (let i = 0; i < count; i++) {
      switch (type) {
        case 'card':
          items.push(
            <View key={i} style={[styles.card, style]}>
              <Skeleton width="100%" height={120} />
              <View style={styles.cardContent}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" style={styles.mt10} />
                <Skeleton variant="text" width="40%" style={styles.mt10} />
              </View>
            </View>
          );
          break;

        case 'profile':
          items.push(
            <View key={i} style={[styles.profile, style]}>
              <Skeleton variant="circle" width={60} height={60} />
              <View style={styles.profileContent}>
                <Skeleton variant="text" width="70%" />
                <Skeleton variant="text" width="40%" style={styles.mt10} />
              </View>
            </View>
          );
          break;

        case 'detail':
          items.push(
            <View key={i} style={[styles.detail, style]}>
              <Skeleton variant="text" width="60%" height={24} />
              <Skeleton variant="text" width="90%" style={styles.mt10} />
              <Skeleton variant="text" width="90%" style={styles.mt5} />
              <Skeleton variant="text" width="90%" style={styles.mt5} />
              <Skeleton width="100%" height={200} style={styles.mt10} />
            </View>
          );
          break;

        case 'list':
        default:
          items.push(
            <View key={i} style={[styles.listItem, style]}>
              <Skeleton variant="circle" width={40} height={40} />
              <View style={styles.listContent}>
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="60%" style={styles.mt5} />
              </View>
            </View>
          );
          break;
      }
    }

    return items;
  };

  return <View style={styles.groupContainer}>{renderItems()}</View>;
};

const styles = StyleSheet.create({
  groupContainer: {
    width: '100%',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  listContent: {
    marginLeft: 10,
    flex: 1,
  },
  card: {
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 12,
  },
  profile: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  profileContent: {
    marginLeft: 12,
    flex: 1,
  },
  detail: {
    width: '100%',
  },
  mt5: {
    marginTop: 5,
  },
  mt10: {
    marginTop: 10,
  },
});

export default Skeleton;
