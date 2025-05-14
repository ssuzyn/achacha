import React from 'react';
import { Divider as RNEDivider, Overlay as RNEOverlay } from 'react-native-elements';

/**
 * React Native Elements의 Divider 컴포넌트에 대한 래퍼
 * defaultProps 경고를 방지하기 위해 필요한 기본값을 직접 props에 지정
 */
export const Divider = ({
  orientation = 'horizontal',
  insetType = 'left',
  inset = false,
  ...props
}) => {
  return <RNEDivider orientation={orientation} insetType={insetType} inset={inset} {...props} />;
};

/**
 * React Native Elements의 Overlay 컴포넌트에 대한 래퍼
 * defaultProps 경고를 방지하기 위해 필요한 기본값을 직접 props에 지정
 */
export const Overlay = ({
  isVisible = false,
  fullScreen = false,
  ModalComponent = null,
  statusBarTranslucent = false,
  backdropStyle = {},
  overlayStyle = {},
  onBackdropPress = () => {},
  onLongPress = null,
  children,
  ...props
}) => {
  return (
    <RNEOverlay
      isVisible={isVisible}
      fullScreen={fullScreen}
      ModalComponent={ModalComponent}
      statusBarTranslucent={statusBarTranslucent}
      backdropStyle={backdropStyle}
      overlayStyle={overlayStyle}
      onBackdropPress={onBackdropPress}
      onLongPress={onLongPress}
      {...props}
    >
      {children}
    </RNEOverlay>
  );
};
