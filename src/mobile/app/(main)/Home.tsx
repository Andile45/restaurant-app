import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { useAppDispatch, useAppSelector } from '../../store/index';
import { loadFoodItems, loadCategories, setSelectedCategory, loadFoodItemsByCategory } from '../../store/slices/menuSlice';
import { fetchUserOrders } from '../../store/slices/orderSlice';
import { addToCart } from '../../store/slices/cartSlice';
import { SearchBar } from '../../components/home/SearchBar';
import { RecentFavoriteCard } from '../../components/home/RecentFavoriteCard';
import { FoodItemCard } from '../../components/menu/FoodItemCard';
import { CategoryTab } from '../../components/menu/CategoryTab';
import { EmptyState } from '../../components/EmptyState';
import type { FoodItem } from '../../../common/types/foodItem';
import type { Order } from '../../../common/types/order';

const getTimeBasedGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 17) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

export default function HomeScreen() {
  const dispatch = useAppDispatch();
  const navigation = useNavigation<any>();
  const { user } = useAppSelector((state) => state.auth);
  const { foodItems, categories } = useAppSelector((state) => state.menu);
  const { orders } = useAppSelector((state) => state.order);
  const [searchQuery, setSearchQuery] = useState('');
  const [greeting] = useState(getTimeBasedGreeting());
  
  useEffect(() => {
    if (foodItems.length === 0) {
      dispatch(loadFoodItems());
    }
    if (categories.length === 0) {
      dispatch(loadCategories());
    }
    if (user?.id && orders.length === 0) {
      dispatch(fetchUserOrders(user.id));
    }
  }, [dispatch, foodItems.length, categories.length, user?.id, orders.length]);
  
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    const query = searchQuery.toLowerCase().trim();
    const seenIds = new Set<string>();
    const seenNamePrice = new Set<string>();
    const uniqueItems: FoodItem[] = [];
    
    for (const item of foodItems) {
      if (seenIds.has(item.id)) {
        continue;
      }
      
      const namePriceKey = `${item.name.toLowerCase()}-${item.price}`;
      if (seenNamePrice.has(namePriceKey)) {
        continue;
      }
      
      const matchesName = item.name.toLowerCase().includes(query);
      const matchesDescription = item.description?.toLowerCase().includes(query);
      
      if (matchesName || matchesDescription) {
        seenIds.add(item.id);
        seenNamePrice.add(namePriceKey);
        uniqueItems.push(item);
      }
    }
    
    return uniqueItems;
  }, [foodItems, searchQuery]);
  
  const personalizedRecommendations = useMemo(() => {
    if (!user?.id || orders.length === 0) {
      return [];
    }

    const foodIdFrequency = new Map<string, number>();
    
    orders.forEach((order: Order) => {
      if (order.order_items && Array.isArray(order.order_items)) {
        order.order_items.forEach((item: any) => {
          const foodId = item.food_id;
          if (foodId) {
            foodIdFrequency.set(foodId, (foodIdFrequency.get(foodId) || 0) + (item.quantity || 1));
          }
        });
      }
    });

    const sortedFoodIds = Array.from(foodIdFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([foodId]) => foodId);

    const recommendedItems = foodItems.filter(item => 
      sortedFoodIds.includes(item.id) && item.is_available
    );

    recommendedItems.sort((a, b) => {
      const indexA = sortedFoodIds.indexOf(a.id);
      const indexB = sortedFoodIds.indexOf(b.id);
      return indexA - indexB;
    });

    return recommendedItems;
  }, [orders, foodItems, user?.id]);

  const recentFavorites = foodItems.slice(0, 5);
  const featuredItems = foodItems.filter(item => item.is_available).slice(0, 6);
  const displayRecommendations = personalizedRecommendations.length > 0 
    ? personalizedRecommendations 
    : featuredItems;
  
  const recommendationsTitle = personalizedRecommendations.length > 0
    ? 'Recommended for You'
    : 'Featured Items';

  const handleFavoritePress = (item: FoodItem) => {
    dispatch(addToCart({ foodItem: item, quantity: 1 }));
  };

  const handleAddToCart = (foodItem: FoodItem) => {
    dispatch(addToCart({ foodItem, quantity: 1 }));
  };
  
  const handleCategoryPress = (categoryId: string) => {
    dispatch(setSelectedCategory(categoryId));
    dispatch(loadFoodItemsByCategory(categoryId));
    navigation.navigate('Menu');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.content}>
        <Text style={styles.title}>{greeting}, {user?.name}!</Text>
        
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search for food, drinks..."
          />
        </View>
        
        {!searchQuery.trim() && categories.length > 0 && (
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categories.slice(0, 8).map((category) => (
                <CategoryTab
                  key={category.id}
                  label={category.name}
                  isSelected={false}
                  onPress={() => handleCategoryPress(category.id)}
                  accessibilityLabel={`Browse ${category.name} category`}
                />
              ))}
            </ScrollView>
          </View>
        )}
        
        {searchQuery.trim() ? (
          <View style={styles.searchResultsContainer}>
            <Text style={styles.sectionTitle}>
              Search Results {filteredItems.length > 0 && `(${filteredItems.length})`}
            </Text>
            {filteredItems.length > 0 ? (
              <FlatList
                data={filteredItems}
                keyExtractor={(item, index) => `${item.id}-${index}`}
                renderItem={({ item }) => (
                  <FoodItemCard foodItem={item} onAddToCart={() => handleAddToCart(item)} />
                )}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.searchResultsList}
                showsVerticalScrollIndicator={false}
                removeClippedSubviews={false}
              />
            ) : (
              <EmptyState
                icon="search-outline"
                title="No items found"
                message="Try searching with different keywords"
                variant="info"
              />
            )}
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              {personalizedRecommendations.length > 0 
                ? "Based on your order history, here's what you might like"
                : "What would you like to order today?"}
            </Text>
            
            {displayRecommendations.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{recommendationsTitle}</Text>
                <View style={styles.featuredGrid}>
                  {displayRecommendations.map((item) => (
                    <FoodItemCard key={item.id} foodItem={item} onAddToCart={() => handleAddToCart(item)} />
                  ))}
                </View>
              </View>
            )}
            
            {recentFavorites.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Recent Favorites</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.favoritesScroll}
                >
                  {recentFavorites.map((item) => (
                    <RecentFavoriteCard
                      key={item.id}
                      name={item.name}
                      price={item.price}
                      imageUrl={item.image_url}
                      onPress={() => handleFavoritePress(item)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.appBackground,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    ...typography.heading,
    fontFamily: 'Inter_700Bold',
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 12,
  },
  searchContainer: {
    marginBottom: 16,
  },
  categoriesContainer: {
    marginBottom: 16,
  },
  categoriesScroll: {
    paddingHorizontal: 0,
    gap: 10,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  section: {
    marginTop: 4,
  },
  sectionTitle: {
    ...typography.heading,
    fontSize: 20,
    color: colors.textPrimary,
    marginBottom: 12,
  },
  favoritesScroll: {
    paddingRight: 16,
  },
  searchResultsContainer: {
    flex: 1,
  },
  searchResultsList: {
    paddingBottom: 16,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  featuredGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
