import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-elements';
import { Text, Overlay } from './index';

/**
 * 알림 다이얼로그 컴포넌트
 */
export const AlertDialog = ({
  isVisible,
  onBackdropPress,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  type = 'info', // info, success, warning, error
  hideCancel = false,
}) => {
  const { theme } = useTheme();

  // 타입에 따른 버튼 색상 매핑
  const getButtonColor = () => {
    const typeToColorMap = {
      info: theme.colors.primary,
      success: theme.colors.success,
      warning: theme.colors.error,
      error: theme.colors.error,
    };

    return typeToColorMap[type] || typeToColorMap.info;
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onBackdropPress} overlayStyle={styles.overlay}>
      <View style={styles.container}>
        <Text variant="subtitle1" weight="bold" style={styles.title}>
          {title}
        </Text>
        {message && (
          <Text variant="body2" color="grey5" style={styles.message}>
            {message}
          </Text>
        )}

        <View style={[styles.buttonContainer, hideCancel && styles.singleButtonContainer]}>
          {!hideCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.grey1 }]}
              onPress={onCancel}
            >
              <Text variant="button" color="grey5" style={styles.cancelText}>
                {cancelText}
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              { backgroundColor: getButtonColor() },
              hideCancel && styles.fullWidthButton,
            ]}
            onPress={onConfirm}
          >
            <Text variant="button" color="white" style={styles.confirmText}>
              {confirmText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Overlay>
  );
};

const styles = StyleSheet.create({
  overlay: {
    width: '80%',
    borderRadius: 10,
    padding: 0,
    backgroundColor: 'white',
  },
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  message: {
    fontSize: 14,
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  singleButtonContainer: {
    justifyContent: 'flex-end',
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullWidthButton: {
    width: '100%',
  },
  cancelButton: {
    marginRight: 10,
  },
  cancelText: {
    fontWeight: '500',
  },
  confirmText: {
    fontWeight: '500',
  },
});

export default AlertDialog;
