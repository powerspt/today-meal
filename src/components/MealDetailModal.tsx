import React from 'react';
import { MealService } from '../types';
import { ALLERGY_MAP } from '../data/allergies';
import { X, Flame, Apple, ShieldCheck, MapPin, Sparkles } from 'lucide-react';

interface MealDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: MealService | null;
  dayText: string;
}

export const MealDetailModal: React.FC<MealDetailModalProps> = ({
  isOpen,
  onClose,
  meal,
  dayText,
}) => {
  if (!isOpen || !meal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="meal-detail-modal-container"
        className="bg-white rounded-3xl w-full max-w-xl max-h-[88vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                {meal.mealName}
              </span>
              <h2 className="text-base font-bold text-slate-900">{dayText}</h2>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                {meal.calorie || '칼로리 정보 없음'}
              </span>
              {meal.dinersCount && (
                <span className="text-[11px] text-slate-500">
                  급식 인원: 약 {meal.dinersCount}명
                </span>
              )}
            </div>
          </div>
          <button
            id="close-meal-detail-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Scrollable */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-slate-800">
          
          {/* Menu Items with Allergen breakdown */}
          <div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>식단 메뉴 및 알레르기 유발 물질</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {meal.dishes.map((dish) => (
                <div
                  key={`modal-${dish.id}`}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1"
                >
                  <div className="font-semibold text-sm text-slate-900">{dish.name}</div>
                  {dish.allergyCodes.length > 0 ? (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {dish.allergyCodes.map((code) => {
                        const item = ALLERGY_MAP[code];
                        return (
                          <span
                            key={`tag-${dish.id}-${code}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200 font-medium"
                          >
                            {item?.shortName || `${code}번`}
                          </span>
                        );
                      })}
                    </div>
                  ) : (
                    <span className="text-[10px] text-slate-400">알레르기 성분 미포함</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Nutrients Breakdown */}
          {meal.nutrients && meal.nutrients.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <Apple className="w-3.5 h-3.5 text-emerald-600" />
                <span>영양 성분 분석</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {meal.nutrients.map((n, i) => (
                  <div
                    key={`nutrient-${i}`}
                    className="p-2.5 rounded-xl border border-slate-100 bg-emerald-50/30 flex flex-col justify-between"
                  >
                    <span className="text-[11px] text-slate-500 font-medium">{n.name}</span>
                    <span className="text-sm font-bold text-slate-800 mt-0.5">{n.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Origins Breakdown */}
          {meal.originInfo && meal.originInfo.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>식재료 원산지 정보</span>
              </h3>
              <div className="p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/70 text-xs text-slate-700 leading-relaxed grid grid-cols-1 sm:grid-cols-2 gap-y-1 gap-x-4">
                {meal.originInfo.map((origin, i) => (
                  <div key={`origin-${i}`} className="flex items-center gap-1.5 py-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                    <span className="truncate">{origin}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-100 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
