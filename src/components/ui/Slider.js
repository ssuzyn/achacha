import React, { useState, useEffect, useCallback } from 'react';
import { Slider as RNESlider } from 'react-native-elements';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-elements';
import { Text } from './index';

/**
 * react-native-elements Slider의 defaultProps 경고를 방지하기 위한 래퍼 컴포넌트
 */
const SliderWrapper = ({
  value,
  minimumValue,
  maximumValue,
  step,
  onValueChange,
  onSlidingComplete,
  disabled,
  trackStyle,
  thumbStyle,
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  thumbProps,
  ...props
}) => {
  return (
    <RNESlider
      value={value}
      minimumValue={minimumValue}
      maximumValue={maximumValue}
      step={step}
      onValueChange={onValueChange}
      onSlidingComplete={onSlidingComplete}
      disabled={disabled}
      trackStyle={trackStyle}
      thumbStyle={thumbStyle}
      minimumTrackTintColor={minimumTrackTintColor}
      maximumTrackTintColor={maximumTrackTintColor}
      thumbTintColor={thumbTintColor}
      thumbProps={thumbProps}
      {...props}
    />
  );
};

/**
 * 슬라이더 컴포넌트
 */
const Slider = ({
  value,
  values = [0, 1, 2, 3, 7, 30, 60, 90], // 기존 코드와의 호환성을 위한 값 배열
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
  activeColor, // 기존 코드와의 호환성
  inactiveColor, // 기존 코드와의 호환성
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  valueTextStyle,
  labelTextStyle,
  minMaxTextStyle,
  showThumbLabel = true, // thumb에 값 표시 여부
  thumbLabelStyle, // thumb 라벨 스타일
  ...props
}) => {
  // 값 배열(values)이 제공된 경우 이를 처리하는 로직
  const useValueArray = values && values.length > 0;

  // 로컬 상태를 사용하여 슬라이더 위치 추적
  const [localValueIndex, setLocalValueIndex] = useState(0);
  const [displayValue, setDisplayValue] = useState(value);

  // 값이 변경될 때 로컬 상태 초기화
  useEffect(() => {
    if (useValueArray) {
      // 값을 배열에서 찾아 인덱스로 변환
      const valueIndex = Math.max(0, values.indexOf(value));
      setLocalValueIndex(valueIndex);
      setDisplayValue(value);
    } else {
      setLocalValueIndex(value);
      setDisplayValue(value);
    }
    console.log(`슬라이더 값 설정: ${value}`);
  }, [value, values, useValueArray]);

  // 조정값 텍스트 포맷 함수
  const formatAdjustmentText = val => {
    if (val === 0) return '당일';
    if (val === 1) return '1일 전';
    if (val === 2) return '2일 전';
    if (val === 3) return '3일 전';
    if (val === 7) return '일주일 전';
    if (val === 30) return '30일 전';
    if (val === 60) return '60일 전';
    if (val === 90) return '90일 전';
    return `${val}일 전`;
  };

  // values 배열을 사용하는 경우, min/max 값을 조정
  const effectiveMinValue = useValueArray ? 0 : minimumValue;
  const effectiveMaxValue = useValueArray ? values.length - 1 : maximumValue;

  const { theme } = useTheme();

  // 테마에서 색상 가져오기
  const primaryColor = theme.colors.primary;
  const backgroundColor = theme.colors.background;

  // 로컬 값 변경 핸들러 - 메모이제이션 및 로깅 추가
  const handleValueChange = useCallback(
    newValue => {
      console.log(`슬라이더 변경 중: ${newValue}, disabled: ${disabled}`);

      // 로컬 상태 업데이트로 UI 즉시 반응
      setLocalValueIndex(newValue);

      if (useValueArray) {
        // 가장 가까운 인덱스로 매핑
        const index = Math.round(newValue);
        const valueFromArray = values[index];
        setDisplayValue(valueFromArray);

        // 부모 컴포넌트에 값 전달
        if (onValueChange) {
          console.log(`부모에 값 전달: ${valueFromArray}`);
          onValueChange(valueFromArray);
        }
      } else {
        setDisplayValue(newValue);
        if (onValueChange) {
          onValueChange(newValue);
        }
      }
    },
    [disabled, onValueChange, useValueArray, values]
  );

  // 슬라이딩 완료 핸들러
  const handleSlidingComplete = useCallback(
    newValue => {
      console.log(`슬라이딩 완료: ${newValue}`);

      if (useValueArray) {
        const index = Math.round(newValue);
        const valueFromArray = values[index];

        if (onSlidingComplete) {
          onSlidingComplete(valueFromArray);
        }
      } else {
        if (onSlidingComplete) {
          onSlidingComplete(newValue);
        }
      }
    },
    [onSlidingComplete, useValueArray, values]
  );

  return (
    <View style={[styles.container, containerStyle]}>
      {/* 슬라이더 위에 중앙 정렬된 "당일 ~ [조정값]" 텍스트 */}
      <View style={styles.adjustmentTextContainer}>
        <Text variant="body1" weight="medium" color={primaryColor} style={styles.adjustmentText}>
          {displayValue === 0 ? '당일만' : `당일 ~ ${formatAdjustmentText(displayValue)}`}
        </Text>
      </View>

      <View style={styles.sliderArea}>
        <SliderWrapper
          value={localValueIndex}
          minimumValue={effectiveMinValue}
          maximumValue={effectiveMaxValue}
          step={useValueArray ? 1 : step} // values 배열 사용 시 정수 인덱스만 사용
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          disabled={disabled}
          trackStyle={[styles.track, trackStyle]}
          thumbStyle={[
            styles.thumb,
            { backgroundColor: thumbTintColor || '#A7DAF9' },
            thumbStyle,
            disabled && styles.disabledThumb,
          ]}
          minimumTrackTintColor={minimumTrackTintColor || primaryColor}
          maximumTrackTintColor={maximumTrackTintColor || inactiveColor || theme.colors.grey2}
          thumbTintColor={thumbTintColor || backgroundColor}
          thumbProps={{
            children:
              showThumbLabel && useValueArray ? (
                <View style={styles.thumbLabelContainer}>
                  <Text variant="caption" weight="bold" color="white" style={styles.thumbLabel}>
                    {displayValue}
                  </Text>
                </View>
              ) : null,
          }}
          {...props}
        />
      </View>

      {!useValueArray && showMinMax && (
        <View style={styles.minMaxContainer}>
          <Text variant="caption" color="grey5" style={[styles.minMaxText, minMaxTextStyle]}>
            {minimumValue}
          </Text>
          <Text variant="caption" color="grey5" style={[styles.minMaxText, minMaxTextStyle]}>
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
    marginVertical: 0,
  },
  sliderArea: {
    position: 'relative',
    paddingVertical: 2,
    marginHorizontal: 10, // 슬라이더 양쪽 여백
  },
  adjustmentTextContainer: {
    alignItems: 'center',
    marginBottom: 2,
  },
  adjustmentText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  thumb: {
    width: 30,
    height: 30,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  disabledThumb: {
    opacity: 0.7,
  },
  thumbLabelContainer: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 20, // 최소/최대값 컨테이너 여백
  },
  minMaxText: {
    fontSize: 12,
  },
});

export default Slider;
