import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { theme } from '../core/theme';

export default function ExportPanel({ onExportJSON, onExportXML, onExportPDF }) {
  const isWeb = Platform.OS === 'web';
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Export Options</Text>
      <Text style={styles.subtitle}>
        Save data for offline analysis
      </Text>
      
      <View style={styles.buttonGroup}>
        <TouchableOpacity style={[styles.button, styles.btnJson]} onPress={onExportJSON}>
          <Text style={styles.buttonText}>JSON</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.btnXml]} onPress={onExportXML}>
          <Text style={styles.buttonText}>XML</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.btnPdf]} onPress={onExportPDF}>
          <Text style={styles.buttonText}>PDF Report</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  title: {
    fontSize: theme.typography.size.md,
    fontWeight: theme.typography.weight.bold,
    color: theme.colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: theme.typography.size.xs,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  button: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: theme.typography.size.sm,
  },
  btnJson: { backgroundColor: theme.colors.primary },
  btnXml: { backgroundColor: theme.colors.secondary },
  btnPdf: { backgroundColor: theme.colors.error },
});
