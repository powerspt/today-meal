export interface MealFaqItem {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
}

export const MEAL_FAQ_LIST: MealFaqItem[] = [
  {
    id: 'faq-allergy-numbers',
    question: '알레르기 번호(1~19번)는 무엇을 뜻하고 어떻게 확인하나요?',
    answer:
      '메뉴 옆에 표시된 숫자는 교육부 학교급식 알레르기 유발 식품 19종(1:난류, 2:우유, 3:메밀, 4:땅콩, 5:대두, 6:밀, 7:고등어, 8:게, 9:새우, 10:돼지고기, 11:복숭아, 12:토마토, 13:아황산류, 14:호두, 15:닭고기, 16:쇠고기, 17:오징어, 18:조개류, 19:잣)입니다. 상단의 "알레르기" 버튼을 눌러 본인에게 해당하는 항목을 선택하면 식단표에서 노란색 주의 배지로 바로 강조해 드립니다.',
    keywords: ['알레르기', '번호', '숫자', '19종', '유발', '주의', '식품'],
  },
  {
    id: 'faq-school-search',
    question: '우리 학교 급식 식단표는 어떻게 검색하고 바꾸나요?',
    answer:
      '상단의 학교 이름 버튼이나 "학교 검색"을 눌러 초·중·고등학교 이름을 입력하면 교육부 나이스(NEIS) 데이터베이스에서 실시간으로 학교를 찾아 전환할 수 있습니다. 자주 보는 학교는 별(★) 버튼을 눌러 즐겨찾기에 등록해 두면 한 번에 이동할 수 있어요.',
    keywords: ['학교', '검색', '바꾸기', '변경', '찾기', '초등학교', '중학교', '고등학교'],
  },
  {
    id: 'faq-favorites',
    question: '즐겨찾기 기능은 어떻게 사용하나요?',
    answer:
      '학교 이름 옆의 별(★) 아이콘을 누르면 즐겨찾는 학교로 저장되어 상단 빠른 선택 바와 "즐겨찾기" 메뉴에 등록됩니다. 또한 각 요일 식단 카드의 "식단 저장" 버튼을 누르면 기억하고 싶은 급식 식단을 모아 볼 수 있습니다.',
    keywords: ['즐겨찾기', '저장', '별표', '북마크', '식단저장', '학교저장'],
  },
  {
    id: 'faq-meal-types',
    question: '중식 말고 조식(아침)이나 석식(저녁) 급식도 볼 수 있나요?',
    answer:
      '네! 학교에서 조식이나 석식을 제공하는 경우 주간 탐색 바의 필터에서 "조식(아침)", "중식(점심)", "석식(저녁)", "전체" 버튼을 선택해 원하는 시간대 식단을 확인할 수 있습니다.',
    keywords: ['조식', '중식', '석식', '아침', '점심', '저녁', '전체'],
  },
  {
    id: 'faq-nutrition-origin',
    question: '칼로리, 영양성분, 식재료 원산지는 어디에서 확인하나요?',
    answer:
      '각 요일 식단 카드 오른쪽 상단에 총 칼로리(Kcal)가 표시되며, 카드 하단의 "영양성분 및 원산지 확인" 버튼을 누르면 탄수화물·단백질·지방·칼슘·비타민 함량과 쌀·육류·김치 등의 원산지를 자세히 볼 수 있습니다.',
    keywords: ['칼로리', '영양성분', '영양', '원산지', '탄수화물', '단백질', '지방', '칼슘'],
  },
  {
    id: 'faq-no-meal-sample',
    question: '특정 날짜나 주간에 급식 정보가 없거나 예시 식단이 나오는 이유는 무엇인가요?',
    answer:
      '학교의 공휴일, 개교기념일, 방학, 재량휴업일이거나 학교 영양사 선생님께서 아직 나이스(NEIS)에 해당 주차 식단을 등록하지 않으신 경우입니다. 등록 전 주차는 안내 배너와 함께 예시 추천 식단을 참고용으로 보여 드립니다.',
    keywords: ['식단없음', '방학', '휴일', '예시', '미등록', '안나와요', '정보없음'],
  },
  {
    id: 'faq-week-navigation',
    question: '지난주나 다음주 급식 식단은 어떻게 보나요?',
    answer:
      '식단표 위의 날짜 옆 좌우 화살표(<, >) 버튼을 누르면 지난주와 다음주 급식으로 이동합니다. 다른 주를 보다가 "이번 주" 버튼을 누르면 오늘 날짜가 포함된 이번 주 식단으로 즉시 돌아옵니다.',
    keywords: ['지난주', '다음주', '이번주', '날짜', '이동', '달력', '주간'],
  },
  {
    id: 'faq-share-copy',
    question: '이번 주 급식 식단을 친구나 가족에게 공유하려면 어떻게 하나요?',
    answer:
      '화면 오른쪽 위의 "식단 공유" 버튼을 누르면 현재 선택된 학교의 이번 주 월요일부터 금요일까지의 식단과 칼로리가 깔끔한 텍스트로 복사되어 카카오톡이나 메신저에 바로 붙여넣을 수 있습니다.',
    keywords: ['공유', '복사', '친구', '카톡', '텍스트', '내보내기'],
  },
  {
    id: 'faq-view-mode',
    question: '주간 한눈에 보기와 요일별 크게 보기는 어떻게 바꾸나요?',
    answer:
      '주간 탐색 바 오른쪽의 격자 아이콘(주간 5일 보기)과 달력 탭 아이콘(요일별 크게 보기)을 눌러 화면 배치를 바꿀 수 있습니다. 모바일에서는 요일별 크게 보기를 사용하면 오늘 메뉴를 더 넓고 편하게 볼 수 있습니다.',
    keywords: ['보기', '화면', '모바일', '요일별', '격자', '레이아웃', '탭'],
  },
  {
    id: 'faq-community-vote',
    question: '급식 좋아요와 한줄평은 어떻게 남기나요?',
    answer:
      '각 요일 식단 카드의 좋아요 버튼을 누르거나 상단 "급식 소통" 메뉴로 이동하면 이번 주 기대되는 메뉴 투표와 짧은 한줄평을 남길 수 있습니다. 개인정보 보호를 위해 이름, 학번, 연락처는 적지 마세요.',
    keywords: ['좋아요', '투표', '한줄평', '소통', '댓글', '리뷰', '추천'],
  },
  {
    id: 'faq-data-source',
    question: '급식 정보는 어디에서 가져오며 실시간으로 업데이트되나요?',
    answer:
      '본 앱은 교육부 나이스(NEIS) 공식 오픈 API를 통해 전국 학교의 급식 식단 데이터를 실시간으로 불러옵니다. 학교에서 식단을 수정하거나 새로 등록하면 앱을 다시 열었을 때 바로 반영됩니다.',
    keywords: ['나이스', '출처', '공식', '교육부', '업데이트', '실시간', '데이터'],
  },
  {
    id: 'faq-privacy-data',
    question: '내가 설정한 학교와 알레르기 정보는 어디에 저장되나요?',
    answer:
      '선택한 학교, 알레르기 19종 필터, 즐겨찾기 식단은 현재 사용 중인 기기(브라우저)에 안전하게 저장되며, 학교 즐겨찾기 추천·투표·한줄평은 공유 저장소에 저장됩니다.',
    keywords: ['개인정보', '브라우저', '기기', '저장위치', '보관', '알레르기설정'],
  },
];

