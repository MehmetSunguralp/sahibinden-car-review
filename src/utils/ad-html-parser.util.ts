import * as cheerio from 'cheerio';
import {
  AdAttributeMap,
  AdFeatureGroup,
  ParsedAdDetails,
  TechnicalDetailGroup,
  TechnicalDetailRow,
} from '../types/ad.types';

export function parseSahibindenAdHtml(html: string): ParsedAdDetails {
  const $ = cheerio.load(html);

  const title =
    $('.classifiedDetailTitle h1').first().text().trim() || null;

  const idAttr =
    $('#classifiedId').attr('data-classifiedid') ||
    $('#classifiedId').text().trim() ||
    $('#classifiedIdValue').val()?.toString().trim() ||
    null;

  const priceTextCandidate =
    $('.classifiedInfo .classified-price-wrapper').first().text() ||
    ($('#favoriteClassifiedPrice').val() as string | undefined) ||
    '';
  const priceText = priceTextCandidate.trim() || null;

  const locationBreadcrumb = $('.classifiedInfo h2 a')
    .map((_: number, el: any) => $(el).text().trim())
    .get()
    .filter(Boolean);

  let coverImageUrl: string | null = null;
  $('.classifiedDetailMainPhoto picture img').each((_: number, el: any) => {
    if (coverImageUrl) {
      return;
    }
    const src =
      $(el).attr('src') || $(el).attr('data-src') || '';
    const trimmed = src.trim();
    if (trimmed && !trimmed.includes('blank:')) {
      coverImageUrl = trimmed;
    }
  });

  const attributes: AdAttributeMap = {};
  $('.classifiedInfoList li').each((_: number, li: any) => {
    const labelRaw = $(li).find('strong').first().text();
    const valueRaw = $(li).find('span').text();

    const label = labelRaw
      .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
      .trim()
      .replace(/:$/, '');
    const value = valueRaw
      .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
      .trim();

    if (!label || !value) {
      return;
    }

    attributes[label] = value;
  });

  const normalizedAttributes: AdAttributeMap = {};
  const normalizeKey = (turkishKey: string): string | null => {
    switch (turkishKey) {
      case 'İlan No':
        return 'adNo';
      case 'İlan Tarihi':
        return 'adDate';
      case 'Marka':
        return 'brand';
      case 'Seri':
        return 'series';
      case 'Model':
        return 'model';
      case 'Yıl':
        return 'year';
      case 'Yakıt Tipi':
        return 'fuelType';
      case 'Vites':
        return 'transmission';
      case 'Araç Durumu':
        return 'condition';
      case 'KM':
      case 'Km':
        return 'kilometers';
      case 'Kasa Tipi':
        return 'bodyType';
      case 'Motor Gücü':
        return 'enginePower';
      case 'Motor Hacmi':
        return 'engineCapacity';
      case 'Çekiş':
        return 'driveType';
      case 'Renk':
        return 'color';
      case 'Garanti':
        return 'warranty';
      case 'Ağır Hasar Kayıtlı':
        return 'severeDamageRecorded';
      case 'Plaka / Uyruk':
        return 'plateCountry';
      case 'Kimden':
        return 'sellerType';
      case 'Takas':
        return 'exchangePossible';
      default:
        return null;
    }
  };

  Object.entries(attributes).forEach(([trKey, value]) => {
    const enKey = normalizeKey(trKey);
    if (enKey) {
      normalizedAttributes[enKey] = value;
    }
  });

  const descriptionEl = $('#classifiedDescription').first();
  const descriptionTextRaw = descriptionEl.text();
  const descriptionText =
    descriptionTextRaw
      .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
      .trim() || null;

  const featuresEl = $('#classifiedProperties').first();
  const featureGroups: AdFeatureGroup[] = [];
  featuresEl.find('h3').each((_: number, h3: any) => {
    const groupTitle = $(h3)
      .text()
      .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
      .trim();
    if (!groupTitle) {
      return;
    }

    const groupContainer = $(h3).nextUntil('h3');
    const items = new Set<string>();

    groupContainer
      .find('li, .classified-property-item, .property-item, span')
      .each((__: number, node: any) => {
        const classAttr = $(node).attr?.('class') || '';
        const hasSelectedClass = classAttr
          .split(/\s+/)
          .some((cls) => cls && cls.includes('selected')); // NOSONAR - explicit class-name filter is clearer here
        if (!hasSelectedClass) {
          return;
        }

        const text = $(node)
          .text()
          .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
          .trim();
        if (text) {
          items.add(text);
        }
      });

    featureGroups.push({
      title: groupTitle,
      items: Array.from(items),
    });
  });

  const technicalDetailsRoot = $('#technical-details .classifiedTechDetails').first();
  const technicalDetails: TechnicalDetailGroup[] = [];

  if (technicalDetailsRoot.length) {
    technicalDetailsRoot.children('h3').each((_: number, h3: any) => {
      const groupTitle = $(h3)
        .find('span')
        .first()
        .text()
        .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
        .trim();

      if (!groupTitle) {
        return;
      }

      const table = $(h3).next('table');
      if (!table.length) {
        return;
      }

      const rows: TechnicalDetailRow[] = [];

      table.find('tr').each((__: number, tr: any) => {
        const labelRaw = $(tr).find('td.title').first().text();
        const valueRaw = $(tr).find('td.value').first().text();

        const label = labelRaw
          .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
          .trim();
        const value = valueRaw
          .replace(/\s+/g, ' ') // NOSONAR - regex replace for compatibility
          .trim();

        if (!label || !value) {
          return;
        }

        rows.push({ label, value });
      });

      if (rows.length > 0) {
        technicalDetails.push({
          title: groupTitle,
          rows,
        });
      }
    });
  }

  let carAge: number | null = null;
  let kmPerYear: number | null = null;

  const yearRaw = normalizedAttributes.year;
  const kmRaw = normalizedAttributes.kilometers;

  const currentYear = new Date().getFullYear();

  const yearNumeric = yearRaw
    ? Number.parseInt(
        yearRaw.replace(/[^\d]/g, ''), // NOSONAR - regex replace for compatibility
        10,
      )
    : Number.NaN; // NOSONAR - explicit NaN usage for clarity
  const kmNumeric = kmRaw
    ? Number.parseInt(
        kmRaw.replace(/[^\d]/g, ''), // NOSONAR - regex replace for compatibility
        10,
      )
    : Number.NaN; // NOSONAR - explicit NaN usage for clarity

  if (!Number.isNaN(yearNumeric) && yearNumeric > 1900 && yearNumeric <= currentYear) {
    const age = currentYear - yearNumeric;
    if (age > 0) {
      carAge = age;

      if (!Number.isNaN(kmNumeric) && kmNumeric >= 0) {
        kmPerYear = Math.round(kmNumeric / age);
      }
    }
  }

  return {
    id: idAttr,
    title,
    priceText,
    locationBreadcrumb,
    coverImageUrl,
    attributes: normalizedAttributes,
    carAge,
    kmPerYear,
    descriptionText,
    featureGroups,
    technicalDetails,
  };
}

