import React from 'react';
import { Overlay } from 'react-native-elements';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';

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
  return (
    <Overlay
      isVisible={isVisible}
      onBackdropPress={onBackdropPress || onClose}
      overlayStyle={[
        styles.overlay,
        { width, height: height || 'auto', padding: 0 },
        containerStyle,
      ]}
      backdropStyle={{ opacity: backdropOpacity }}
      animationType={animationType}
    >
      <View style={styles.container}>
        {title && (
          <View style={[styles.header, headerStyle]}>
            <Text style={styles.title}>{title}</Text>
            {closeButton && (
              <TouchableOpacity
                style={[
                  styles.closeButton,
                  closeButtonPosition === 'left' && styles.closeButtonLeft,
                ]}
                onPress={onClose || onBackdropPress}
              >
                <Text style={styles.closeButtonText}>✕</Text>
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
    backgroundColor: 'white',
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
    borderBottomColor: '#EEEEEE',
    position: 'relative',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333333',
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
    color: '#666666',
    fontWeight: 'normal',
  },
  content: {
    flex: 1,
  },
});

export default Modal;
