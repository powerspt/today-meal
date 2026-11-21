export interface SchoolInfo {
  ATPT_OFCDC_SC_CODE: string; // 시도교육청코드
  ATPT_OFCDC_SC_NM: string;   // 시도교육청명
  SD_SCHUL_CODE: string;        // 표준학교코드
  SCHUL_NM: string;             // 학교명
  SCHUL_KND_SC_NM: string;      // 학교종류명 (초등학교, 중학교, 고등학교, 특수학교)
  LCTN_SC_NM?: string;          // 소재지명
  ORG_RDNMA?: string;           // 도로명주소
  ORG_TELNO?: string;           // 전화번호
  HMPG_ADRES?: string;          // 홈페이지주소
}

export type DishCategory = 'rice' | 'soup' | 'main' | 'side' | 'dessert' | 'other';

export interface DishItem {
  id: string;
  name: string;
  allergyCodes: number[];
  category: DishCategory;
}

export interface NutrientItem {
  name: string;
  value: string;
  numericValue?: number;
  unit?: string;
}

export interface MealService {
  date: string;          // YYYYMMDD
  formattedDate: string; // YYYY-MM-DD
  mealCode: '1' | '2' | '3'; // 1: 조식, 2: 중식, 3: 석식
  mealName: string;      // 조식, 중식, 석식
  dishes: DishItem[];
  calorie: string;       // e.g. "736.0 Kcal"
  calorieValue: number;  // 736
  nutrients: NutrientItem[];
  originInfo: string[];
  dinersCount?: number;
}

export interface DayMeals {
  date: Date;
  dateStr: string;        // YYYYMMDD
  displayDate: string;    // 9월 18일
  dayOfWeek: string;      // 월, 화, 수, 목, 금, 토, 일
  dayOfWeekNum: number;   // 0(일) ~ 6(토)
  isToday: boolean;
  breakfast?: MealService;
  lunch?: MealService;
  dinner?: MealService;
}

export interface AllergyItem {
  code: number;
  name: string;
  shortName: string;
  icon?: string;
}

export type MealTypeFilter = 'all' | '1' | '2' | '3';
export type ViewMode = 'day' | 'week';

export interface FavoriteMeal {
  id: string; // `${schoolCode}-${date}-${mealCode}`
  schoolCode: string;
  officeCode: string;
  schoolName: string;
  date: string;
  displayDate: string;
  dayOfWeek: string;
  mealCode: '1' | '2' | '3';
  mealName: string;
  dishes: string[];
  calorie: string;
  savedAt: string;
}

export type SharedDataPayload =
  | {
      type: 'favorite_school';
      schoolCode: string;
      officeCode: string;
      schoolName: string;
      schoolKind: string;
    }
  | {
      type: 'vote';
      choice: string;
      schoolCode?: string;
      schoolName?: string;
      dateStr?: string;
      mealCode?: string;
    }
  | {
      type: 'post';
      schoolCode: string;
      schoolName: string;
      content: string;
    };

