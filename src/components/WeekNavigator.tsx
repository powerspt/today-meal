import React from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar, LayoutGrid, CalendarDays } from 'lucide-react';
import { MealTypeFilter, ViewMode } from '../types';

interface WeekNavigatorProps {
  weekRangeText: string;
  isCurrentWeek: boolean;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onResetToThisWeek: () => void;
  selectedMealType: MealTypeFilter;
  onSelectMealType: (type: MealTypeFilter) => void;
  viewMode: ViewMode;
  onToggleViewMode: (mode: ViewMode) => void;
  hasBreakfast: boolean;
  hasDinner: boolean;
}

export const WeekNavigator: React.FC<WeekNavigatorProps> = ({
  weekRangeText,
  isCurrentWeek,
  onPrevWeek,
  onNextWeek,
  onResetToThisWeek,
  selectedMealType,
  onSelectMealType,
  viewMode,
  onToggleViewMode,
  hasBreakfast,
  hasDinner,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 sm:p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3.5">
        
        {/* Week navigation control */}
        <div className="flex items-center justify-between sm:justify-start gap-2">
          <div className="flex items-center bg-slate-100/90 rounded-xl p-0.5 border border-slate-200/60">
            <button
              id="prev-week-btn"
              onClick={onPrevWeek}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs active:scale-95"
              title="지난주 식단표"
              aria-label="지난주"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              id="next-week-btn"
              onClick={onNextWeek}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-xs active:scale-95"
              title="다음주 식단표"
              aria-label="다음주"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-sm sm:text-base">
              <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{weekRangeText}</span>
            </div>

            {!isCurrentWeek && (
              <button
                id="reset-this-week-btn"
                onClick={onResetToThisWeek}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/70 rounded-lg transition-colors"
                title="오늘이 속한 이번 주로 이동"
              >
                <RotateCcw className="w-3 h-3" />
                <span>이번 주</span>
              </button>
            )}
          </div>
        </div>

        {/* Filters: Meal Type & View Mode */}
        <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
          {/* Meal Type Filter */}
          <div className="inline-flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              id="filter-lunch-btn"
              onClick={() => onSelectMealType('2')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedMealType === '2'
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              중식(점심)
            </button>

            {hasBreakfast && (
              <button
                id="filter-breakfast-btn"
                onClick={() => onSelectMealType('1')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedMealType === '1'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                조식(아침)
              </button>
            )}

            {hasDinner && (
              <button
                id="filter-dinner-btn"
                onClick={() => onSelectMealType('3')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  selectedMealType === '3'
                    ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                석식(저녁)
              </button>
            )}

            <button
              id="filter-all-meals-btn"
              onClick={() => onSelectMealType('all')}
              className={`px-2.5 py-1.5 rounded-lg font-medium transition-all ${
                selectedMealType === 'all'
                  ? 'bg-white text-emerald-800 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체
            </button>
          </div>

          {/* View mode toggle (Grid vs Tab) */}
          <div className="inline-flex bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs">
            <button
              id="view-grid-btn"
              onClick={() => onToggleViewMode('week')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'week'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="주간 5일 한눈에 보기"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              id="view-day-btn"
              onClick={() => onToggleViewMode('day')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
              title="요일별 크게 보기"
            >
              <CalendarDays className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
