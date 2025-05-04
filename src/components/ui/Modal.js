import React from 'react';
import { Overlay } from 'react-native-elements';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-elements';
import { Text } from './index';

/**
 * 모달 컴포넌트
 */
export const Modal = ({
  isVisible,
  onBackdropPress,
  children,
  title,
  closeButton = true,
  width = '90%',
  height,
  padding = 20,
  backdropOpacity = 0.7,
  animationType = 'fade',
  closeButtonPosition = 'right',
  headerStyle,
  contentStyle,
  containerStyle,
  onClose,
}) => {
  const { theme } = useTheme();

  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onBackdropPress || onClose}
      overlayStyle={[
        styles.overlay,
        { width, height: height || 'auto', padding: 0, backgroundColor: theme.colors.white },
        containerStyle,
      ]}
      backdropStyle={{ opacity: backdropOpacity }}
      animationType={animationType}
    >
      <View style={styles.container}>
        {title && (
          <View style={[styles.header, { borderBottomColor: theme.colors.grey1 }, headerStyle]}>
            <Text variant="subtitle1" weight="bold" style={styles.title}>
              {title}
            </Text>
            {closeButton && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  closeButtonPosition === 'left' && styles.closeButtonLeft,
                ]}
                onPress={onClose || onBackdropPress}
              >
                <Text variant="body1" color="grey5" style={styles.closeButtonText}>
                  ✕
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={[styles.content, { padding }, contentStyle]}>{children}</View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonLeft: {
    right: 'auto',
    left: 16,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'normal',
  },
  content: {
    flex: 1,
  },
});

export default Modal;
