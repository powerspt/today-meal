import { MealService } from '../types';
import { parseDishString } from './allergies';

export function getSampleMealsForWeek(mondayDateStr: string): MealService[] {
  // Generate sample meals for Monday to Friday of the requested week
  const year = parseInt(mondayDateStr.slice(0, 4), 10);
  const month = parseInt(mondayDateStr.slice(4, 6), 10) - 1;
  const day = parseInt(mondayDateStr.slice(6, 8), 10);

  const monday = new Date(year, month, day);

  const sampleMenus = [
    {
      offset: 0,
      dishes: '서리태콩밥 (5)\n경상도식쇠고기무국 (5.6.16)\n청포묵김가루무침 (5.6)\n싸먹는오리&야채무침 (1.2.5.6.13.16)\n가쓰오타코야끼 (1.2.5.6.13.16)\n배추김치 (9)\n샤인머스캣',
      cal: '845.2 Kcal',
      carbs: '124.5',
      prot: '38.2',
      fat: '22.8',
    },
    {
      offset: 1,
      dishes: '수수밥\n호박고추장찌개 (5.6.10)\n어묵볶음 (1.5.6.13.18)\n숙주미나리무침\n고구마치즈닭갈비 (1.2.5.6.12.13.15.16.18)\n배추김치 (9)\n감귤주스 (13)',
      cal: '792.0 Kcal',
      carbs: '118.0',
      prot: '35.4',
      fat: '20.6',
    },
    {
      offset: 2,
      dishes: '족발덮밥 (1.5.6.10.13)\n들깨무채국 (5.6)\n피카지파이 (1.2.5.6.10.15.16)\n고구마&치즈볼 (1.2.5.6)\n배추김치 (9)\n밀크티라떼 (2)',
      cal: '860.5 Kcal',
      carbs: '130.4',
      prot: '39.8',
      fat: '24.1',
    },
    {
      offset: 3,
      dishes: '홍국쌀밥\n쑥갓어묵국 (1.5.6.13)\n청양풍간장불고기 (5.6.10.13)\n납작비빔만두 (5.6.10.13.16.18)\n쑥갓나물무침 (5.6.13)\n배추김치 (9)\n수제마카롱 (1.2)',
      cal: '815.7 Kcal',
      carbs: '122.3',
      prot: '36.5',
      fat: '21.0',
    },
    {
      offset: 4,
      dishes: '쌀밥\n콩나물된장국 (5.6)\n분모자안동찜닭 (5.6.13.15.16)\n불마요들기름막국수 (1.2.3.5.6.13.15.16)\n취나물들깨볶음 (5.6)\n행운황치즈타르트 (1.2.5.6.16)\n배추김치 (9)',
      cal: '836.0 Kcal',
      carbs: '126.8',
      prot: '41.2',
      fat: '23.5',
    },
  ];

  return sampleMenus.map(item => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + item.offset);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}${mm}${dd}`;

    return {
      date: dateStr,
      formattedDate: `${yyyy}-${mm}-${dd}`,
      mealCode: '2' as const,
      mealName: '중식',
      dishes: parseDishString(item.dishes),
      calorie: item.cal,
      calorieValue: parseFloat(item.cal) || 800,
      nutrients: [
        { name: '탄수화물', value: `${item.carbs}g`, numericValue: parseFloat(item.carbs), unit: 'g' },
        { name: '단백질', value: `${item.prot}g`, numericValue: parseFloat(item.prot), unit: 'g' },
        { name: '지방', value: `${item.fat}g`, numericValue: parseFloat(item.fat), unit: 'g' },
        { name: '칼슘', value: '210.5mg', numericValue: 210.5, unit: 'mg' },
        { name: '비타민C', value: '18.4mg', numericValue: 18.4, unit: 'mg' },
      ],
      originInfo: [
        '쌀 : 국내산',
        '쇠고기 : 국내산(한우)',
        '돼지고기 : 국내산',
        '닭고기 : 국내산',
        '오리고기 : 국내산',
        '배추김치(배추/고춧가루) : 국내산',
      ],
    };
  });
}
