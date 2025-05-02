import React, { useState } from 'react';
import { Slider as RNESlider } from 'react-native-elements';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-elements';

/**
 * 슬라이더 컴포넌트
 */
export const Slider = ({
  value,
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  label,
  showValue = true,
  showMinMax = false,
  renderValue,
  trackStyle,
  thumbStyle,
  containerStyle,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  valueTextStyle,
  labelTextStyle,
  minMaxTextStyle,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value);
  const { theme } = useTheme();

  // 로컬 값 변경 핸들러
  const handleValueChange = newValue => {
    setLocalValue(newValue);
    onValueChange && onValueChange(newValue);
  };

  // 렌더링할 값 텍스트 결정
  const renderValueText = () => {
    if (renderValue) {
      return renderValue(localValue);
    }
    return localValue;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.colors.black }, labelTextStyle]}>{label}</Text>
          {showValue && (
            <Text style={[styles.value, { color: theme.colors.primary }, valueTextStyle]}>
              {renderValueText()}
            </Text>
          )}
        </View>
      )}

      <RNESlider
        value={localValue}
        minimumValue={minimumValue}
        maximumValue={maximumValue}
        step={step}
        onValueChange={handleValueChange}
        onSlidingComplete={onSlidingComplete}
        disabled={disabled}
        trackStyle={[styles.track, trackStyle]}
        thumbStyle={[
          styles.thumb,
          { backgroundColor: thumbTintColor || theme.colors.primary },
          thumbStyle,
        ]}
        minimumTrackTintColor={minimumTrackTintColor || theme.colors.primary}
        maximumTrackTintColor={maximumTrackTintColor || theme.colors.grey2}
        thumbTintColor={thumbTintColor || theme.colors.primary}
        {...props}
      />

      {showMinMax && (
        <View style={styles.minMaxContainer}>
          <Text style={[styles.minMaxText, { color: theme.colors.grey5 }, minMaxTextStyle]}>
            {minimumValue}
          </Text>
          <Text style={[styles.minMaxText, { color: theme.colors.grey5 }, minMaxTextStyle]}>
            {maximumValue}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 10,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMaxText: {
    fontSize: 12,
  },
});

export default Slider;
