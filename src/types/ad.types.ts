export interface AdAttributeMap {
  [label: string]: string;
}

export interface AdFeatureGroup {
  title: string;
  items: string[];
}

export interface TechnicalDetailRow {
  label: string;
  value: string;
}

export interface TechnicalDetailGroup {
  title: string;
  rows: TechnicalDetailRow[];
}

export interface ParsedAdDetails {
  id: string | null;
  title: string | null;
  priceText: string | null;
  locationBreadcrumb: string[];
  coverImageUrl: string | null;
  attributes: AdAttributeMap;
  carAge: number | null;
  kmPerYear: number | null;
  descriptionText: string | null;
  featureGroups: AdFeatureGroup[];
  technicalDetails: TechnicalDetailGroup[];
}

