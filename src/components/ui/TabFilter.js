import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import useTheme from '../../hooks/useTheme';

/**
 * 탭 형태의 필터 컴포넌트
 * @param {Array} tabs - 표시할 탭 목록 (배열 형태: [{id: string, title: string}])
 * @param {Function} onTabChange - 탭 변경 시 호출될 함수 (선택된 탭 ID를 인자로 받음)
 * @param {String} initialTabId - 초기 선택 탭 ID (기본값: 첫 번째 탭)
 * @param {Object} containerStyle - 컨테이너에 적용할 스타일
 */
const TabFilter = ({ tabs = [], onTabChange, initialTabId, containerStyle }) => {
  const { theme, colors } = useTheme();
  const [selectedTabId, setSelectedTabId] = useState(initialTabId || tabs[0]?.id || '');

  const handleTabPress = tabId => {
    setSelectedTabId(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {tabs.map(tab => {
        const isSelected = tab.id === selectedTabId;
        return (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tab,
              {
                borderColor: isSelected ? colors.primary : colors.grey2,
                borderWidth: 2,
              },
            ]}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            <View style={styles.textContainer}>
              <Text
                style={[
                  styles.tabText,
                  theme.Chip.titleStyle,
                  {
                    fontSize: 15,
                    color: isSelected ? colors.black : colors.grey3,
                  },
                ]}
              >
                {tab.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'flex-start',
  },
  tab: {
    height: 45,
    paddingHorizontal: 18,
    borderRadius: 15,
    marginRight: 10,
    backgroundColor: 'white',
  },
  textContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabText: {
    fontWeight: '500',
  },
});

export default TabFilter;
