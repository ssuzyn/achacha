import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Text, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// 사용자가 없을 때 표시할 이미지
const giveawayManagementImg = require('../../assets/images/giveaway_management.png');
const giveawayShareboxImg = require('../../assets/images/giveaway_sharebox.png');

const NoUsersScreen = () => {
  const navigation = useNavigation();
  const [showTooltip, setShowTooltip] = useState(true);

  const handleGoToShareBox = () => {
    navigation.navigate('BoxMain');
  };

  const handleGoToManagement = () => {
    navigation.navigate('ManageList');
  };

  useEffect(() => {
    // 3초 후에 툴팁 숨기기
    const timer = setTimeout(() => {
      setShowTooltip(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.noUsersContainer}>
      {showTooltip && (
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltipBubble}>
            <Text style={styles.tooltipText}>
              주변에 사용자가 없습니다.{'\n'}다음에 다시 시도해주세요.
            </Text>
          </View>
        </View>
      )}

      <View style={styles.circleContainer}>
        <TouchableOpacity
          onPress={handleGoToShareBox}
          style={[styles.iconButton, styles.shareboxPosition]}
        >
          <Image source={giveawayShareboxImg} style={styles.iconImage} />
          <Text style={styles.iconText}>쉐어박스</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoToManagement}
          style={[styles.iconButton, styles.managementPosition]}
        >
          <Image source={giveawayManagementImg} style={styles.iconImage} />
          <Text style={styles.iconText}>기프티콘</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  noUsersContainer: {
    position: 'absolute',
    width: width,
    height: width * 0.7,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleContainer: {
    width: width * 0.9,
    height: width * 0.9,
    position: 'relative',
  },
  iconButton: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
  },
  shareboxPosition: {
    top: 0,
    left: 0,
  },
  managementPosition: {
    bottom: 0,
    right: -13,
  },
  iconImage: {
    width: 140,
    height: 140,
    resizeMode: 'contain',
    marginBottom: 12,
  },
  iconText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    textAlign: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    top: '1%',
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBubble: {
    backgroundColor: 'rgba(85, 85, 85, 0.6)',
    paddingHorizontal: 50,
    paddingVertical: 18,
    borderRadius: 20,
  },
  tooltipText: {
    color: 'white',
    fontSize: 19,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    lineHeight: 24,
  },
});

export default NoUsersScreen;
