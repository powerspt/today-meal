import React, { useState } from 'react';
import { DayMeals, MealService, MealTypeFilter, ViewMode } from '../types';
import { DayMealCard } from './DayMealCard';
import { motion, AnimatePresence } from 'motion/react';
import { Utensils } from 'lucide-react';

interface WeeklyOverviewGridProps {
  dayMeals: DayMeals[];
  viewMode: ViewMode;
  selectedMealType: MealTypeFilter;
  userAllergies: number[];
  onOpenDetail: (meal: MealService, dayText: string) => void;
  isLoading: boolean;
  isFallback: boolean;
  isFavoriteMeal: (dateStr: string, mealCode: '1' | '2' | '3') => boolean;
  onToggleFavoriteMeal: (dayMeal: DayMeals, meal: MealService) => void;
  getMealLikeCount: (dateStr: string, mealCode: '1' | '2' | '3') => number;
  onLikeMeal: (dayMeal: DayMeals, meal: MealService) => void;
  likingMealKey?: string | null;
  getMealRatingStats: (dateStr: string, mealCode: '1' | '2' | '3') => { average: number; count: number };
  onRateMeal: (dayMeal: DayMeals, meal: MealService, score: number) => void;
  ratingMealKey?: string | null;
}

export const WeeklyOverviewGrid: React.FC<WeeklyOverviewGridProps> = ({
  dayMeals,
  viewMode,
  selectedMealType,
  userAllergies,
  onOpenDetail,
  isLoading,
  isFallback,
  isFavoriteMeal,
  onToggleFavoriteMeal,
  getMealLikeCount,
  onLikeMeal,
  likingMealKey,
  getMealRatingStats,
  onRateMeal,
  ratingMealKey,
}) => {
  const todayIndex = dayMeals.findIndex((d) => d.isToday);
  const [selectedDayTab, setSelectedDayTab] = useState<number>(
    todayIndex !== -1 ? todayIndex : 0
  );

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 animate-pulse">
          <Utensils className="w-6 h-6" />
        </div>
        <p className="text-sm font-semibold text-slate-700">이번 주 급식 식단표를 불러오는 중...</p>
        <p className="text-xs text-slate-400 mt-1">교육부 NEIS 공식 정보를 조회하고 있습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isFallback && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/90 rounded-2xl flex items-center justify-between gap-2 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            <span>
              해당 주차는 학교의 공식 급식 식단이 아직 등록되지 않았거나 방학/휴업 기간입니다. 예시 추천 식단표를 표시하고 있습니다.
            </span>
          </div>
        </div>
      )}

      {viewMode === 'week' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
          {dayMeals.map((dayMeal) => (
            <motion.div
              key={dayMeal.dateStr}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              <DayMealCard
                dayMeal={dayMeal}
                selectedMealType={selectedMealType}
                userAllergies={userAllergies}
                onOpenDetail={onOpenDetail}
                isFavoriteMeal={isFavoriteMeal}
                onToggleFavoriteMeal={onToggleFavoriteMeal}
                getMealLikeCount={getMealLikeCount}
                onLikeMeal={onLikeMeal}
                likingMealKey={likingMealKey}
                getMealRatingStats={getMealRatingStats}
                onRateMeal={onRateMeal}
                ratingMealKey={ratingMealKey}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto scrollbar-none">
            {dayMeals.map((dayMeal, idx) => {
              const isActive = selectedDayTab === idx;
              return (
                <button
                  key={`day-tab-${dayMeal.dateStr}`}
                  onClick={() => setSelectedDayTab(idx)}
                  className={`flex-1 min-w-[64px] py-2.5 px-3 rounded-xl flex flex-col items-center justify-center transition-all ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="text-xs">{dayMeal.dayOfWeek}요일</span>
                    {dayMeal.isToday && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isActive ? 'bg-amber-300' : 'bg-emerald-500'
                        }`}
                      ></span>
                    )}
                  </div>
                  <span
                    className={`text-[11px] mt-0.5 ${
                      isActive ? 'text-emerald-100' : 'text-slate-400'
                    }`}
                  >
                    {dayMeal.displayDate}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={dayMeals[selectedDayTab]?.dateStr || 'single-day'}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              {dayMeals[selectedDayTab] && (
                <DayMealCard
                  dayMeal={dayMeals[selectedDayTab]}
                  selectedMealType={selectedMealType}
                  userAllergies={userAllergies}
                  onOpenDetail={onOpenDetail}
                  isFavoriteMeal={isFavoriteMeal}
                  onToggleFavoriteMeal={onToggleFavoriteMeal}
                  getMealLikeCount={getMealLikeCount}
                  onLikeMeal={onLikeMeal}
                  likingMealKey={likingMealKey}
                  getMealRatingStats={getMealRatingStats}
                  onRateMeal={onRateMeal}
                  ratingMealKey={ratingMealKey}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
