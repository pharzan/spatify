import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  FlatList,
} from "react-native";
import { Image } from "expo-image";
import type { SpatiLocation } from "../../hooks/useSpatiQuery";
import type { Amenity } from "../../hooks/useAmenitiesQuery";
import type { Mood } from "../../hooks/useMoodsQuery";

type Props = {
  data?: SpatiLocation[];
  amenities?: Amenity[];
  moods?: Mood[];
  onSelect: (spati: SpatiLocation) => void;
  placeholder?: string;
};

export const SearchBar = ({
  data = [],
  amenities = [],
  moods = [],
  onSelect,
  placeholder = "Search Spätis...",
}: Props) => {
  const [query, setQuery] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);

  const toggleAmenity = (id: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const toggleMood = (id: string) => {
    setSelectedMoods((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();

    // If no query and no filters, return empty
    if (
      !trimmed &&
      selectedAmenities.length === 0 &&
      selectedMoods.length === 0
    ) {
      return [];
    }

    return data.filter((spati) => {
      // Text search
      const matchesSearch =
        !trimmed ||
        `${spati.name} ${spati.description} ${spati.address}`
          .toLowerCase()
          .includes(trimmed);

      // Amenity filter (AND logic - must have all selected amenities)
      const matchesAmenities =
        selectedAmenities.length === 0 ||
        selectedAmenities.every((id) =>
          spati.amenities.some((a) => a.id === id)
        );

      // Mood filter (OR logic - can match any selected mood)
      const matchesMoods =
        selectedMoods.length === 0 ||
        (spati.mood && selectedMoods.includes(spati.mood.id));

      return matchesSearch && matchesAmenities && matchesMoods;
    });
  }, [data, query, selectedAmenities, selectedMoods]);

  const handleSelect = (spati: SpatiLocation) => {
    onSelect(spati);
    setQuery("");
    // Optional: clear filters on select?
    // setSelectedAmenities([]);
    // setSelectedMoods([]);
  };

  const renderResultItem = ({ item }: { item: SpatiLocation }) => (
    <TouchableOpacity
      style={styles.resultRow}
      onPress={() => handleSelect(item)}
    >
      <View style={styles.resultTextContainer}>
        <Text style={styles.resultPrimary}>{item.name}</Text>
        <Text style={styles.resultSecondary} numberOfLines={2}>
          {item.description}
        </Text>
        <Text style={styles.resultMeta}>{item.address}</Text>
      </View>
      <Text style={styles.resultRating}>⭐ {item.rating}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={styles.inputRow}>
        <Text style={styles.icon}>🔍</Text>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#909090"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity
            onPress={() => setQuery("")}
            accessibilityRole="button"
            accessibilityLabel="Clear search"
          >
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
        >
          {moods.map((mood) => {
            const isSelected = selectedMoods.includes(mood.id);
            return (
              <TouchableOpacity
                key={mood.id}
                style={[
                  styles.filterChip,
                  isSelected && {
                    backgroundColor: mood.color,
                    borderColor: mood.color,
                  },
                ]}
                onPress={() => toggleMood(mood.id)}
              >
                <Text
                  style={[
                    styles.filterText,
                    isSelected && styles.filterTextSelected,
                  ]}
                >
                  {mood.name}
                </Text>
              </TouchableOpacity>
            );
          })}

          <View style={styles.filterDivider} />

          {amenities.map((amenity) => {
            const isSelected = selectedAmenities.includes(amenity.id);
            return (
              <TouchableOpacity
                key={amenity.id}
                style={[
                  styles.filterChip,
                  amenity.imageUrl ? styles.filterChipIcon : null,
                  isSelected && styles.filterChipSelected,
                  isSelected && amenity.imageUrl
                    ? styles.filterChipIconSelected
                    : null,
                ]}
                onPress={() => toggleAmenity(amenity.id)}
              >
                {amenity.imageUrl ? (
                  <Image
                    source={{ uri: amenity.imageUrl }}
                    style={styles.amenityIcon}
                    contentFit="contain"
                  />
                ) : (
                  <Text
                    style={[
                      styles.filterText,
                      isSelected && styles.filterTextSelected,
                    ]}
                  >
                    {amenity.name}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <FlatList
            data={results}
            renderItem={renderResultItem}
            keyExtractor={(item) => item.id.toString()}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.resultsContent}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: 16,
    width: "100%",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  icon: {
    fontSize: 18,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#1a1a1a",
  },
  clearIcon: {
    fontSize: 18,
    color: "#555",
    marginLeft: 8,
  },
  filtersContainer: {
    marginTop: 12,
  },
  filtersContent: {
    paddingRight: 16,
    alignItems: "center",
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    marginRight: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterChipIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#333",
    borderColor: "#333",
  },
  filterChipIconSelected: {
    borderColor: "#00E676",
    borderWidth: 2,
  },
  amenityIcon: {
    width: 20,
    height: 20,
  },
  filterChipSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#333",
  },
  filterTextSelected: {
    color: "white",
  },
  filterDivider: {
    width: 1,
    height: 20,
    backgroundColor: "#ccc",
    marginRight: 8,
  },
  resultsContainer: {
    marginTop: 12,
    maxHeight: 260,
    borderRadius: 16,
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  resultsContent: {
    paddingVertical: 4,
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  resultTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  resultPrimary: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  resultSecondary: {
    fontSize: 14,
    color: "#555",
    marginTop: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: "#888",
    marginTop: 4,
  },
  resultRating: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
});
