import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';

interface CategoryTabProps {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  accessibilityLabel?: string;
}

export const CategoryTab: React.FC<CategoryTabProps> = ({ 
  label, 
  isSelected, 
  onPress,
  accessibilityLabel 
}) => {
  return (
    <TouchableOpacity
      style={[styles.tab, isSelected && styles.tabSelected]}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="tab"
      accessibilityState={{ selected: isSelected }}
      accessibilityLabel={accessibilityLabel || `${label} category${isSelected ? ', selected' : ''}`}
      accessibilityHint={isSelected ? 'Currently selected category' : `Select ${label} category`}
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <Text style={[styles.tabText, isSelected && styles.tabTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    minHeight: 44,
    minWidth: 44,
    borderRadius: 22,
    backgroundColor: '#F5F5F5',
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabSelected: {
    backgroundColor: '#008B94',
    borderColor: '#008B94',
    shadowColor: '#008B94',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    ...typography.caption,
    color: '#2C2C2C',
    fontWeight: '500',
    fontSize: 14,
  },
  tabTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
