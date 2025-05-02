import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../hooks/useTheme';

/**
 * 카테고리 탭 컴포넌트
 * @param {Array} categories - 카테고리 항목 배열 [{id: string, name: string}, ...]
 * @param {string} selectedId - 현재 선택된 카테고리 id
 * @param {Function} onSelectCategory - 카테고리 선택 시 호출되는 콜백 함수
 */
const CategoryTabs = ({ categories = [], selectedId, onSelectCategory }) => {
  const { colors } = useTheme();
  const [selected, setSelected] = useState(
    selectedId || (categories.length > 0 ? categories[0].id : null)
  );

  // 카테고리 선택 핸들러
  const handleSelectCategory = categoryId => {
    setSelected(categoryId);
    if (onSelectCategory) {
      onSelectCategory(categoryId);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.primary }]}>
      {categories.map(category => {
        const isSelected = selected === category.id;
        return (
          <TouchableOpacity
            key={category.id}
            style={styles.tab}
            onPress={() => handleSelectCategory(category.id)}
            activeOpacity={0.7}
          >
            {isSelected ? (
              <View style={[styles.activeTabIndicator, { backgroundColor: colors.secondary }]}>
                <Text style={[styles.tabText, { color: colors.white }]}>{category.name}</Text>
              </View>
            ) : (
              <Text style={[styles.tabText, { color: colors.white }]}>{category.name}</Text>
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    overflow: 'hidden',
    marginHorizontal: 0,
    marginVertical: 0,
    height: 50,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    paddingBottom: 2,
  },
  activeTabIndicator: {
    width: '90%',
    height: '80%',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: 20,
  },
});

export default CategoryTabs;
