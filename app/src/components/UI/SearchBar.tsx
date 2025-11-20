import { useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import type { SpatiLocation } from "../../hooks/useSpatiQuery";

type Props = {
  data?: SpatiLocation[];
  onSelect: (spati: SpatiLocation) => void;
  placeholder?: string;
};

export const SearchBar = ({
  data = [],
  onSelect,
  placeholder = "Search Spätis...",
}: Props) => {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return data.filter((spati) => {
      const searchable = `${spati.name} ${spati.description} ${spati.address}`.toLowerCase();
      return searchable.includes(trimmed);
    });
  }, [data, query]);

  const handleSelect = (spati: SpatiLocation) => {
    onSelect(spati);
    setQuery("");
  };

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

      {results.length > 0 && (
        <View style={styles.resultsContainer}>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.resultsContent}
          >
            {results.map((spati) => (
              <TouchableOpacity
                key={spati.id}
                style={styles.resultRow}
                onPress={() => handleSelect(spati)}
              >
                <View style={styles.resultTextContainer}>
                  <Text style={styles.resultPrimary}>{spati.name}</Text>
                  <Text style={styles.resultSecondary} numberOfLines={2}>
                    {spati.description}
                  </Text>
                  <Text style={styles.resultMeta}>{spati.address}</Text>
                </View>
                <Text style={styles.resultRating}>⭐ {spati.rating}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
