import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { View } from 'react-native';
import { Text } from '../../components/ui';

/**
 * 카테고리 탭 컴포넌트
 * @param {Array} categories - 카테고리 항목 배열 [{id: string, name: string}, ...]
 * @param {string} selectedId - 현재 선택된 카테고리 id
 * @param {Function} onSelectCategory - 카테고리 선택 시 호출되는 콜백 함수
 */
const CategoryTabs = ({ categories = [], selectedId, onSelectCategory }) => {
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
    <View style={styles.outerContainer}>
      <View style={styles.container}>
        {categories.map(category => {
          const isSelected = selected === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              style={styles.tab}
              onPress={() => handleSelectCategory(category.id)}
              activeOpacity={0.8}
            >
              <View style={[styles.tabInner, isSelected ? styles.selectedTabInner : null]}>
                <Text style={styles.tabText} color="white" weight={isSelected ? 'bold' : 'medium'}>
                  {category.name}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    backgroundColor: '#56AEE9',
    borderRadius: 12,
    padding: 3,
    margin: 12,
    marginBottom: 2,
    marginHorizontal: 0,
    width: '100%',
  },
  container: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: '#56AEE9',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tabInner: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectedTabInner: {
    backgroundColor: '#278CCC',
  },
  tabText: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: 'white',
  },
});

export default CategoryTabs;
