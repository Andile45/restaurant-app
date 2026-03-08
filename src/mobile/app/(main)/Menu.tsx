import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { loadCategories, loadFoodItems, loadFoodItemsByCategory, setSelectedCategory } from '../../store/slices/menuSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Loader } from '../../components/Loader';
import { ErrorDisplay } from '../../components/auth/ErrorDisplay';
import { FoodItemCard } from '../../components/menu/FoodItemCard';
import { CategoryTab } from '../../components/menu/CategoryTab';
import type { FoodItem } from '../../../common/types/foodItem';

export default function MenuScreen() {
  const dispatch = useAppDispatch();
  const scrollViewRef = useRef<ScrollView>(null);
  const { categories, foodItems, selectedCategory, isLoading, error } = useAppSelector(
    (state) => state.menu
  );

  useEffect(() => {
    dispatch(loadCategories());
    dispatch(loadFoodItems());
  }, [dispatch]);

  const handleCategorySelect = (categoryId: string | null) => {
    if (categoryId === null) {
      dispatch(setSelectedCategory(null));
      dispatch(loadFoodItems());
    } else {
      dispatch(loadFoodItemsByCategory(categoryId));
    }
  };

  const handleAddToCart = (foodItem: FoodItem) => {
    dispatch(addToCart({ foodItem, quantity: 1 }));
  };

  if (isLoading && categories.length === 0) {
    return <Loader fullscreen />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Menu</Text>
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <ErrorDisplay error={error} />
        </View>
      )}

      {categories.length > 0 && (
        <View style={styles.categoriesContainer}>
          <View style={styles.scrollWrapper}>
            <ScrollView
              ref={scrollViewRef}
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={styles.categoriesScroll}
              style={styles.categoriesScrollView}
              accessibilityRole="tablist"
              accessibilityLabel="Food categories"
              scrollIndicatorInsets={{ right: 20, left: 20 }}
            >
              <CategoryTab
                label="All"
                isSelected={selectedCategory === null}
                onPress={() => handleCategorySelect(null)}
                accessibilityLabel="All categories"
              />
              {categories.map((category) => (
                <CategoryTab
                  key={category.id}
                  label={category.name}
                  isSelected={selectedCategory === category.id}
                  onPress={() => handleCategorySelect(category.id)}
                  accessibilityLabel={`${category.name} category`}
                />
              ))}
            </ScrollView>
            <View style={styles.rightFade} pointerEvents="none" />
            <View style={styles.leftFade} pointerEvents="none" />
          </View>
        </View>
      )}

      {isLoading ? (
        <Loader />
      ) : (
        <FlatList
          data={foodItems}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FoodItemCard foodItem={item} onAddToCart={() => handleAddToCart(item)} />
          )}
          contentContainerStyle={styles.foodList}
          numColumns={2}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No items available</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    ...typography.heading,
    color: colors.textPrimary,
  },
  errorContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  categoriesContainer: {
    marginBottom: 24,
    paddingBottom: 8,
    position: 'relative',
  },
  scrollWrapper: {
    position: 'relative',
  },
  categoriesScrollView: {
    maxHeight: 60,
  },
  categoriesScroll: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    gap: 12,
    alignItems: 'center',
  },
  rightFade: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(224, 247, 248, 0.7)',
    zIndex: 1,
  },
  leftFade: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 30,
    backgroundColor: 'rgba(224, 247, 248, 0.7)',
    zIndex: 1,
  },
  foodList: {
    padding: 20,
    paddingTop: 8,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    ...typography.body,
    color: colors.textSecondary,
  },
});
