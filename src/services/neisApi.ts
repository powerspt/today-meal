import { MealService, NutrientItem, SchoolInfo } from '../types';
import { parseDishString } from '../data/allergies';
import { PRESET_SCHOOLS } from '../data/presetSchools';
import { getSampleMealsForWeek } from '../data/fallbackMeals';

const NEIS_BASE_URL = 'https://open.neis.go.kr/hub';

/**
 * Searches schools by name via NEIS Open API
 */
export async function searchSchools(query: string): Promise<SchoolInfo[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return PRESET_SCHOOLS;
  }

  try {
    const url = `${NEIS_BASE_URL}/schoolInfo?Type=json&pIndex=1&pSize=25&SCHUL_NM=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      throw new Error(`NEIS API responded with status ${res.status}`);
    }

    const data = await res.json();

    if (data.schoolInfo && data.schoolInfo[1]?.row) {
      return data.schoolInfo[1].row as SchoolInfo[];
    }

    // Filter preset schools as fallback if no results from API
    const matchedPresets = PRESET_SCHOOLS.filter(s =>
      s.SCHUL_NM.toLowerCase().includes(trimmed.toLowerCase())
    );
    return matchedPresets;
  } catch (error) {
    console.warn('School search API error, falling back to local presets:', error);
    return PRESET_SCHOOLS.filter(s =>
      s.SCHUL_NM.toLowerCase().includes(trimmed.toLowerCase())
    );
  }
}

/**
 * Parses raw NTR_INFO string from NEIS
 */
function parseNutrients(raw: string): NutrientItem[] {
  if (!raw) return [];
  const items: NutrientItem[] = [];

  const parts = raw
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map(p => p.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [nameUnit, valStr] = part.split(':').map(s => s?.trim());
    if (nameUnit && valStr) {
      const match = nameUnit.match(/([^\(]+)(?:\(([^\)]+)\))?/);
      const name = match ? match[1].trim() : nameUnit;
      const unit = match && match[2] ? match[2].trim() : '';
      const numVal = parseFloat(valStr);

      items.push({
        name,
        value: `${valStr}${unit ? ' ' + unit : ''}`,
        numericValue: isNaN(numVal) ? undefined : numVal,
        unit,
      });
    }
  }

  return items;
}

/**
 * Parses raw ORPLC_INFO string from NEIS
 */
function parseOrigins(raw: string): string[] {
  if (!raw) return [];
  return raw
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map(s => s.trim())
    .filter(s => s && !s.startsWith('비고 :'));
}

/**
 * Fetches meals for a school between two dates (YYYYMMDD)
 */
export async function fetchSchoolMeals(
  officeCode: string,
  schoolCode: string,
  fromYmd: string,
  toYmd: string
): Promise<{ meals: MealService[]; isFallback: boolean }> {
  try {
    const url = `${NEIS_BASE_URL}/mealServiceDietInfo?Type=json&pIndex=1&pSize=100&ATPT_OFCDC_SC_CODE=${officeCode}&SD_SCHUL_CODE=${schoolCode}&MLSV_FROM_YMD=${fromYmd}&MLSV_TO_YMD=${toYmd}`;
    
    const res = await fetch(url, { signal: AbortSignal.timeout(7000) });
    if (!res.ok) {
      throw new Error(`NEIS meal API returned ${res.status}`);
    }

    const data = await res.json();

    if (data.mealServiceDietInfo && data.mealServiceDietInfo[1]?.row) {
      const rows = data.mealServiceDietInfo[1].row;
      const parsed: MealService[] = rows.map((row: any) => {
        const calStr = row.CAL_INFO || '';
        const calNum = parseFloat(calStr.replace(/[^0-9.]/g, '')) || 0;
        const dateStr = String(row.MLSV_YMD);
        const yyyy = dateStr.slice(0, 4);
        const mm = dateStr.slice(4, 6);
        const dd = dateStr.slice(6, 8);

        return {
          date: dateStr,
          formattedDate: `${yyyy}-${mm}-${dd}`,
          mealCode: (row.MMEAL_SC_CODE as '1' | '2' | '3') || '2',
          mealName: row.MMEAL_SC_NM || '중식',
          dishes: parseDishString(row.DDISH_NM || ''),
          calorie: calStr,
          calorieValue: calNum,
          nutrients: parseNutrients(row.NTR_INFO || ''),
          originInfo: parseOrigins(row.ORPLC_INFO || ''),
          dinersCount: row.MLSV_FGR ? Number(row.MLSV_FGR) : undefined,
        };
      });

      return { meals: parsed, isFallback: false };
    }

    // If NEIS returned INFO-200 (해당하는 데이터가 없습니다 - No data for this week, e.g., vacation/holiday)
    console.info('NEIS returned no records for this week; generating contextual sample meals.');
    return { meals: getSampleMealsForWeek(fromYmd), isFallback: true };
  } catch (error) {
    console.warn('Failed to fetch from NEIS, serving sample week meals:', error);
    return { meals: getSampleMealsForWeek(fromYmd), isFallback: true };
  }
}
