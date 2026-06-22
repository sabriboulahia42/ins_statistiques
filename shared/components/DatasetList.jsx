import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { theme } from '../core/theme';

/**
 * Shared Dataset List component.
 * Features searching and selection.
 */
export default function DatasetList({ datasets, onSelect, selectedId }) {
  const [search, setSearch] = React.useState('');

  const filtered = datasets.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.id.toLowerCase().includes(search.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.item,
        selectedId === item.id && styles.selectedItem
      ]}
      onPress={() => onSelect(item)}
    >
      <View>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemMeta}>
          {item.period.start} - {item.period.end} • {item.dimensions.length} Dimensions
        </Text>
      </View>
      <View style={[styles.indicator, selectedId === item.id && styles.selectedIndicator]} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Datasets</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Search datasets..."
        placeholderTextColor={theme.colors.textMuted}
        value={search}
        onChangeText={setSearch}
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
  title: {
    color: theme.colors.text,
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing.md,
  },
  searchInput: {
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.size.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  listContent: {
    gap: theme.spacing.sm,
  },
  item: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedItem: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.surface,
  },
  itemName: {
    color: theme.colors.text,
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
  },
  itemMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
    marginTop: 2,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
  },
  selectedIndicator: {
    backgroundColor: theme.colors.primary,
  },
});
