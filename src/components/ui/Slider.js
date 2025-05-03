import React, { useState } from 'react';
import { Slider as RNESlider } from 'react-native-elements';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-elements';

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
  ...props
}) => {
  // 값 배열(values)이 제공된 경우 이를 처리하는 로직
  const useValueArray = values && values.length > 0;

  // values 배열이 제공된 경우, 해당 배열의 인덱스로 변환
  const [localIndex, setLocalIndex] = useState(() => {
    if (useValueArray) {
      const index = values.indexOf(value);
      return index !== -1 ? index : 0;
    }
    return 0;
  });

  // 초기 로컬 값 설정
  const [localValue, setLocalValue] = useState(useValueArray ? values[localIndex] : value);

  const { theme } = useTheme();

  // 로컬 값 변경 핸들러
  const handleValueChange = newValue => {
    if (useValueArray) {
      // values 배열을 사용하는 경우, 정확한 인덱스로 변환
      // 반올림하여 가장 가까운 스텝으로 이동
      const index = Math.round(newValue);
      const valueFromArray = values[index];

      setLocalIndex(index);
      setLocalValue(valueFromArray);
      onValueChange && onValueChange(valueFromArray);
    } else {
      // 일반 슬라이더로 사용하는 경우
      setLocalValue(newValue);
      onValueChange && onValueChange(newValue);
    }
  };

  // 슬라이딩 완료 핸들러
  const handleSlidingComplete = newValue => {
    if (useValueArray) {
      // 정확한 인덱스로 이동
      const index = Math.round(newValue);
      const valueFromArray = values[index];

      setLocalIndex(index);
      setLocalValue(valueFromArray);
      onSlidingComplete && onSlidingComplete(valueFromArray);
    } else {
      onSlidingComplete && onSlidingComplete(newValue);
    }
  };

  // 렌더링할 값 텍스트 결정
  const renderValueText = () => {
    if (renderValue) {
      return renderValue(localValue);
    }
    return localValue;
  };

  // values 배열을 사용하는 경우, min/max 값을 조정
  const effectiveMinValue = useValueArray ? 0 : minimumValue;
  const effectiveMaxValue = useValueArray ? values.length - 1 : maximumValue;

  // 테마에서 색상 가져오기
  const secondaryColor = theme.colors.secondary; // '#278CCC'
  const backgroundColor = theme.colors.background; // '#A7DAF9'

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.colors.black }, labelTextStyle]}>{label}</Text>
          {showValue && (
            <Text style={[styles.value, { color: secondaryColor }, valueTextStyle]}>
              {renderValueText()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.sliderArea}>
        {/* 슬라이더 위치에 스텝 마커 표시 */}
        {useValueArray && (
          <View style={styles.stepMarkersContainer}>
            {values.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepMarker,
                  {
                    left: `${(index / (values.length - 1)) * 100}%`,
                    backgroundColor:
                      index <= localIndex ? secondaryColor : inactiveColor || theme.colors.grey2,
                    transform: [{ translateX: -3 }],
                  },
                ]}
              />
            ))}
          </View>
        )}

        <RNESlider
          value={useValueArray ? localIndex : localValue}
          minimumValue={effectiveMinValue}
          maximumValue={effectiveMaxValue}
          step={useValueArray ? 1 : step} // values 배열 사용 시 정수 인덱스만 사용
          onValueChange={handleValueChange}
          onSlidingComplete={handleSlidingComplete}
          disabled={disabled}
          trackStyle={[styles.track, trackStyle]}
          thumbStyle={[
            styles.thumb,
            { backgroundColor: thumbTintColor || backgroundColor },
            thumbStyle,
          ]}
          minimumTrackTintColor={secondaryColor}
          maximumTrackTintColor={inactiveColor || theme.colors.grey2}
          thumbTintColor={backgroundColor}
          {...props}
        />
      </View>

      {/* values 배열 사용 시, 각 값 위치에 라벨 표시 */}
      {useValueArray && (
        <View style={styles.valuesContainer}>
          {values.map((val, index) => {
            // 각 값의 상대적 위치 계산
            const position = (index / (values.length - 1)) * 100;

            return (
              <Text
                key={index}
                style={[
                  styles.valueLabel,
                  {
                    left: `${position}%`,
                    color: index === localIndex ? secondaryColor : theme.colors.grey3,
                    fontWeight: index === localIndex ? 'bold' : 'normal',
                    transform: [{ translateX: -10 }],
                  },
                ]}
              >
                {val}
              </Text>
            );
          })}
        </View>
      )}

      {!useValueArray && showMinMax && (
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
  sliderArea: {
    position: 'relative',
    paddingTop: 8, // 마커 공간 확보
    paddingBottom: 8,
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
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  minMaxContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  minMaxText: {
    fontSize: 12,
  },
  valuesContainer: {
    flexDirection: 'row',
    width: '100%',
    position: 'relative',
    marginTop: 10,
    height: 20,
  },
  valueLabel: {
    fontSize: 12,
    position: 'absolute',
    textAlign: 'center',
    width: 20,
  },
  stepMarkersContainer: {
    flexDirection: 'row',
    width: '100%',
    position: 'absolute',
    top: 21, // 슬라이더 트랙 위치와 일치
    zIndex: 1,
    height: 6,
  },
  stepMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
    position: 'absolute',
    backgroundColor: '#ddd',
  },
});

export default Slider;
