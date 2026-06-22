export interface ExportPayload {
  pureHTMLTable: string;
  combinedHtmlWithImages: string;
  images: string[];
}

export interface KPI {
  label_ar: string;
  label_fr: string;
  value: string;
  icon?: string;
}

export interface DataSeries {
  years: string[];
  values: number[];
}

export interface SectionData {
  kpis?: KPI[];
  cereals?: DataSeries;
  olive_oil?: DataSeries;
  dates?: DataSeries;
  fishing?: DataSeries;
  arrivals?: DataSeries;
  receipts?: DataSeries;
  production_index?: DataSeries;
  exports?: DataSeries;
  imports?: DataSeries;
  balance?: DataSeries;
  coverage_rate?: DataSeries;
  sectors?: {
    values: number[];
    labels_ar: string[];
    labels_fr: string[];
  };
  crafts_categories?: {
    values: number[];
    labels_ar: string[];
    labels_fr: string[];
  };
  partners_export?: {
    values: number[];
    labels_ar: string[];
    labels_fr: string[];
  };
}
