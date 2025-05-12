import React, { useRef, useEffect } from 'react';
import { Animated, View, StyleSheet, Dimensions, Easing } from 'react-native';

const { width } = Dimensions.get('window');

const SearchingAnimation = ({ size = width * 0.3 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 4.0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0,
            duration: 1500,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.7,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale, opacity]);

  const innerCircleSize = size || width * 0.3;
  const outerCircleSize = innerCircleSize;

  return (
    <View style={[styles.container, { width: outerCircleSize * 4, height: outerCircleSize * 4 }]}>
      <Animated.View
        style={[
          styles.outerCircle,
          {
            width: outerCircleSize,
            height: outerCircleSize,
            borderRadius: outerCircleSize / 2,
            transform: [{ scale }],
            opacity,
          },
        ]}
      />
      <View
        style={[
          styles.innerCircle,
          {
            width: innerCircleSize,
            height: innerCircleSize,
            borderRadius: innerCircleSize / 2,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  outerCircle: {
    position: 'absolute',
    backgroundColor: '#4B92F6',
    opacity: 0.7,
  },
  innerCircle: {
    backgroundColor: '#2563EB',
  },
});

export default SearchingAnimation;
