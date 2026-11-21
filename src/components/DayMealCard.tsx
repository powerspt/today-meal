import React, { useState } from 'react';
import { DayMeals, DishCategory, MealService, MealTypeFilter } from '../types';
import { ALLERGY_MAP } from '../data/allergies';
import { Flame, Info, Utensils, AlertTriangle, Sparkles, Star, ThumbsUp } from 'lucide-react';

interface DayMealCardProps {
  dayMeal: DayMeals;
  selectedMealType: MealTypeFilter;
  userAllergies: number[];
  onOpenDetail: (meal: MealService, dayText: string) => void;
  isFavoriteMeal: (dateStr: string, mealCode: '1' | '2' | '3') => boolean;
  onToggleFavoriteMeal: (dayMeal: DayMeals, meal: MealService) => void;
  getMealLikeCount: (dateStr: string, mealCode: '1' | '2' | '3') => number;
  onLikeMeal: (dayMeal: DayMeals, meal: MealService) => void;
  likingMealKey?: string | null;
  getMealRatingStats: (dateStr: string, mealCode: '1' | '2' | '3') => { average: number; count: number };
  onRateMeal: (dayMeal: DayMeals, meal: MealService, score: number) => void;
  ratingMealKey?: string | null;
}

const CATEGORY_COLORS: Record<DishCategory, { bg: string; text: string; label: string }> = {
  rice: { bg: 'bg-amber-50 border-amber-200/80', text: 'text-amber-800', label: '밥' },
  soup: { bg: 'bg-blue-50 border-blue-200/80', text: 'text-blue-800', label: '국' },
  main: { bg: 'bg-rose-50 border-rose-200/80', text: 'text-rose-800', label: '메인' },
  side: { bg: 'bg-emerald-50 border-emerald-200/80', text: 'text-emerald-800', label: '반찬' },
  dessert: { bg: 'bg-purple-50 border-purple-200/80', text: 'text-purple-800', label: '후식' },
  other: { bg: 'bg-slate-50 border-slate-200/80', text: 'text-slate-700', label: '기타' },
};

