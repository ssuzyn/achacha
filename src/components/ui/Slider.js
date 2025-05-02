import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, PanResponder } from 'react-native';
import { useTheme } from 'react-native-elements';

/**
 * 커스텀 슬라이더 컴포넌트
 * 지정된 값에만 동그라미 표시하고 드래그로 슬라이드 가능
 */
export const Slider = ({
  value,
  values = [0, 1, 2, 3, 7, 30, 60, 90], // 기본 값 배열
  onValueChange,
  disabled = false,
  label,
  showValue = true,
  renderValue,
  containerStyle,
  valueTextStyle,
  labelTextStyle,
  activeColor,
  inactiveColor,
  ...props
}) => {
  const { theme } = useTheme();
  const [localValue, setLocalValue] = useState(value);
  const [activeIndex, setActiveIndex] = useState(0);
  const sliderWidth = useRef(0);

  // 초기값 설정 및 변경 시 activeIndex 업데이트
  useEffect(() => {
    const index = values.indexOf(value);
    if (index !== -1) {
      setActiveIndex(index);
      setLocalValue(value);
    } else {
      // 가장 가까운 값 찾기
      const closestIndex = findClosestValueIndex(value, values);
      setActiveIndex(closestIndex);
      setLocalValue(values[closestIndex]);
    }
  }, [value, values]);

  // 가장 가까운 값의 인덱스 찾기
  const findClosestValueIndex = (val, arr) => {
    let closest = 0;
    let minDiff = Math.abs(val - arr[0]);

    for (let i = 1; i < arr.length; i++) {
      const diff = Math.abs(val - arr[i]);
      if (diff < minDiff) {
        minDiff = diff;
        closest = i;
      }
    }

    return closest;
  };

  // 위치에서 인덱스 계산
  const getIndexFromPosition = positionX => {
    if (sliderWidth.current === 0) return 0;

    // 슬라이더 내 상대적 위치 계산 (0~1 사이 값)
    const ratio = Math.max(0, Math.min(1, positionX / sliderWidth.current));

    // 가장 가까운 인덱스 찾기
    const exactIndex = ratio * (values.length - 1);
    return Math.round(exactIndex);
  };

  // 팬 제스처 핸들러 설정
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !disabled,
      onMoveShouldSetPanResponder: () => !disabled,
      onPanResponderGrant: (evt, gestureState) => {
        // 터치 시작 위치에서 가장 가까운 인덱스 계산
        const touchX = evt.nativeEvent.locationX;
        const newIndex = getIndexFromPosition(touchX);
        updateValue(newIndex);
      },
      onPanResponderMove: (evt, gestureState) => {
        // 드래그 위치에서 가장 가까운 인덱스 계산
        const touchX = Math.max(
          0,
          Math.min(
            sliderWidth.current,
            gestureState.moveX - evt.nativeEvent.locationX + gestureState.dx
          )
        );
        const newIndex = getIndexFromPosition(touchX);
        updateValue(newIndex);
      },
      onPanResponderRelease: () => {
        // 터치 종료
      },
    })
  ).current;

  // 값 업데이트 함수
  const updateValue = index => {
    if (index !== activeIndex) {
      setActiveIndex(index);
      const newValue = values[index];
      setLocalValue(newValue);
      onValueChange && onValueChange(newValue);
    }
  };

  // 마커 클릭 핸들러
  const handleMarkerPress = index => {
    if (disabled) return;
    updateValue(index);
  };

  // 렌더링할 값 텍스트 결정
  const renderValueText = () => {
    if (renderValue) {
      return renderValue(localValue);
    }
    return localValue;
  };

  // 활성화/비활성화 색상 설정
  const activeTrackColor = activeColor || theme.colors.secondary || '#278CCC';
  const inactiveTrackColor = inactiveColor || '#E4E4E4';
  const activeBubbleColor = '#B3DEFF';
  const inactiveBubbleColor = '#E4E4E4';
  const textColor = '#8A8A8F';
  const activeTextColor = theme.colors.secondary || '#278CCC';

  // 라벨 간격 계산을 위한 함수
  const getLabelPosition = index => {
    const basePosition = (index / (values.length - 1)) * 85 + 10;

    // 간격 조정 (작은 값으로 설정)
    const spacing = 0.3; // 아주 작은 값 (%)

    // 첫 번째와 마지막 라벨은 위치 그대로 유지, 나머지는 간격 조절
    if (index === 0) return basePosition;
    if (index === values.length - 1) return basePosition;

    // 중간 값들은 인덱스에 따라 좌우로 약간 이동
    const middleIndex = Math.floor((values.length - 1) / 2);
    if (index < middleIndex) {
      return basePosition - (middleIndex - index) * spacing;
    } else if (index > middleIndex) {
      return basePosition + (index - middleIndex) * spacing;
    }
    return basePosition;
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={[styles.label, { color: theme.colors.black }, labelTextStyle]}>{label}</Text>
          {showValue && (
            <Text style={[styles.value, { color: activeTrackColor }, valueTextStyle]}>
              {renderValueText()}
            </Text>
          )}
        </View>
      )}

      <View style={styles.sliderWrapper}>
        <View
          style={styles.sliderContainer}
          onLayout={e => {
            sliderWidth.current = e.nativeEvent.layout.width;
          }}
          {...panResponder.panHandlers}
        >
          {/* 트랙 배경 */}
          <View
            style={[
              styles.track,
              {
                backgroundColor: inactiveTrackColor,
                width: '85%',
                marginLeft: '10%',
                marginRight: '5%',
              },
            ]}
          />

          {/* 활성화된 트랙 */}
          <View
            style={[
              styles.activeTrack,
              {
                width: `${(activeIndex / (values.length - 1)) * 85}%`,
                backgroundColor: activeTrackColor,
                marginLeft: '10%',
              },
            ]}
          />

          {/* 마커들 */}
          <View style={styles.markersContainer}>
            {values.map((markerValue, index) => {
              const isCurrentActive = index === activeIndex;
              const shouldShowMarker = index >= activeIndex;

              if (!shouldShowMarker) {
                return null;
              }

              return (
                <TouchableOpacity
                  key={index}
                  activeOpacity={disabled ? 1 : 0.7}
                  onPress={() => handleMarkerPress(index)}
                  style={[
                    styles.markerTouchable,
                    { left: `${(index / (values.length - 1)) * 85 + 10}%` },
                  ]}
                >
                  <View
                    style={[
                      styles.marker,
                      {
                        backgroundColor: isCurrentActive ? activeBubbleColor : inactiveBubbleColor,
                        width: isCurrentActive ? 18 : 6,
                        height: isCurrentActive ? 18 : 6,
                        borderRadius: isCurrentActive ? 9 : 3,
                        transform: [{ translateX: isCurrentActive ? -8 : -2 }],
                      },
                    ]}
                  />
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* 값 라벨 */}
        <View style={styles.valuesContainer}>
          {values.map((val, index) => (
            <Text
              key={index}
              style={[
                styles.valueLabel,
                {
                  left: `${getLabelPosition(index)}%`,
                  color: index === activeIndex ? activeTextColor : textColor,
                  transform: [{ translateX: -2 }],
                },
              ]}
            >
              {val}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  sliderWrapper: {
    paddingTop: 8,
    paddingBottom: 0,
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  sliderContainer: {
    position: 'relative',
    height: 20,
    justifyContent: 'center',
    width: '100%',
  },
  track: {
    width: '100%',
    height: 3,
    borderRadius: 0,
    position: 'absolute',
  },
  activeTrack: {
    height: 3,
    borderRadius: 0,
    position: 'absolute',
    left: 0,
  },
  markersContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  markerTouchable: {
    position: 'absolute',
    padding: 8,
    zIndex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 8,
    height: 8,
    borderRadius: 4,
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
    color: '#8A8A8F',
    width: 16,
  },
});

export default Slider;
