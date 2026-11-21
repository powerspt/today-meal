import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FavoriteMeal, SchoolInfo } from '../types';
import { StoreItem, store } from '../services/store';
import {
  Star,
  School,
  Trash2,
  Flame,
  Calendar,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Plus,
  Lock,
  LogIn,
  Send,
} from 'lucide-react';

interface FavoritesPageProps {
  currentSchool: SchoolInfo;
  currentUser: string | null;
  favoriteSchools: SchoolInfo[];
  onSelectSchool: (school: SchoolInfo) => void;
  onToggleFavoriteSchool: (school: SchoolInfo) => void;
  favoriteMeals: FavoriteMeal[];
  onRemoveFavoriteMeal: (id: string) => void;
  storeItems: StoreItem[];
  privateItems: StoreItem[];
  storeLoading: boolean;
  storeError: string | null;
  onRefreshStore: () => Promise<void>;
  onRefreshPrivateStore: () => Promise<void>;
  onRecommendFavoriteSchool: (school: SchoolInfo) => Promise<void>;
  recommendingSchool: boolean;
  onOpenSchoolSearch: () => void;
  onOpenAuthModal: () => void;
  onStoreError: (err: any, requiresLogin?: boolean) => void;
}

export const FavoritesPage: React.FC<FavoritesPageProps> = ({
  currentSchool,
  currentUser,
  favoriteSchools,
  onSelectSchool,
  onToggleFavoriteSchool,
  favoriteMeals,
  onRemoveFavoriteMeal,
  storeItems,
  privateItems,
  storeLoading,
  storeError,
  onRefreshStore,
  onRefreshPrivateStore,
  onRecommendFavoriteSchool,
  recommendingSchool,
  onOpenSchoolSearch,
  onOpenAuthModal,
  onStoreError,
}) => {
  const navigate = useNavigate();
  const [privateMemoText, setPrivateMemoText] = useState('');
  const [savingPrivate, setSavingPrivate] = useState(false);

  const privateMemos = React.useMemo(() => {
    return privateItems
      .filter(
        (item) =>
          item.data?.type === 'private_memo' &&
          typeof item.data?.text === 'string'
      )
      .slice()
      .reverse();
  }, [privateItems]);

  const sharedSchoolCounts = React.useMemo(() => {
    const map = new Map<
      string,
      {
        schoolCode: string;
        officeCode: string;
        schoolName: string;
        schoolKind: string;
        count: number;
      }
    >();

    storeItems.forEach((item) => {
      if (item.data?.type === 'favorite_school' && item.data?.schoolCode) {
        const code = String(item.data.schoolCode);
        const existing = map.get(code);
        if (existing) {
          existing.count += 1;
        } else {
          map.set(code, {
            schoolCode: code,
            officeCode: String(item.data.officeCode || 'B10'),
            schoolName: String(item.data.schoolName || '학교'),
            schoolKind: String(item.data.schoolKind || '학교'),
            count: 1,
          });
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [storeItems]);

  const handleAddPrivateMemo = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = privateMemoText.trim();
    if (!trimmed) return;
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    setSavingPrivate(true);
    try {
      await store('add', {
        data: {
          type: 'private_memo',
          schoolName: currentSchool.SCHUL_NM,
          text: trimmed.slice(0, 120),
        },
        private: true,
      });
      setPrivateMemoText('');
      await onRefreshPrivateStore();
    } catch (err: any) {
      onStoreError(err, true);
    } finally {
      setSavingPrivate(false);
    }
  };

  const handleDeletePrivateMemo = async (id: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    try {
      await store('delete', { id });
      await onRefreshPrivateStore();
    } catch (err: any) {
      onStoreError(err, true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900">내 즐겨찾기</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            자주 확인하는 학교와 기억해 두고 싶은 급식 식단을 모아 볼 수 있어요.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenSchoolSearch}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>학교 찾아 추가</span>
          </button>
          <button
            type="button"
            onClick={() => {
              onRefreshStore();
              if (currentUser) onRefreshPrivateStore();
            }}
            disabled={storeLoading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${storeLoading ? 'animate-spin' : ''}`} />
            <span>새로 고침</span>
          </button>
        </div>
      </div>

      {/* Store Error Banner */}
      {storeError && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{storeError}</span>
        </div>
      )}

      {/* 1. Private Personal Meal Memo (나만 보기 - private: true / list mine: true) */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
            <h3 className="text-sm font-bold text-slate-900">
              나만 보는 급식 메모 (나만 보기)
            </h3>
            <span className="text-[11px] text-slate-500">
              다른 사용자에게는 안 보여요. 앱을 만든 사람은 저장소 시트에서 볼 수 있어요.
            </span>
          </div>
        </div>

        {currentUser ? (
          <>
            <form onSubmit={handleAddPrivateMemo} className="space-y-1.5">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={privateMemoText}
                  onChange={(e) => setPrivateMemoText(e.target.value)}
                  maxLength={120}
                  placeholder="나만 기억할 급식 메모를 적어 보세요 (예: 금요일 떡볶이 꼭 먹기)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
                <button
                  type="submit"
                  disabled={savingPrivate || !privateMemoText.trim()}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{savingPrivate ? '저장 중' : '나만 보기 저장'}</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                이름 · 학번 · 연락처는 쓰지 마세요
              </p>
            </form>

            {privateMemos.length === 0 ? (
              <div className="py-5 text-center text-xs text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
                저장한 나만의 급식 메모가 없어요.
              </div>
            ) : (
              <ul className="space-y-2">
                {privateMemos.map((memo) => (
                  <li
                    key={memo.id}
                    className="p-3 rounded-xl border border-emerald-100 bg-emerald-50/40 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span className="font-semibold text-emerald-700">
                          {String(memo.data.schoolName || '내 메모')}
                        </span>
                        <span>{memo.time ? String(memo.time).slice(0, 16) : ''}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-800 mt-0.5 break-words">
                        {String(memo.data.text)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeletePrivateMemo(memo.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                      title="지우기"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <p className="text-xs text-slate-600">
              나만 보는 급식 메모는 닉네임 로그인 후 저장하고 불러올 수 있어요.
            </p>
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>로그인</span>
            </button>
          </div>
        )}
      </section>

      {/* 2. Local Favorite Schools */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              이 기기 즐겨찾는 학교 ({favoriteSchools.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">이 기기에 자동 저장됩니다</span>
        </div>

        {favoriteSchools.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <p className="font-semibold text-slate-600">즐겨찾기한 학교가 아직 없어요</p>
            <p className="mt-1">상단 학교 이름 옆 별(★) 버튼을 눌러 학교를 추가해 보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteSchools.map((school) => {
              const isCurrent = school.SD_SCHUL_CODE === currentSchool.SD_SCHUL_CODE;
              return (
                <div
                  key={`fav-school-${school.SD_SCHUL_CODE}`}
                  className={`p-3.5 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                    isCurrent
                      ? 'bg-emerald-50/70 border-emerald-300'
                      : 'bg-slate-50/50 border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      onSelectSchool(school);
                      navigate('/');
                    }}
                    className="min-w-0 flex-1 text-left group"
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700">
                        {school.SCHUL_NM}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border border-slate-200 text-slate-500 shrink-0">
                        {school.SCHUL_KND_SC_NM || '학교'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {school.ATPT_OFCDC_SC_NM}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-semibold mt-1.5">
                      <span>이번 주 급식 보기</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onToggleFavoriteSchool(school)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="즐겨찾기 해제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Local Favorite Meals */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">
              저장한 급식 식단 ({favoriteMeals.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400">이 기기에 자동 저장됩니다</span>
        </div>

        {favoriteMeals.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            <p className="font-semibold text-slate-600">저장한 식단이 아직 없어요</p>
            <p className="mt-1">요일별 식단 카드 아래 "식단 저장" 버튼을 누르면 여기에 모아집니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favoriteMeals.map((meal) => (
              <div
                key={meal.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-white flex flex-col justify-between gap-3"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        {meal.schoolName}
                      </span>
                      <div className="font-bold text-sm text-slate-900 mt-1">
                        {meal.displayDate} ({meal.dayOfWeek}) · {meal.mealName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onRemoveFavoriteMeal(meal.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="저장 삭제"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <ul className="text-xs text-slate-700 space-y-1 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                    {meal.dishes.map((dish, i) => (
                      <li key={`${meal.id}-dish-${i}`} className="truncate">
                        • {dish}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex items-center justify-between text-[11px] text-amber-700 font-semibold pt-1 border-t border-slate-100">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    {meal.calorie || '칼로리 정보 없음'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. Shared Store Favorite Schools */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-slate-900">
                내 저장소 인기 즐겨찾기 학교
              </h3>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              여러 사람이 즐겨찾기 추천으로 저장한 학교 순위를 모아 보여줍니다.
            </p>
          </div>

          <button
            type="button"
            disabled={recommendingSchool}
            onClick={() => onRecommendFavoriteSchool(currentSchool)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
          >
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
            <span>
              {recommendingSchool ? '저장 중...' : `${currentSchool.SCHUL_NM} 즐겨찾기 추천`}
            </span>
          </button>
        </div>

        {storeLoading && sharedSchoolCounts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            저장소에서 즐겨찾기 학교 목록을 불러오는 중...
          </div>
        ) : sharedSchoolCounts.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
            아직 공유 저장소에 등록된 즐겨찾기 학교가 없어요. 위 버튼으로 첫 번째 추천을 남겨 보세요!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {sharedSchoolCounts.map((item, index) => (
              <button
                key={`shared-${item.schoolCode}`}
                type="button"
                onClick={() => {
                  onSelectSchool({
                    ATPT_OFCDC_SC_CODE: item.officeCode,
                    ATPT_OFCDC_SC_NM: '',
                    SD_SCHUL_CODE: item.schoolCode,
                    SCHUL_NM: item.schoolName,
                    SCHUL_KND_SC_NM: item.schoolKind,
                  });
                  navigate('/');
                }}
                className="p-3 rounded-xl border border-slate-200/80 hover:border-emerald-300 hover:bg-emerald-50/40 text-left flex items-center justify-between gap-2 transition-all"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                    {index + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 truncate">
                      {item.schoolName}
                    </div>
                    <div className="text-[11px] text-slate-400">{item.schoolKind}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[11px] font-bold shrink-0">
                  ★ {item.count}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
