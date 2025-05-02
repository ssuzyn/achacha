import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem, Icon, useTheme } from 'react-native-elements';

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
  const { theme } = useTheme();

  return (
    <ListItem.Swipeable
      leftContent={
        leftActionable && (
          <ListItem.Content
            style={[styles.actionContent, { backgroundColor: theme.colors.primary }, leftStyle]}
          >
            {leftContent ||
              (leftIcon && (
                <Icon
                  name={typeof leftIcon === 'string' ? leftIcon : 'edit'}
                  type="material"
                  color={theme.colors.white}
                  size={24}
                />
              ))}
          </ListItem.Content>
        )
      }
      rightContent={
        rightActionable && (
          <ListItem.Content
            style={[styles.actionContent, { backgroundColor: theme.colors.error }, rightStyle]}
          >
            {rightContent ||
              (rightIcon && (
                <Icon
                  name={typeof rightIcon === 'string' ? rightIcon : 'delete'}
                  type="material"
                  color={theme.colors.white}
                  size={24}
                />
              ))}
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
      {title && (
        <ListItem.Title style={[styles.title, { color: theme.colors.black }, titleStyle]}>
          {title}
        </ListItem.Title>
      )}
      {subtitle && (
        <ListItem.Subtitle style={[styles.subtitle, { color: theme.colors.grey5 }, subtitleStyle]}>
          {subtitle}
        </ListItem.Subtitle>
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
  },
  subtitle: {
    fontSize: 14,
  },
});

export default SwipeableListItem;
