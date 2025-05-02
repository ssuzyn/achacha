import React from 'react';
import { Overlay } from 'react-native-elements';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from 'react-native-elements';

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
  const buttonColorMap = {
    info: theme.colors.secondary,
    success: theme.colors.success,
    warning: theme.colors.warning,
    error: theme.colors.error,
  };

  return (
    <Overlay isVisible={isVisible} onBackdropPress={onBackdropPress} overlayStyle={styles.overlay}>
      <View style={styles.container}>
        <Text style={[styles.title, { color: theme.colors.black }]}>{title}</Text>
        {message && <Text style={[styles.message, { color: theme.colors.grey5 }]}>{message}</Text>}

        <View style={[styles.buttonContainer, hideCancel && styles.singleButtonContainer]}>
          {!hideCancel && (
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, { backgroundColor: theme.colors.grey1 }]}
              onPress={onCancel}
            >
              <Text style={[styles.cancelText, { color: theme.colors.grey5 }]}>{cancelText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              { backgroundColor: buttonColorMap[type] || buttonColorMap.info },
              hideCancel && styles.fullWidthButton,
            ]}
            onPress={onConfirm}
          >
            <Text style={[styles.confirmText, { color: theme.colors.white }]}>{confirmText}</Text>
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
