import React from 'react';
import { Overlay } from 'react-native-elements';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

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
  return (
    <Overlay isVisible={isVisible} onBackdropPress={onBackdropPress} overlayStyle={styles.overlay}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        {message && <Text style={styles.message}>{message}</Text>}

        <View style={[styles.buttonContainer, hideCancel && styles.singleButtonContainer]}>
          {!hideCancel && (
            <TouchableOpacity style={[styles.button, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelText}>{cancelText}</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={[
              styles.button,
              styles.confirmButton,
              styles[`${type}Button`],
              hideCancel && styles.fullWidthButton,
            ]}
            onPress={onConfirm}
          >
            <Text style={styles.confirmText}>{confirmText}</Text>
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
    color: '#333',
  },
  message: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#F2F2F2',
    marginRight: 10,
  },
  confirmButton: {
    backgroundColor: '#278CCC',
  },
  infoButton: {
    backgroundColor: '#278CCC',
  },
  successButton: {
    backgroundColor: '#28a745',
  },
  warningButton: {
    backgroundColor: '#ffc107',
  },
  errorButton: {
    backgroundColor: '#dc3545',
  },
  cancelText: {
    color: '#333',
    fontWeight: '500',
  },
  confirmText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default AlertDialog;
