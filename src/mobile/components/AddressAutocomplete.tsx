import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Keyboard,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { fetchAddressSuggestions, isPlacesConfigured } from '../api/places.api';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';

const DEBOUNCE_MS = 350;

interface AddressAutocompleteProps {
  value: string;
  onSelectAddress: (address: string) => void;
  placeholder?: string;
  style?: ViewStyle;
  fallbackToPlainInput?: boolean;
}

export function AddressAutocomplete({
  value,
  onSelectAddress,
  placeholder = 'Search for your address',
  style,
  fallbackToPlainInput = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{ description: string; place_id: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const justSelectedRef = useRef(false);
  const onSelectAddressRef = useRef(onSelectAddress);
  const isConfigured = isPlacesConfigured() && !fallbackToPlainInput;

  onSelectAddressRef.current = onSelectAddress;

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { suggestions: list, error: err } = await fetchAddressSuggestions(text);
    setSuggestions(list);
    setError(err);
    setLoading(false);
    setDropdownVisible(true);
  }, []);

  const onTextChange = (text: string) => {
    setQuery(text);
    if (!isConfigured) {
      onSelectAddress(text);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      onSelectAddress('');
      setSuggestions([]);
      setDropdownVisible(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(text), DEBOUNCE_MS);
  };

  const onSelect = (address: string) => {
    justSelectedRef.current = true;
    setQuery(address);
    setSuggestions([]);
    setDropdownVisible(false);
    Keyboard.dismiss();
    onSelectAddressRef.current(address);
  };

  const onFocus = () => {
    if (query.trim() && suggestions.length > 0) setDropdownVisible(true);
    else if (query.trim()) fetchSuggestions(query);
  };

  const onBlur = () => {
    if (!isConfigured) return;
    setTimeout(() => {
      setDropdownVisible(false);
      if (justSelectedRef.current) {
        justSelectedRef.current = false;
        return;
      }
      if (query.trim() !== value) {
        setQuery(value);
      }
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  if (!isConfigured) {
    return (
      <View style={[styles.container, style]}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={(text) => {
            setQuery(text);
            onSelectAddress(text);
          }}
          autoCapitalize="words"
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={query}
          onChangeText={onTextChange}
          onFocus={onFocus}
          onBlur={onBlur}
          autoCapitalize="words"
          autoCorrect={false}
        />
        {loading && (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        )}
        {!loading && query.length > 0 && (
          <Pressable
            style={styles.clearBtn}
            onPress={() => {
              setQuery('');
              onSelectAddress('');
              setSuggestions([]);
              setDropdownVisible(false);
            }}
          >
            <Ionicons name="close-circle" size={22} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}

      {dropdownVisible && suggestions.length > 0 && (
        <View style={styles.dropdown}>
          <View style={styles.dropdownList}>
            {suggestions.map((item) => (
              <Pressable
                key={item.place_id}
                style={({ pressed }) => [styles.suggestionRow, pressed && styles.suggestionRowPressed]}
                onPress={() => onSelect(item.description)}
              >
                <Ionicons name="location-outline" size={18} color={colors.primary} />
                <Text style={styles.suggestionText} numberOfLines={2}>
                  {item.description}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      )}

      {isConfigured && (
        <Text style={styles.hint}>
          Choose an address from the list so we can deliver to you
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    marginVertical: 4,
  },
  inputRow: {
    position: 'relative',
  },
  input: {
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingRight: 48,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: colors.textPrimary,
    backgroundColor: colors.background,
  },
  loader: {
    position: 'absolute',
    right: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearBtn: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    ...typography.captionSmall,
    color: colors.error,
    marginTop: 6,
  },
  dropdown: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    maxHeight: 220,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dropdownList: {
    paddingVertical: 4,
  },
  suggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 10,
  },
  suggestionRowPressed: {
    backgroundColor: colors.secondary,
  },
  suggestionText: {
    ...typography.bodySmall,
    color: colors.textPrimary,
    flex: 1,
  },
  hint: {
    ...typography.captionSmall,
    color: colors.textSecondary,
    marginTop: 8,
  },
});