export const DayMealCard: React.FC<DayMealCardProps> = ({
  dayMeal,
  selectedMealType,
  userAllergies,
  onOpenDetail,
  isFavoriteMeal,
  onToggleFavoriteMeal,
  getMealLikeCount,
  onLikeMeal,
  likingMealKey,
  getMealRatingStats,
  onRateMeal,
  ratingMealKey,
}) => {
  const { displayDate, dayOfWeek, isToday, breakfast, lunch, dinner } = dayMeal;
  const [hoverScoreMap, setHoverScoreMap] = useState<Record<string, number>>({});

  const mealsToRender: MealService[] = [];
  if (selectedMealType === 'all') {
    if (breakfast) mealsToRender.push(breakfast);
    if (lunch) mealsToRender.push(lunch);
    if (dinner) mealsToRender.push(dinner);
  } else if (selectedMealType === '1' && breakfast) {
    mealsToRender.push(breakfast);
  } else if (selectedMealType === '2' && lunch) {
    mealsToRender.push(lunch);
  } else if (selectedMealType === '3' && dinner) {
    mealsToRender.push(dinner);
  }

  const hasMeals = mealsToRender.length > 0;

  return (
    <div
      id={`day-card-${dayMeal.dateStr}`}
      className={`flex flex-col h-full rounded-2xl border transition-all ${
        isToday
          ? 'bg-gradient-to-b from-emerald-50/70 to-white border-emerald-400/90 shadow-md ring-2 ring-emerald-500/20'
          : 'bg-white border-slate-200/90 shadow-xs hover:border-slate-300'
      }`}
    >
      {/* Card Header */}
      <div
        className={`p-4 border-b ${
          isToday ? 'border-emerald-100 bg-emerald-50/50' : 'border-slate-100'
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm ${
              isToday
                ? 'bg-emerald-600 text-white shadow-xs'
                : dayOfWeek === '토'
                ? 'bg-blue-50 text-blue-600'
                : dayOfWeek === '일'
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-100 text-slate-700'
            }`}
          >
            {dayOfWeek}
          </span>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-900 text-sm">{displayDate}</span>
              {isToday && (
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-600 text-white tracking-wide">
                  <Sparkles className="w-2.5 h-2.5" />
                  오늘
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Calorie preview */}
        {hasMeals && (
          <div className="flex items-center gap-1 text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200/60">
            <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{mealsToRender[0]?.calorie || '칼로리 정보 없음'}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        {!hasMeals ? (
          <div className="py-12 flex flex-col items-center justify-center text-center text-slate-400">
            <Utensils className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
            <p className="text-xs font-medium text-slate-500">급식 정보가 없습니다</p>
            <p className="text-[11px] text-slate-400 mt-0.5">휴일 또는 식단 미등록일입니다</p>
          </div>
        ) : (
          <div className="space-y-4">
            {mealsToRender.map((meal) => {
              const matchingAllergensInMeal = new Set<number>();
              meal.dishes.forEach((d) => {
                d.allergyCodes.forEach((code) => {
                  if (userAllergies.includes(code)) {
                    matchingAllergensInMeal.add(code);
                  }
                });
              });

              const mealKey = `${dayMeal.dateStr}-${meal.mealCode}`;
              const mealFav = isFavoriteMeal(dayMeal.dateStr, meal.mealCode);
              const likeCount = getMealLikeCount(dayMeal.dateStr, meal.mealCode);
              const isLiking = likingMealKey === mealKey;
              const ratingStats = getMealRatingStats(dayMeal.dateStr, meal.mealCode);
              const isRating = ratingMealKey === mealKey;
              const hoverScore = hoverScoreMap[mealKey] || 0;

              return (
                <div key={`${meal.date}-${meal.mealCode}`} className="space-y-2.5">
                  {selectedMealType === 'all' && (
                    <div className="flex items-center justify-between pb-1 border-b border-dashed border-slate-200">
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {meal.mealName}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {meal.calorie}
                      </span>
                    </div>
                  )}

                  {matchingAllergensInMeal.size > 0 && (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-semibold text-[11px]">
                        내 알레르기 주의:{' '}
                        {Array.from(matchingAllergensInMeal)
                          .map((c) => ALLERGY_MAP[c]?.shortName || `${c}번`)
                          .join(', ')}
                      </span>
                    </div>
                  )}

                  <ul className="space-y-2">
                    {meal.dishes.map((dish) => {
                      const categoryStyle =
                        CATEGORY_COLORS[dish.category] || CATEGORY_COLORS.other;
                      const hasUserAllergy = dish.allergyCodes.some((code) =>
                        userAllergies.includes(code)
                      );

                      return (
                        <li
                          key={dish.id}
                          className={`flex items-start justify-between gap-2 text-xs p-1.5 rounded-xl transition-colors ${
                            hasUserAllergy
                              ? 'bg-amber-50/80 border border-amber-200/90'
                              : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span
                              className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${categoryStyle.bg} ${categoryStyle.text}`}
                            >
                              {categoryStyle.label}
                            </span>
                            <span
                              className={`font-medium truncate ${
                                hasUserAllergy ? 'text-amber-950 font-bold' : 'text-slate-800'
                              }`}
                              title={dish.name}
                            >
                              {dish.name}
                            </span>
                          </div>

                          {dish.allergyCodes.length > 0 && (
                            <div className="flex items-center gap-1 shrink-0">
                              {hasUserAllergy ? (
                                <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-1.5 py-0.5 rounded-full border border-amber-300">
                                  주의!
                                </span>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  {dish.allergyCodes.slice(0, 3).join('.')}
                                  {dish.allergyCodes.length > 3 && '+'}
                                </span>
                              )}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>

                  {/* Meal Rating (급식 평가하기 1~5점) */}
                  <div className="p-2 rounded-xl bg-slate-50/90 border border-slate-200/70 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-700">급식 평가하기</span>
                      <span className="font-bold text-amber-700">
                        {ratingStats.count > 0
                          ? `★ ${ratingStats.average.toFixed(1)} (${ratingStats.count}명)`
                          : '첫 평가 남기기'}
                      </span>
                    </div>
                    <div
                      className="flex items-center justify-between gap-1"
                      onMouseLeave={() =>
                        setHoverScoreMap((prev) => ({ ...prev, [mealKey]: 0 }))
                      }
                    >
                      {[1, 2, 3, 4, 5].map((score) => {
                        const active =
                          hoverScore > 0
                            ? score <= hoverScore
                            : score <= Math.round(ratingStats.average);
                        return (
                          <button
                            key={`rate-${mealKey}-${score}`}
                            type="button"
                            disabled={isRating}
                            onMouseEnter={() =>
                              setHoverScoreMap((prev) => ({ ...prev, [mealKey]: score }))
                            }
                            onClick={() => onRateMeal(dayMeal, meal, score)}
                            className="flex-1 py-1 rounded-lg hover:bg-amber-50 flex items-center justify-center transition-colors disabled:opacity-50"
                            title={`${score}점 평가하기`}
                            aria-label={`${score}점 평가`}
                          >
                            <Star
                              className={`w-4 h-4 transition-transform hover:scale-110 ${
                                active
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-slate-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meal Actions: Favorite + Like Vote + Details */}
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onToggleFavoriteMeal(dayMeal, meal)}
                        className={`flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg border transition-colors ${
                          mealFav
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : 'bg-white text-slate-600 border-slate-200/80 hover:bg-slate-50'
                        }`}
                        title="이 식단 즐겨찾기 저장"
                      >
                        <Star
                          className={`w-3.5 h-3.5 ${
                            mealFav ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                          }`}
                        />
                        <span>{mealFav ? '저장됨' : '식단 저장'}</span>
                      </button>

                      <button
                        type="button"
                        disabled={isLiking}
                        onClick={() => onLikeMeal(dayMeal, meal)}
                        className="flex-1 flex items-center justify-center gap-1 text-[11px] font-semibold py-1.5 rounded-lg border bg-white text-slate-600 border-slate-200/80 hover:bg-emerald-50/70 hover:text-emerald-700 hover:border-emerald-200 transition-colors disabled:opacity-50"
                        title="이 식단 좋아요 누르기"
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>좋아요 {likeCount > 0 ? likeCount : ''}</span>
                      </button>
                    </div>

                    <button
                      id={`detail-btn-${dayMeal.dateStr}-${meal.mealCode}`}
                      onClick={() =>
                        onOpenDetail(
                          meal,
                          `${displayDate} (${dayOfWeek}) ${meal.mealName}`
                        )
                      }
                      className="w-full flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/80 py-1.5 rounded-lg border border-slate-200/80 transition-colors group"
                    >
                      <Info className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600" />
                      <span>영양성분 및 원산지 확인</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
