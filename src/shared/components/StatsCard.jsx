import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../core/theme';

/**
 * Shared Stats Card for Key Indicators.
 * Displays value, label, and trend.
 */
export default function StatsCard({ label, value, subtext, trend }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.valueRow}>
        <Text style={styles.value}>{value}</Text>
        {trend && (
          <Text style={[styles.trend, { color: trend > 0 ? theme.colors.accent : theme.colors.error }]}>
            {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </Text>
        )}
      </View>
      <Text style={styles.subtext}>{subtext}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minWidth: 160,
    flex: 1,
  },
  label: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
    textTransform: 'uppercase',
    fontWeight: theme.typography.weight.bold,
    marginBottom: theme.spacing.xs,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.sm,
  },
  value: {
    color: theme.colors.text,
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
  },
  trend: {
    fontSize: theme.typography.size.sm,
    fontWeight: theme.typography.weight.medium,
  },
  subtext: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.xs,
    marginTop: theme.spacing.xs,
  },
});
