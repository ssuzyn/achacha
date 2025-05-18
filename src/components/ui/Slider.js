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
  value, // 부모로부터 받은 실제 값 (e.g., 0, 1, 7, 30 ...)
  values = [0, 1, 2, 3, 7, 30, 60, 90], // 기존 코드와의 호환성을 위한 값 배열
  minimumValue = 0,
  maximumValue = 100,
  step = 1,
  onValueChange,
  onSlidingComplete,
  disabled = false,
  label,
  showValue = true, // 이 prop은 현재 직접 사용되지 않음
  showMinMax = false,
  renderValue, // 이 prop은 현재 직접 사용되지 않음
  trackStyle,
  thumbStyle,
  containerStyle,
  activeColor, // 기존 코드와의 호환성 (minimumTrackTintColor로 대체 권장)
  inactiveColor, // 기존 코드와의 호환성 (maximumTrackTintColor로 대체 권장)
  minimumTrackTintColor,
  maximumTrackTintColor,
  thumbTintColor,
  valueTextStyle, // 이 prop은 현재 직접 사용되지 않음
  labelTextStyle, // 이 prop은 현재 직접 사용되지 않음
  minMaxTextStyle,
  showThumbLabel = true, // thumb에 값 표시 여부
  thumbLabelStyle, // thumb 라벨 스타일 (현재 Text 컴포넌트 스타일로 커스텀)
  ...props
}) => {
  const useValueArray = values && values.length > 0;

  // localValueIndex는 슬라이더의 시각적 위치 (0부터 시작하는 인덱스 또는 min/max 범위 내 값)
  const [localValueIndex, setLocalValueIndex] = useState(() => {
    if (useValueArray) {
      const initialIndex = values.indexOf(value);
      return initialIndex !== -1 ? initialIndex : 0; // values 배열에 없으면 0번째 인덱스
    }
    return value; // 배열 사용 안하면 value 자체가 위치
  });

  const { theme } = useTheme();
  const primaryColor = theme.colors.primary;
  const backgroundColor = theme.colors.background; // thumbTintColor 기본값으로 사용

  // value prop (부모로부터 받은 값)이 변경되면 localValueIndex (슬라이더의 시각적 위치) 동기화
  useEffect(() => {
    let newLocalSliderPosition;
    if (useValueArray) {
      const valueIndexInArray = values.indexOf(value);
      newLocalSliderPosition = valueIndexInArray !== -1 ? valueIndexInArray : 0;
    } else {
      newLocalSliderPosition = value;
    }

    // 현재 슬라이더 위치와 다를 경우에만 업데이트하여 불필요한 재설정 방지
    if (localValueIndex !== newLocalSliderPosition) {
      setLocalValueIndex(newLocalSliderPosition);
    }
    // console.log(`Slider: value prop 변경됨 -> ${value}, localValueIndex 설정됨 -> ${newLocalSliderPosition}`);
  }, [value, values, useValueArray, localValueIndex]); // localValueIndex를 의존성 배열에 포함하여, newLocalSliderPosition과 다를 때만 set하도록 함

  // 조정값 텍스트 포맷 함수
  const formatAdjustmentText = useCallback(val => {
    if (val === 0) return '당일';
    if (val === 1) return '1일 전';
    if (val === 2) return '2일 전';
    if (val === 3) return '3일 전';
    if (val === 7) return '일주일 전';
    if (val === 30) return '30일 전';
    if (val === 60) return '60일 전';
    if (val === 90) return '90일 전';
    return `${val}일 전`;
  }, []);

  // 슬라이더 값 변경 중 호출 (사용자 드래그)
  const handleValueChange = useCallback(
    sliderPosition => {
      // sliderPosition은 RNESlider에서 오는 값 (0부터 시작하는 인덱스 또는 min/max 범위 내 값)
      // console.log(`Slider: 변경 중 - sliderPosition: ${sliderPosition}, disabled: ${disabled}`);
      setLocalValueIndex(sliderPosition); // 슬라이더 thumb의 시각적 위치 즉시 업데이트

      let actualChangedValue;
      if (useValueArray) {
        const index = Math.round(sliderPosition); // 가장 가까운 정수 인덱스로 매핑
        actualChangedValue =
          values[index < 0 ? 0 : index >= values.length ? values.length - 1 : index]; // 배열 범위 보호
      } else {
        actualChangedValue = sliderPosition;
      }

      if (onValueChange) {
        // console.log(`Slider: 부모에게 onValueChange 전달 -> ${actualChangedValue}`);
        onValueChange(actualChangedValue);
      }
    },
    [disabled, onValueChange, useValueArray, values]
  );

  // 슬라이딩 완료 시 호출
  const handleSlidingComplete = useCallback(
    finalSliderPosition => {
      // console.log(`Slider: 슬라이딩 완료 - finalSliderPosition: ${finalSliderPosition}`);
      let actualFinalValue;
      if (useValueArray) {
        const index = Math.round(finalSliderPosition);
        actualFinalValue =
          values[index < 0 ? 0 : index >= values.length ? values.length - 1 : index]; // 배열 범위 보호
      } else {
        actualFinalValue = finalSliderPosition;
      }

      if (onSlidingComplete) {
        onSlidingComplete(actualFinalValue);
      }
    },
    [onSlidingComplete, useValueArray, values]
  );

  // values 배열을 사용하는 경우, 슬라이더의 min/max 값을 인덱스 기준으로 조정
  const effectiveMinValue = useValueArray ? 0 : minimumValue;
  const effectiveMaxValue = useValueArray ? values.length - 1 : maximumValue;
  // values 배열 사용 시 step은 항상 1 (인덱스 이동)
  const effectiveStep = useValueArray ? 1 : step;

  // 렌더링에 사용될 현재 값 (부모로부터 받은 `value` prop)
  const currentValueToDisplay = value;

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <Text variant="label" style={[styles.labelText, labelTextStyle]}>
          {label}
        </Text>
      )}
      <View style={styles.adjustmentTextContainer}>
        <Text variant="body1" weight="medium" color={primaryColor} style={styles.adjustmentText}>
          {currentValueToDisplay === 0
            ? '당일만'
            : `당일 ~ ${formatAdjustmentText(currentValueToDisplay)}`}
        </Text>
      </View>

      <View style={styles.sliderArea}>
        <SliderWrapper
          value={localValueIndex} // 슬라이더 thumb의 시각적 위치는 localValueIndex 사용
          minimumValue={effectiveMinValue}
          maximumValue={effectiveMaxValue}
          step={effectiveStep}
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          disabled={disabled}
          trackStyle={[styles.track, trackStyle]}
          thumbStyle={[
            styles.thumb,
            { backgroundColor: thumbTintColor || '#A7DAF9' }, // 기본 thumb 색상
            thumbStyle,
            disabled && styles.disabledThumb,
          ]}
          minimumTrackTintColor={minimumTrackTintColor || activeColor || primaryColor}
          maximumTrackTintColor={maximumTrackTintColor || inactiveColor || theme.colors.grey2}
          thumbTintColor={thumbTintColor || backgroundColor} // RNESlider의 thumbTintColor는 thumb 배경색이 아님. thumbStyle로 제어.
          thumbProps={{
            children: showThumbLabel ? (
              <View style={styles.thumbLabelContainer}>
                <Text
                  variant="caption"
                  weight="bold"
                  color="white"
                  style={[styles.thumbLabel, thumbLabelStyle]}
                >
                  {currentValueToDisplay}
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
    marginVertical: 0, // 기본 마진 제거 (SettingScreen에서 제어)
  },
  labelText: {
    // label prop 사용 시 스타일
    marginBottom: 8,
    fontSize: 14,
    color: '#333',
  },
  sliderArea: {
    position: 'relative',
    paddingVertical: 2, // 슬라이더 영역 패딩 조정
    marginHorizontal: 10, // 슬라이더 양쪽 여백 유지
  },
  adjustmentTextContainer: {
    alignItems: 'center',
    marginBottom: 2, // 상단 텍스트와 슬라이더 간 간격
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
    width: 30, // Thumb 크기 조정
    height: 30, // Thumb 크기 조정
    borderRadius: 15, // 원형 Thumb
    // backgroundColor: '#A7DAF9', // thumbStyle prop 또는 thumbTintColor로 설정
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  disabledThumb: {
    // backgroundColor: '#E0E0E0', // 비활성 시 Thumb 색상 (옵션)
    opacity: 0.7, // 비활성 시 Thumb 투명도
  },
  thumbLabelContainer: {
    // position: 'absolute', // RNESlider thumbProps children은 이미 중앙 정렬됨
    width: '100%', // 부모(thumb) 크기에 맞춤
    height: '100%', // 부모(thumb) 크기에 맞춤
    justifyContent: 'center',
    alignItems: 'center',
    // backgroundColor: 'transparent', // 기본 투명
  },
  thumbLabel: {
    fontSize: 14, // Thumb 내부 텍스트 크기
    fontWeight: 'bold',
    color: '#FFFFFF', // Thumb 내부 텍스트 색상
    textAlign: 'center',
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 20, // 최소/최대값 텍스트 컨테이너 여백 유지
  },
  minMaxText: {
    fontSize: 12,
  },
});

export default Slider;
