import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../theme';

const ICON_SIZE = 28; // 아이콘 크기 상수
const ICON_MARGIN_RIGHT = 5; // 아이콘 오른쪽 마진 상수

const PermissionItem = ({ iconName, title, description }) => (
  <View style={styles.permissionItemContainer}>
    {/* 상단 행: 아이콘 + 제목 */}
    <View style={styles.itemTopRow}>
      <MaterialIcons name={iconName} size={ICON_SIZE} style={styles.icon} />
      <Text style={styles.permissionTitle}>{title}</Text>
    </View>
    {/* 하단 행: 설명 */}
    <Text style={styles.permissionDescription}>{description}</Text>
  </View>
);

const styles = StyleSheet.create({
  permissionItemContainer: {
    marginBottom: 25,
    alignItems: 'flex-start', // 왼쪽 정렬 유지
    width: '90%', // 너비 유지
  },
  itemTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  icon: {
    color: theme.colors.textSecondary,
    marginRight: ICON_MARGIN_RIGHT,
  },
  permissionTitle: {
    ...theme.typography.labelStyles.large,
    color: theme.colors.text,
  },
  permissionDescription: {
    ...theme.typography.bodyStyles.medium,
    color: theme.colors.textSecondary,
    textAlign: 'left', // 왼쪽 정렬 유지
  },
});

export default PermissionItem;
