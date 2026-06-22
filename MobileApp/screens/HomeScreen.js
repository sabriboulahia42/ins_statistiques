import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  ActivityIndicator, 
  Platform 
} from 'react-native';
import { theme } from '../../shared/core/theme';
import StatsCard from '../../shared/components/StatsCard';
import DatasetList from '../../shared/components/DatasetList';
import ExportPanel from '../../shared/components/ExportPanel';
import { generateJSON, generateXML, saveNativeFile } from '../../shared/core/exporter';

const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:4000/api' : 'http://localhost:4000/api';

export default function HomeScreen() {
  const [datasets, setDatasets] = useState([]);
  const [selectedDataset, setSelectedDataset] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BACKEND_URL}/datasets`)
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setDatasets(json.data);
          if (json.data.length > 0) setSelectedDataset(json.data[0]);
        }
      })
      .catch(err => console.error('Failed to fetch datasets:', err))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (format) => {
    if (!selectedDataset) return;
    const exportData = [selectedDataset];
    let content, filename;

    if (format === 'json') {
      content = generateJSON(exportData);
      filename = 'ins-stats.json';
    } else if (format === 'xml') {
      content = generateXML(exportData);
      filename = 'ins-stats.xml';
    } else {
      alert('PDF Export available in Web/Desktop version.');
      return;
    }

    try {
      const path = await saveNativeFile(content, filename);
      alert(`File saved to: ${path}`);
    } catch (err) {
      alert('Failed to save file.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>INS Dashboard</Text>
          <Text style={styles.subtitle}>National Institute of Statistics</Text>
        </View>

        <View style={styles.statsGrid}>
          <StatsCard label="Inflation" value="7.5%" subtext="Feb 2024" trend={-0.2} />
          <StatsCard label="GDP" value="1.2%" subtext="Q4 2023" trend={0.5} />
        </View>

        <View style={styles.main}>
          {loading ? (
            <ActivityIndicator color={theme.colors.primary} size="large" />
          ) : (
            <DatasetList 
              datasets={datasets} 
              onSelect={setSelectedDataset} 
              selectedId={selectedDataset?.id} 
            />
          )}
        </View>

        {selectedDataset && (
          <View style={styles.footer}>
            <ExportPanel 
              onExportJSON={() => handleExport('json')}
              onExportXML={() => handleExport('xml')}
              onExportPDF={() => handleExport('pdf')}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  title: {
    color: theme.colors.primary,
    fontSize: theme.typography.size.xl,
    fontWeight: theme.typography.weight.bold,
  },
  subtitle: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.size.sm,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  main: {
    flex: 1,
    minHeight: 300,
  },
  footer: {
    marginBottom: theme.spacing.xl,
  },
});
