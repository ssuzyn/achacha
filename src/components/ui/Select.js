import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

/**
 * 셀렉트(드롭다운) 컴포넌트
 */
export const Select = ({
  items = [],
  value,
  onChange,
  placeholder = '선택하세요',
  label,
  multiple = false,
  disabled = false,
  error,
  helper,
  searchable = false,
  variant = 'outline', // outline, filled, underlined
  size = 'md', // sm, md, lg
  containerStyle,
  dropDownContainerStyle,
  labelStyle,
  textStyle,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const [localItems, setLocalItems] = useState(items);

  // 값 변경 핸들러
  const handleValueChange = selectedValue => {
    setLocalValue(selectedValue);
    onChange && onChange(selectedValue);
  };

  // 사이즈에 따른 높이 결정
  const getHeight = () => {
    switch (size) {
      case 'sm':
        return 32;
      case 'lg':
        return 48;
      case 'md':
      default:
        return 40;
    }
  };

  // 변형에 따른 스타일 설정
  const getVariantStyle = () => {
    switch (variant) {
      case 'filled':
        return {
          style: {
            ...styles.dropdown,
            ...styles.filled,
            minHeight: getHeight(),
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
        };
      case 'underlined':
        return {
          style: {
            ...styles.dropdown,
            ...styles.underlined,
            minHeight: getHeight(),
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
        };
      case 'outline':
      default:
        return {
          style: {
            ...styles.dropdown,
            ...styles.outline,
            minHeight: getHeight(),
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
          dropDownContainerStyle: {
            ...styles.dropdownContainer,
            borderColor: error ? '#FF3B30' : '#DDDDDD',
          },
        };
    }
  };

  const variantStyle = getVariantStyle();

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={[styles.label, labelStyle]}>{label}</Text>}

      <DropDownPicker
        open={open}
        value={localValue}
        items={localItems}
        setOpen={setOpen}
        setValue={setLocalValue}
        setItems={setLocalItems}
        onChangeValue={handleValueChange}
        placeholder={placeholder}
        disabled={disabled}
        disabledStyle={styles.disabled}
        multiple={multiple}
        searchable={searchable}
        listMode="SCROLLVIEW"
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        style={variantStyle.style}
        dropDownContainerStyle={[variantStyle.dropDownContainerStyle, dropDownContainerStyle]}
        textStyle={[styles.text, textStyle]}
        placeholderStyle={styles.placeholderText}
        disabledTextStyle={styles.disabledText}
        selectedItemContainerStyle={styles.selectedItem}
        selectedItemLabelStyle={styles.selectedItemLabel}
        {...props}
      />

      {(error || helper) && (
        <Text style={[styles.helperText, error && styles.errorText]}>{error || helper}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 6,
  },
  dropdown: {
    borderWidth: 1,
  },
  // 변형 스타일
  outline: {
    backgroundColor: 'white',
    borderRadius: 0.8,
  },
  filled: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  underlined: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderBottomWidth: 1,
    borderRadius: 0,
  },
  dropdownContainer: {
    borderWidth: 1,
    backgroundColor: 'white',
  },
  // 텍스트 스타일
  text: {
    fontSize: 14,
    color: '#333333',
  },
  placeholderText: {
    color: '#999999',
  },
  // 비활성화 스타일
  disabled: {
    backgroundColor: '#F0F2F5',
    opacity: 0.8,
  },
  disabledText: {
    color: '#999999',
  },
  // 선택된 아이템 스타일
  selectedItem: {
    backgroundColor: 'rgba(39, 140, 204, 0.1)',
  },
  selectedItemLabel: {
    fontWeight: 'bold',
    color: '#278CCC',
  },
  // 헬퍼 텍스트 스타일
  helperText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  errorText: {
    color: '#FF3B30',
  },
});

export default Select;
