import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { View } from 'react-native';
import { Button, Text } from '../../components/ui';
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
          <Button
            key={category.id}
            style={styles.tab}
            onPress={() => handleSelectCategory(category.id)}
            variant="ghost"
          >
            {isSelected ? (
              <View style={[styles.activeTabIndicator, { backgroundColor: colors.secondary }]}>
                <Text variant="button" style={styles.tabText} color="white">
                  {category.name}
                </Text>
              </View>
            ) : (
              <Text variant="button" style={styles.tabText} color="white">
                {category.name}
              </Text>
            )}
          </Button>
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
    backgroundColor: 'transparent',
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