export const QUICK_FAQ_QUESTIONS: string[] = [
  '알레르기 번호는 어떻게 확인하나요?',
  '우리 학교 급식 어떻게 검색하나요?',
  '즐겨찾기 기능은 어떻게 쓰나요?',
  '칼로리와 원산지는 어디서 보나요?',
];

const KOREAN_PARTICLES = [
  '에서',
  '으로',
  '부터',
  '까지',
  '이랑',
  '한테',
  '에게',
  '보다',
  '은',
  '는',
  '이',
  '가',
  '을',
  '를',
  '에',
  '의',
  '도',
  '로',
  '와',
  '과',
  '랑',
  '만',
];

function stripParticle(word: string): string {
  let cleaned = word.trim();
  for (const particle of KOREAN_PARTICLES) {
    if (cleaned.length > particle.length + 1 && cleaned.endsWith(particle)) {
      cleaned = cleaned.slice(0, -particle.length);
      break;
    }
  }
  return cleaned;
}

export function extractSearchTokens(text: string): string[] {
  const normalized = text
    .toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .map(stripParticle)
    .filter((token) => token.length >= 2);

  return Array.from(new Set(normalized));
}

export function findBestFaqMatch(query: string): MealFaqItem | null {
  const queryTokens = extractSearchTokens(query);
  if (queryTokens.length === 0) return null;

  let bestItem: MealFaqItem | null = null;
  let bestScore = 0;

  for (const item of MEAL_FAQ_LIST) {
    const targetTokens = Array.from(
      new Set([
        ...extractSearchTokens(item.question),
        ...item.keywords.flatMap((k) => extractSearchTokens(k)),
      ])
    );

    let score = 0;
    for (const qTok of queryTokens) {
      for (const tTok of targetTokens) {
        if (qTok === tTok) {
          score += qTok.length * 2;
        } else if (
          qTok.length >= 2 &&
          tTok.length >= 2 &&
          (tTok.includes(qTok) || qTok.includes(tTok))
        ) {
          score += Math.min(qTok.length, tTok.length);
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  return bestScore > 0 ? bestItem : null;
}
