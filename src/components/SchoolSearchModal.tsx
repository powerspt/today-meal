import React, { useState, useEffect, useId } from 'react';
import { SchoolInfo } from '../types';
import { searchSchools } from '../services/neisApi';
import { PRESET_SCHOOLS } from '../data/presetSchools';
import { Search, X, MapPin, Building2, Clock, Check, Loader2, Star } from 'lucide-react';

interface SchoolSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSchool: SchoolInfo;
  onSelectSchool: (school: SchoolInfo) => void;
  recentSchools: SchoolInfo[];
  favoriteSchools: SchoolInfo[];
  onToggleFavoriteSchool: (school: SchoolInfo) => void;
}

export const SchoolSearchModal: React.FC<SchoolSearchModalProps> = ({
  isOpen,
  onClose,
  currentSchool,
  onSelectSchool,
  recentSchools,
  favoriteSchools,
  onToggleFavoriteSchool,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SchoolInfo[]>(PRESET_SCHOOLS);
  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState<string>('전체');
  const searchInputId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(async () => {
      if (!query.trim()) {
        setResults(PRESET_SCHOOLS);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const data = await searchSchools(query);
        setResults(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  if (!isOpen) return null;

  const filteredResults = results.filter((s) => {
    if (filterType === '전체') return true;
    return s.SCHUL_KND_SC_NM?.includes(filterType);
  });

  const isFav = (code: string) =>
    favoriteSchools.some((s) => s.SD_SCHUL_CODE === code);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="school-search-modal-container"
        className="bg-white rounded-3xl w-full max-w-xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Modal Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-600" />
            <h2 className="text-base font-bold text-slate-900">학교 검색</h2>
          </div>
          <button
            id="close-school-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input Bar */}
        <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id={searchInputId}
              type="text"
              placeholder="학교명을 입력하세요 (예: 서울고, 하나고, 대전대신고)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 bg-white rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 placeholder:text-slate-400 font-medium"
              autoFocus
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* School Category Pills */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto pb-1 scrollbar-none">
            {['전체', '고등학교', '중학교', '초등학교'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                  filterType === type
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Favorite Schools */}
          {!query && favoriteSchools.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 mb-1.5">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>즐겨찾는 학교</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {favoriteSchools.map((school) => (
                  <button
                    key={`fav-${school.SD_SCHUL_CODE}`}
                    onClick={() => {
                      onSelectSchool(school);
                      onClose();
                    }}
                    className="text-xs px-2.5 py-1 bg-amber-50/80 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
                  >
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                    <span>{school.SCHUL_NM}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent searches */}
          {!query && recentSchools.length > 0 && (
            <div className="pt-1">
              <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1.5">
                <Clock className="w-3 h-3" />
                <span>최근 확인한 학교</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {recentSchools.map((school) => (
                  <button
                    key={`recent-${school.SD_SCHUL_CODE}`}
                    onClick={() => {
                      onSelectSchool(school);
                      onClose();
                    }}
                    className="text-xs px-2.5 py-1 bg-white hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <span>{school.SCHUL_NM}</span>
                    <span className="text-[10px] text-slate-400">
                      {school.SCHUL_KND_SC_NM}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results List */}
        <div className="p-4 overflow-y-auto max-h-[460px] space-y-2 flex-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 text-sm">
              <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mb-2" />
              <span>전국 학교 정보를 검색하고 있습니다...</span>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-sm">
              <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2 stroke-1" />
              <p className="font-semibold text-slate-600">검색 결과가 없습니다</p>
              <p className="text-xs text-slate-400 mt-1">
                학교명이 올바른지 확인해주세요 (예: '서울고' 또는 '서울고등학교')
              </p>
            </div>
          ) : (
            filteredResults.map((school) => {
              const isSelected = school.SD_SCHUL_CODE === currentSchool.SD_SCHUL_CODE;
              const schoolFav = isFav(school.SD_SCHUL_CODE);
              return (
                <div
                  key={`${school.ATPT_OFCDC_SC_CODE}-${school.SD_SCHUL_CODE}`}
                  className={`w-full p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 ring-1 ring-emerald-500/20'
                      : 'bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/80 text-slate-800'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSchool(school);
                      onClose();
                    }}
                    className="min-w-0 flex-1 text-left"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-900 truncate">
                        {school.SCHUL_NM}
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                        {school.SCHUL_KND_SC_NM || '학교'}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 truncate">
                      <span className="font-medium text-slate-600">
                        {school.ATPT_OFCDC_SC_NM}
                      </span>
                      {school.ORG_RDNMA && (
                        <span className="flex items-center gap-1 text-slate-400 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{school.ORG_RDNMA}</span>
                        </span>
                      )}
                    </div>
                  </button>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavoriteSchool(school);
                      }}
                      className={`p-2 rounded-xl border transition-colors ${
                        schoolFav
                          ? 'bg-amber-50 border-amber-300 text-amber-500'
                          : 'bg-white border-slate-200 text-slate-300 hover:text-amber-500'
                      }`}
                      title={schoolFav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                    >
                      <Star
                        className={`w-4 h-4 ${schoolFav ? 'fill-amber-400 text-amber-500' : ''}`}
                      />
                    </button>

                    {isSelected && (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
          전국 초·중·고등학교 교육부 나이스(NEIS) 공식 데이터베이스 연동
        </div>
      </div>
    </div>
  );
};
