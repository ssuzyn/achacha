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
    // 메인 탭바로 이동 후, 쉐어박스 탭으로 이동
    navigation.navigate('Main', {
      screen: 'TabSharebox',
    });
  };

  const handleGoToManagement = () => {
    // 메인 탭바로 이동 후, 기프티콘 관리 탭으로 이동
    navigation.navigate('Main', {
      screen: 'TabGifticonManage',
    });
  };

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
          <Image source={giveawayShareboxImg} style={[styles.iconImage, styles.shareboxImage]} />
          <Text style={styles.iconText}>쉐어박스</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={handleGoToManagement}
          style={[styles.iconButton, styles.managementPosition]}
        >
          <Image
            source={giveawayManagementImg}
            style={[styles.iconImage, styles.managementImage]}
          />
          <Text style={styles.iconText}>기프티콘 관리</Text>
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
    bottom: -20,
    right: -12,
  },
  iconImage: {
    resizeMode: 'contain',
    marginBottom: 12,
  },
  shareboxImage: {
    width: 130,
    height: 130,
  },
  managementImage: {
    width: 140,
    height: 140,
  },
  iconText: {
    fontSize: 18,
    fontFamily: 'Pretendard-Medium',
    color: '#333',
    textAlign: 'center',
  },
  tooltipContainer: {
    position: 'absolute',
    top: -150,
    width: '100%',
    alignItems: 'center',
    zIndex: 10,
  },
  tooltipBubble: {
    backgroundColor: '#E8F6FF',
    paddingHorizontal: 60,
    paddingVertical: 15,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  tooltipText: {
    color: '#687278',
    fontSize: 19,
    fontFamily: 'Pretendard-Medium',
    textAlign: 'center',
    lineHeight: 28,
  },
});

export default NoUsersScreen;
