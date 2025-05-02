import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon } from 'react-native-elements';

/**
 * 스와이프 가능한 리스트 아이템 컴포넌트
 */
export const SwipeableListItem = ({
  title,
  subtitle,
  leftContent,
  rightContent,
  leftWidth = 80,
  rightWidth = 80,
  leftStyle,
  rightStyle,
  leftAction,
  rightAction,
  leftIcon,
  rightIcon,
  containerStyle,
  titleStyle,
  subtitleStyle,
  onPress,
  bottomDivider = true,
  leftActionable = true,
  rightActionable = true,
  ...props
}) => {
  // 기본 왼쪽 스와이프 컨텐츠
  const defaultLeftContent = leftIcon ? (
    <Icon
      name={typeof leftIcon === 'string' ? leftIcon : 'edit'}
      type="material"
      color="#fff"
      size={24}
    />
  ) : null;

  // 기본 오른쪽 스와이프 컨텐츠
  const defaultRightContent = rightIcon ? (
    <Icon
      name={typeof rightIcon === 'string' ? rightIcon : 'delete'}
      type="material"
      color="#fff"
      size={24}
    />
  ) : null;

  // 기본 왼쪽 액션 스타일
  const defaultLeftStyle = {
    backgroundColor: '#2089dc',
    ...leftStyle,
  };

  // 기본 오른쪽 액션 스타일
  const defaultRightStyle = {
    backgroundColor: '#ff3b30',
    ...rightStyle,
  };

  return (
    <ListItem.Swipeable
      leftContent={
        leftActionable && (
          <ListItem.Content style={[styles.actionContent, defaultLeftStyle]}>
            {leftContent || defaultLeftContent}
          </ListItem.Content>
        )
      }
      rightContent={
        rightActionable && (
          <ListItem.Content style={[styles.actionContent, defaultRightStyle]}>
            {rightContent || defaultRightContent}
          </ListItem.Content>
        )
      }
      leftWidth={leftWidth}
      rightWidth={rightWidth}
      onLeftSwipe={leftAction}
      onRightSwipe={rightAction}
      onPress={onPress}
      bottomDivider={bottomDivider}
      containerStyle={[styles.container, containerStyle]}
      {...props}
    >
      {title && <ListItem.Title style={[styles.title, titleStyle]}>{title}</ListItem.Title>}
      {subtitle && (
        <ListItem.Subtitle style={[styles.subtitle, subtitleStyle]}>{subtitle}</ListItem.Subtitle>
      )}
    </ListItem.Swipeable>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
});

export default SwipeableListItem;
