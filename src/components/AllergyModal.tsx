import React from 'react';
import { ALLERGY_LIST } from '../data/allergies';
import { ShieldAlert, X, Check, RotateCcw, Info } from 'lucide-react';

interface AllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAllergies: number[];
  onToggleAllergy: (code: number) => void;
  onClearAllergies: () => void;
}

export const AllergyModal: React.FC<AllergyModalProps> = ({
  isOpen,
  onClose,
  selectedAllergies,
  onToggleAllergy,
  onClearAllergies,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="allergy-settings-modal-container"
        className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">내 알레르기 설정</h2>
              <p className="text-xs text-slate-500">식단표에서 해당 성분을 자동으로 강조 표시합니다</p>
            </div>
          </div>
          <button
            id="close-allergy-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info Banner */}
        <div className="p-3.5 mx-4 mt-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
          <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            교육부 학교급식법에 따른 19종 알레르기 유발 물질 기준입니다. 보유하신 알레르기 항목을 선택하시면 이번 주 식단에서 시각적인 주의 배지로 안내해 드립니다.
          </p>
        </div>

        {/* 19 Allergens Grid */}
        <div className="p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ALLERGY_LIST.map((item) => {
              const isChecked = selectedAllergies.includes(item.code);
              return (
                <button
                  key={`allergy-${item.code}`}
                  onClick={() => onToggleAllergy(item.code)}
                  className={`p-2.5 rounded-xl border text-left flex items-center justify-between gap-1.5 transition-all text-xs font-medium ${
                    isChecked
                      ? 'bg-amber-100/80 border-amber-300 text-amber-950 font-bold shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-mono font-bold flex items-center justify-center text-slate-600 shrink-0">
                      {item.code}
                    </span>
                    <span className="truncate">{item.name}</span>
                  </div>

                  <div
                    className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isChecked
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <button
            id="clear-all-allergies-btn"
            onClick={onClearAllergies}
            disabled={selectedAllergies.length === 0}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>선택 전체 해제</span>
          </button>

          <button
            id="confirm-allergy-modal-btn"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            확인 ({selectedAllergies.length}개 선택됨)
          </button>
        </div>
      </div>
    </div>
  );
};
