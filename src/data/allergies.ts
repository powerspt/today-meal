import { AllergyItem, DishCategory, DishItem } from '../types';

export const ALLERGY_LIST: AllergyItem[] = [
  { code: 1, name: '난류(달걀)', shortName: '난류' },
  { code: 2, name: '우유', shortName: '우유' },
  { code: 3, name: '메밀', shortName: '메밀' },
  { code: 4, name: '땅콩', shortName: '땅콩' },
  { code: 5, name: '대두(콩)', shortName: '대두' },
  { code: 6, name: '밀(글루텐)', shortName: '밀' },
  { code: 7, name: '고등어', shortName: '고등어' },
  { code: 8, name: '게', shortName: '게' },
  { code: 9, name: '새우', shortName: '새우' },
  { code: 10, name: '돼지고기', shortName: '돼지' },
  { code: 11, name: '복숭아', shortName: '복숭아' },
  { code: 12, name: '토마토', shortName: '토마토' },
  { code: 13, name: '아황산류', shortName: '아황산' },
  { code: 14, name: '호두', shortName: '호두' },
  { code: 15, name: '닭고기', shortName: '닭고기' },
  { code: 16, name: '쇠고기', shortName: '쇠고기' },
  { code: 17, name: '오징어', shortName: '오징어' },
  { code: 18, name: '조개류(굴,전복,홍합 등)', shortName: '조개류' },
  { code: 19, name: '잣', shortName: '잣' },
];

export const ALLERGY_MAP: Record<number, AllergyItem> = ALLERGY_LIST.reduce(
  (acc, item) => {
    acc[item.code] = item;
    return acc;
  },
  {} as Record<number, AllergyItem>
);

export function getAllergyNames(codes: number[]): string[] {
  return codes.map(c => ALLERGY_MAP[c]?.shortName || `${c}번`).filter(Boolean);
}

// Culinary categorization based on typical Korean school meal naming conventions
export function categorizeDish(dishName: string): DishCategory {
  const clean = dishName.trim().toLowerCase();

  // Rice / staple
  if (
    clean.endsWith('밥') ||
    clean.includes('비빔밥') ||
    clean.includes('볶음밥') ||
    clean.includes('덮밥') ||
    clean.includes('카레라이스') ||
    clean.includes('짜장밥') ||
    clean.includes('하이라이스') ||
    clean.includes('죽')
  ) {
    return 'rice';
  }

  // Soup / Stew
  if (
    clean.endsWith('국') ||
    clean.endsWith('탕') ||
    clean.endsWith('찌개') ||
    clean.includes('스프') ||
    clean.includes('장국') ||
    clean.includes('미역국') ||
    clean.includes('된장국')
  ) {
    return 'soup';
  }

  // Dessert / Drinks / Fruit
  if (
    clean.includes('우유') ||
    clean.includes('라떼') ||
    clean.includes('스무디') ||
    clean.includes('에이드') ||
    clean.includes('요구르트') ||
    clean.includes('요플레') ||
    clean.includes('주스') ||
    clean.includes('음료') ||
    clean.includes('과일') ||
    clean.includes('샤인머스캣') ||
    clean.includes('사과') ||
    clean.includes('배') ||
    clean.includes('딸기') ||
    clean.includes('포도') ||
    clean.includes('바나나') ||
    clean.includes('타르트') ||
    clean.includes('케이크') ||
    clean.includes('케익') ||
    clean.includes('와플') ||
    clean.includes('푸딩') ||
    clean.includes('젤리') ||
    clean.includes('아이스크림') ||
    clean.includes('떡')
  ) {
    return 'dessert';
  }

  // Main dish
  if (
    clean.includes('불고기') ||
    clean.includes('갈비') ||
    clean.includes('찜닭') ||
    clean.includes('닭갈비') ||
    clean.includes('돈까스') ||
    clean.includes('치킨') ||
    clean.includes('탕수육') ||
    clean.includes('함박') ||
    clean.includes('스테이크') ||
    clean.includes('구이') ||
    clean.includes('볶음') ||
    clean.includes('까스') ||
    clean.includes('커틀릿') ||
    clean.includes('조림') ||
    clean.includes('오리') ||
    clean.includes('족발') ||
    clean.includes('파스타') ||
    clean.includes('스파게티') ||
    clean.includes('피자') ||
    clean.includes('버거') ||
    clean.includes('타코야끼') ||
    clean.includes('면') ||
    clean.includes('국수')
  ) {
    return 'main';
  }

  // Side dishes / Kimchi / Salad / Namul
  if (
    clean.includes('김치') ||
    clean.includes('깍두기') ||
    clean.includes('겉절이') ||
    clean.includes('나물') ||
    clean.includes('무침') ||
    clean.includes('샐러드') ||
    clean.includes('피클') ||
    clean.includes('장아찌') ||
    clean.includes('조림')
  ) {
    return 'side';
  }

  return 'other';
}

/**
 * Parses a dish line from NEIS API:
 * Example: "분모자안동찜닭 (5.6.13.15.16)" -> name: "분모자안동찜닭", allergyCodes: [5, 6, 13, 15, 16]
 */
export function parseDishString(rawString: string): DishItem[] {
  if (!rawString) return [];

  // NEIS dishes can be separated by <br/>, newline, or spaces
  const lines = rawString
    .replace(/<br\s*[\/]?>/gi, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(Boolean);

  return lines.map((line, idx) => {
    // Extract allergy parentheses like (1.2.5.6.13) or (1/2/5)
    const match = line.match(/\(([\d\.\s\/]+)\)/);
    let name = line;
    let allergyCodes: number[] = [];

    if (match) {
      name = line.replace(match[0], '').trim();
      const codeStrings = match[1].split(/[\.\/\s]+/).filter(Boolean);
      allergyCodes = codeStrings
        .map(c => parseInt(c, 10))
        .filter(n => !isNaN(n) && n >= 1 && n <= 19);
    }

    // Clean up any trailing symbols, brackets or asterisk
    name = name.replace(/[*#]/g, '').trim();

    return {
      id: `${name}-${idx}`,
      name,
      allergyCodes,
      category: categorizeDish(name),
    };
  });
}
