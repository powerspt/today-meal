import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import {
  DayMeals,
  FavoriteMeal,
  MealService,
  MealTypeFilter,
  SchoolInfo,
  ViewMode,
} from './types';
import { DEFAULT_SCHOOL, PRESET_SCHOOLS } from './data/presetSchools';
import {
  addWeeks,
  formatDateToKorean,
  formatDateToYYYYMMDD,
  getDayOfWeekKorean,
  getWeekDates,
  getWeekRangeString,
  isSameDay,
  getMonday,
} from './utils/dateUtils';
import { fetchSchoolMeals } from './services/neisApi';
import { setToken, store, StoreItem } from './services/store';
import { Header } from './components/Header';
import { WeekNavigator } from './components/WeekNavigator';
import { WeeklyOverviewGrid } from './components/WeeklyOverviewGrid';
import { SchoolSearchModal } from './components/SchoolSearchModal';
import { AllergyModal } from './components/AllergyModal';
import { MealDetailModal } from './components/MealDetailModal';
import { AuthModal } from './components/AuthModal';
import { MealReviewsSection } from './components/MealReviewsSection';
import { FavoritesPage } from './components/FavoritesPage';
import { CommunityPage } from './components/CommunityPage';
import { FaqHelperPage } from './components/FaqHelperPage';
import { Sparkles, School, Star, HelpCircle, AlertCircle, RefreshCw } from 'lucide-react';

const STORAGE_KEY_SCHOOL = 'school_meal_school';
const STORAGE_KEY_RECENTS = 'school_meal_recents';
const STORAGE_KEY_ALLERGIES = 'school_meal_allergies';
const STORAGE_KEY_FAV_SCHOOLS = 'school_meal_favorite_schools';
const STORAGE_KEY_FAV_MEALS = 'school_meal_favorite_meals';

export default function App() {
  // 1. Current School & Favorites (localStorage)
  const [currentSchool, setCurrentSchool] = useState<SchoolInfo>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SCHOOL);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse saved school:', e);
    }
    return DEFAULT_SCHOOL;
  });

  const [recentSchools, setRecentSchools] = useState<SchoolInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_RECENTS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse recents:', e);
    }
    return [DEFAULT_SCHOOL];
  });

  const [favoriteSchools, setFavoriteSchools] = useState<SchoolInfo[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAV_SCHOOLS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse favorite schools:', e);
    }
    return [];
  });

  const [favoriteMeals, setFavoriteMeals] = useState<FavoriteMeal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FAV_MEALS);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse favorite meals:', e);
    }
    return [];
  });

  // 2. Target Date
  const today = useMemo(() => new Date(), []);
  const [targetDate, setTargetDate] = useState<Date>(today);

  // 3. Meal & Loading states
  const [meals, setMeals] = useState<MealService[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFallback, setIsFallback] = useState<boolean>(false);

  // 4. Filters & View settings
  const [selectedMealType, setSelectedMealType] = useState<MealTypeFilter>('2');
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [userAllergies, setUserAllergies] = useState<number[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ALLERGIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn('Failed to parse allergies:', e);
    }
    return [];
  });

  // 5. Store & Auth state
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [privateItems, setPrivateItems] = useState<StoreItem[]>([]);
  const [storeLoading, setStoreLoading] = useState<boolean>(false);
  const [storeError, setStoreError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [likingMealKey, setLikingMealKey] = useState<string | null>(null);
  const [ratingMealKey, setRatingMealKey] = useState<string | null>(null);
  const [recommendingSchool, setRecommendingSchool] = useState<boolean>(false);

  // 6. Modals & Notifications
  const [isSchoolSearchOpen, setIsSchoolSearchOpen] = useState(false);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalError, setAuthModalError] = useState<string | null>(null);
  const [detailModal, setDetailModal] = useState<{
    meal: MealService;
    dayText: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Centralized Store error handler (Rule 8)
  const handleStoreError = useCallback((err: any, requiresLogin = false) => {
    if (!err) {
      setStoreError(null);
      return;
    }
    const msg = typeof err === 'string' ? err : err?.message || '오류가 발생했어요.';
    setStoreError(msg);
    if (err?.code === 'login') {
      setCurrentUser(null);
      setPrivateItems([]);
      setToken(null);
      if (requiresLogin) {
        setAuthModalError(msg);
        setIsAuthModalOpen(true);
      }
    }
  }, []);

  // Load public store items (called ONLY on app mount, after saving, or on manual refresh)
  const loadStoreList = useCallback(async () => {
    setStoreLoading(true);
    setStoreError(null);
    try {
      const res = await store('list');
      setStoreItems(Array.isArray(res?.items) ? res.items : []);
    } catch (err: any) {
      handleStoreError(err, false);
    } finally {
      setStoreLoading(false);
    }
  }, [handleStoreError]);

  // Load private store items (`mine: true`) when logged in
  const loadPrivateStoreList = useCallback(async () => {
    try {
      const res = await store('list', { mine: true });
      setPrivateItems(Array.isArray(res?.items) ? res.items : []);
    } catch (err: any) {
      handleStoreError(err, true);
    }
  }, [handleStoreError]);

  // Startup auth check with store('me') (Rule 5: if it fails, stay logged-out without opening modal)
  useEffect(() => {
    let active = true;
    store('me')
      .then((res) => {
        if (!active) return;
        if (res?.name) {
          setCurrentUser(String(res.name));
          loadPrivateStoreList();
        } else {
          setCurrentUser(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setCurrentUser(null);
        setPrivateItems([]);
      });

    loadStoreList();
    return () => {
      active = false;
    };
  }, [loadStoreList, loadPrivateStoreList]);

  const handleAuthSuccess = useCallback(
    async (name: string) => {
      setCurrentUser(name);
      setAuthModalError(null);
      setStoreError(null);
      await Promise.all([loadStoreList(), loadPrivateStoreList()]);
    },
    [loadStoreList, loadPrivateStoreList]
  );

  const handleLogout = useCallback(async () => {
    try {
      await store('logout');
    } catch {
      // Clear local session state regardless
    }
    setCurrentUser(null);
    setPrivateItems([]);
    setStoreError(null);
  }, []);

  // Calculate week dates (Mon ~ Fri)
  const weekDates = useMemo(() => getWeekDates(targetDate, false), [targetDate]);
  const monday = weekDates[0];
  const friday = weekDates[weekDates.length - 1];

  const weekRangeText = useMemo(
    () => getWeekRangeString(monday, friday),
    [monday, friday]
  );

  const isCurrentWeek = useMemo(() => {
    const targetMonday = getMonday(targetDate);
    const thisMonday = getMonday(today);
    return isSameDay(targetMonday, thisMonday);
  }, [targetDate, today]);

  // Fetch meals when school or week changes
  useEffect(() => {
    let isCancelled = false;

    async function loadMeals() {
      setIsLoading(true);
      const fromYmd = formatDateToYYYYMMDD(monday);
      const toYmd = formatDateToYYYYMMDD(friday);

      try {
        const result = await fetchSchoolMeals(
          currentSchool.ATPT_OFCDC_SC_CODE,
          currentSchool.SD_SCHUL_CODE,
          fromYmd,
          toYmd
        );

        if (!isCancelled) {
          setMeals(result.meals);
          setIsFallback(result.isFallback);
        }
      } catch (err) {
        console.error('Error loading meals:', err);
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadMeals();

    return () => {
      isCancelled = true;
    };
  }, [currentSchool, monday, friday]);

  // Group meals by day
  const dayMealsList: DayMeals[] = useMemo(() => {
    return weekDates.map((d) => {
      const dateStr = formatDateToYYYYMMDD(d);
      const dayOfWeek = getDayOfWeekKorean(d);
      const displayDate = formatDateToKorean(d);
      const isTodayDate = isSameDay(d, today);

      const dayMealsFiltered = meals.filter((m) => m.date === dateStr);
      const breakfast = dayMealsFiltered.find((m) => m.mealCode === '1');
      const lunch = dayMealsFiltered.find((m) => m.mealCode === '2');
      const dinner = dayMealsFiltered.find((m) => m.mealCode === '3');

      return {
        date: d,
        dateStr,
        displayDate,
        dayOfWeek,
        dayOfWeekNum: d.getDay(),
        isToday: isTodayDate,
        breakfast,
        lunch,
        dinner,
      };
    });
  }, [weekDates, meals, today]);

  const hasBreakfast = useMemo(() => meals.some((m) => m.mealCode === '1'), [meals]);
  const hasDinner = useMemo(() => meals.some((m) => m.mealCode === '3'), [meals]);

  // School selection
  const handleSelectSchool = useCallback((school: SchoolInfo) => {
    setCurrentSchool(school);
    try {
      localStorage.setItem(STORAGE_KEY_SCHOOL, JSON.stringify(school));
      setRecentSchools((prev) => {
        const filtered = prev.filter((s) => s.SD_SCHUL_CODE !== school.SD_SCHUL_CODE);
        const updated = [school, ...filtered].slice(0, 6);
        localStorage.setItem(STORAGE_KEY_RECENTS, JSON.stringify(updated));
        return updated;
      });
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Favorite school toggle (localStorage)
  const isCurrentSchoolFavorite = useMemo(
    () => favoriteSchools.some((s) => s.SD_SCHUL_CODE === currentSchool.SD_SCHUL_CODE),
    [favoriteSchools, currentSchool]
  );

  const handleToggleFavoriteSchool = useCallback((school: SchoolInfo) => {
    setFavoriteSchools((prev) => {
      const exists = prev.some((s) => s.SD_SCHUL_CODE === school.SD_SCHUL_CODE);
      const next = exists
        ? prev.filter((s) => s.SD_SCHUL_CODE !== school.SD_SCHUL_CODE)
        : [school, ...prev];
      try {
        localStorage.setItem(STORAGE_KEY_FAV_SCHOOLS, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, []);

  // Recommend favorite school to shared store
  const handleRecommendFavoriteSchool = useCallback(
    async (school: SchoolInfo) => {
      setRecommendingSchool(true);
      setStoreError(null);
      try {
        await store('add', {
          data: {
            type: 'favorite_school',
            schoolCode: school.SD_SCHUL_CODE,
            officeCode: school.ATPT_OFCDC_SC_CODE,
            schoolName: school.SCHUL_NM,
            schoolKind: school.SCHUL_KND_SC_NM || '학교',
          },
        });
        await loadStoreList();
      } catch (err: any) {
        handleStoreError(err, false);
      } finally {
        setRecommendingSchool(false);
      }
    },
    [loadStoreList, handleStoreError]
  );

  // Favorite meal toggle (localStorage)
  const isFavoriteMeal = useCallback(
    (dateStr: string, mealCode: '1' | '2' | '3') => {
      const id = `${currentSchool.SD_SCHUL_CODE}-${dateStr}-${mealCode}`;
      return favoriteMeals.some((m) => m.id === id);
    },
    [favoriteMeals, currentSchool]
  );

  const handleToggleFavoriteMeal = useCallback(
    (dayMeal: DayMeals, meal: MealService) => {
      const id = `${currentSchool.SD_SCHUL_CODE}-${dayMeal.dateStr}-${meal.mealCode}`;
      setFavoriteMeals((prev) => {
        const exists = prev.some((m) => m.id === id);
        const next = exists
          ? prev.filter((m) => m.id !== id)
          : [
              {
                id,
                schoolCode: currentSchool.SD_SCHUL_CODE,
                officeCode: currentSchool.ATPT_OFCDC_SC_CODE,
                schoolName: currentSchool.SCHUL_NM,
                date: dayMeal.dateStr,
                displayDate: dayMeal.displayDate,
                dayOfWeek: dayMeal.dayOfWeek,
                mealCode: meal.mealCode,
                mealName: meal.mealName,
                dishes: meal.dishes.map((d) => d.name),
                calorie: meal.calorie,
                savedAt: new Date().toISOString(),
              },
              ...prev,
            ];
        try {
          localStorage.setItem(STORAGE_KEY_FAV_MEALS, JSON.stringify(next));
        } catch (e) {
          console.warn(e);
        }
        return next;
      });
    },
    [currentSchool]
  );

  const handleRemoveFavoriteMeal = useCallback((id: string) => {
    setFavoriteMeals((prev) => {
      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem(STORAGE_KEY_FAV_MEALS, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, []);

  // Meal like vote
  const getMealLikeCount = useCallback(
    (dateStr: string, mealCode: '1' | '2' | '3') => {
      return storeItems.filter(
        (item) =>
          item.data?.type === 'vote' &&
          item.data?.choice === 'meal_like' &&
          item.data?.schoolCode === currentSchool.SD_SCHUL_CODE &&
          item.data?.dateStr === dateStr &&
          item.data?.mealCode === mealCode
      ).length;
    },
    [storeItems, currentSchool]
  );

  const handleLikeMeal = useCallback(
    async (dayMeal: DayMeals, meal: MealService) => {
      const key = `${dayMeal.dateStr}-${meal.mealCode}`;
      setLikingMealKey(key);
      setStoreError(null);
      try {
        await store('add', {
          data: {
            type: 'vote',
            choice: 'meal_like',
            schoolCode: currentSchool.SD_SCHUL_CODE,
            schoolName: currentSchool.SCHUL_NM,
            dateStr: dayMeal.dateStr,
            mealCode: meal.mealCode,
          },
        });
        await loadStoreList();
      } catch (err: any) {
        handleStoreError(err, false);
      } finally {
        setLikingMealKey(null);
      }
    },
    [currentSchool, loadStoreList, handleStoreError]
  );

  // Meal rating (급식 평가하기 1~5점)
  const getMealRatingStats = useCallback(
    (dateStr: string, mealCode: '1' | '2' | '3') => {
      const matched = storeItems.filter(
        (item) =>
          item.data?.type === 'rating' &&
          item.data?.schoolCode === currentSchool.SD_SCHUL_CODE &&
          item.data?.dateStr === dateStr &&
          item.data?.mealCode === mealCode &&
          typeof item.data?.score === 'number'
      );
      if (matched.length === 0) return { average: 0, count: 0 };
      const sum = matched.reduce((acc, cur) => acc + Number(cur.data.score), 0);
      return { average: sum / matched.length, count: matched.length };
    },
    [storeItems, currentSchool]
  );

  const handleRateMeal = useCallback(
    async (dayMeal: DayMeals, meal: MealService, score: number) => {
      const key = `${dayMeal.dateStr}-${meal.mealCode}`;
      setRatingMealKey(key);
      setStoreError(null);
      try {
        await store('add', {
          data: {
            type: 'rating',
            score,
            schoolCode: currentSchool.SD_SCHUL_CODE,
            schoolName: currentSchool.SCHUL_NM,
            dateStr: dayMeal.dateStr,
            mealCode: meal.mealCode,
            mealName: meal.mealName,
          },
        });
        await loadStoreList();
      } catch (err: any) {
        handleStoreError(err, false);
      } finally {
        setRatingMealKey(null);
      }
    },
    [currentSchool, loadStoreList, handleStoreError]
  );

  // Allergy handlers
  const handleToggleAllergy = useCallback((code: number) => {
    setUserAllergies((prev) => {
      const next = prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code];
      try {
        localStorage.setItem(STORAGE_KEY_ALLERGIES, JSON.stringify(next));
      } catch (e) {
        console.warn(e);
      }
      return next;
    });
  }, []);

  const handleClearAllergies = useCallback(() => {
    setUserAllergies([]);
    try {
      localStorage.removeItem(STORAGE_KEY_ALLERGIES);
    } catch (e) {
      console.warn(e);
    }
  }, []);

  // Week navigation
  const handlePrevWeek = useCallback(() => {
    setTargetDate((prev) => addWeeks(prev, -1));
  }, []);

  const handleNextWeek = useCallback(() => {
    setTargetDate((prev) => addWeeks(prev, 1));
  }, []);

  const handleResetToThisWeek = useCallback(() => {
    setTargetDate(new Date());
  }, []);

  // Share / Copy meals summary
  const handleShareMeals = useCallback(() => {
    const lines: string[] = [
      `🍱 [todaymeal · ${currentSchool.SCHUL_NM}] 이번 주 급식 식단표 (${weekRangeText})`,
      '',
    ];

    dayMealsList.forEach((dm) => {
      const targetMeal =
        selectedMealType === '1'
          ? dm.breakfast
          : selectedMealType === '3'
          ? dm.dinner
          : dm.lunch || dm.breakfast || dm.dinner;

      if (targetMeal && targetMeal.dishes.length > 0) {
        const dishes = targetMeal.dishes.map((d) => d.name).join(', ');
        lines.push(
          `▶ ${dm.displayDate}(${dm.dayOfWeek}) [${targetMeal.mealName}]: ${dishes} (${targetMeal.calorie})`
        );
      } else {
        lines.push(`▶ ${dm.displayDate}(${dm.dayOfWeek}): 급식 없음`);
      }
    });

    lines.push('');
    lines.push('💡 출처: 교육부 NEIS 학교급식 포털');

    const fullText = lines.join('\n');
    navigator.clipboard.writeText(fullText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2400);
    });
  }, [currentSchool, weekRangeText, dayMealsList, selectedMealType]);

  // Quick-bar list: favorite schools first, then presets
  const quickSchools = useMemo(() => {
    const combined = [...favoriteSchools];
    for (const preset of PRESET_SCHOOLS.slice(0, 5)) {
      if (!combined.some((s) => s.SD_SCHUL_CODE === preset.SD_SCHUL_CODE)) {
        combined.push(preset);
      }
    }
    return combined;
  }, [favoriteSchools]);

  return (
    <HashRouter>
      <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        {/* Top Header */}
        <Header
          currentSchool={currentSchool}
          isFavoriteSchool={isCurrentSchoolFavorite}
          onToggleFavoriteSchool={() => handleToggleFavoriteSchool(currentSchool)}
          onOpenSchoolSearch={() => setIsSchoolSearchOpen(true)}
          userAllergiesCount={userAllergies.length}
          onOpenAllergyModal={() => setIsAllergyModalOpen(true)}
          onShareMeals={handleShareMeals}
          copied={copied}
          favoritesCount={favoriteSchools.length + favoriteMeals.length}
          currentUser={currentUser}
          onOpenAuthModal={() => {
            setAuthModalError(null);
            setIsAuthModalOpen(true);
          }}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  {/* Store Error Banner on main view */}
                  {storeError && (
                    <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>{storeError}</span>
                      </div>
                      <button
                        type="button"
                        onClick={loadStoreList}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-700 font-semibold hover:bg-rose-100 shrink-0"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>새로 고침</span>
                      </button>
                    </div>
                  )}

                  {/* School Quick-Bar (Favorites + Presets) */}
                  <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <span className="text-slate-400 shrink-0 font-medium flex items-center gap-1">
                      <School className="w-3.5 h-3.5" />
                      <span>학교 선택:</span>
                    </span>
                    {quickSchools.map((school) => {
                      const isSelected =
                        school.SD_SCHUL_CODE === currentSchool.SD_SCHUL_CODE;
                      const isFav = favoriteSchools.some(
                        (f) => f.SD_SCHUL_CODE === school.SD_SCHUL_CODE
                      );
                      return (
                        <button
                          key={`quick-${school.SD_SCHUL_CODE}`}
                          onClick={() => handleSelectSchool(school)}
                          className={`px-3 py-1 rounded-full shrink-0 transition-all font-medium border flex items-center gap-1 ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                              : isFav
                              ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {isFav && (
                            <Star
                              className={`w-3 h-3 ${
                                isSelected
                                  ? 'fill-amber-300 text-amber-300'
                                  : 'fill-amber-400 text-amber-500'
                              }`}
                            />
                          )}
                          <span>{school.SCHUL_NM}</span>
                        </button>
                      );
                    })}
                    <button
                      onClick={() => setIsSchoolSearchOpen(true)}
                      className="px-2.5 py-1 rounded-full text-emerald-700 font-semibold hover:underline shrink-0 text-xs"
                    >
                      + 학교 검색
                    </button>
                  </div>

                  {/* Week Navigator */}
                  <WeekNavigator
                    weekRangeText={weekRangeText}
                    isCurrentWeek={isCurrentWeek}
                    onPrevWeek={handlePrevWeek}
                    onNextWeek={handleNextWeek}
                    onResetToThisWeek={handleResetToThisWeek}
                    selectedMealType={selectedMealType}
                    onSelectMealType={setSelectedMealType}
                    viewMode={viewMode}
                    onToggleViewMode={setViewMode}
                    hasBreakfast={hasBreakfast}
                    hasDinner={hasDinner}
                  />

                  {/* Weekly Meal Grid / Tabs View */}
                  <WeeklyOverviewGrid
                    dayMeals={dayMealsList}
                    viewMode={viewMode}
                    selectedMealType={selectedMealType}
                    userAllergies={userAllergies}
                    onOpenDetail={(meal, dayText) => setDetailModal({ meal, dayText })}
                    isLoading={isLoading}
                    isFallback={isFallback}
                    isFavoriteMeal={isFavoriteMeal}
                    onToggleFavoriteMeal={handleToggleFavoriteMeal}
                    getMealLikeCount={getMealLikeCount}
                    onLikeMeal={handleLikeMeal}
                    likingMealKey={likingMealKey}
                    getMealRatingStats={getMealRatingStats}
                    onRateMeal={handleRateMeal}
                    ratingMealKey={ratingMealKey}
                  />

                  {/* Bottom One-line Reviews Section (한 줄 후기) */}
                  <MealReviewsSection
                    currentSchool={currentSchool}
                    currentUser={currentUser}
                    storeItems={storeItems}
                    storeLoading={storeLoading}
                    storeError={storeError}
                    onRefreshStore={loadStoreList}
                    onStoreError={handleStoreError}
                    onOpenAuthModal={() => {
                      setAuthModalError(null);
                      setIsAuthModalOpen(true);
                    }}
                  />

                  {/* Nutritional & Helper Guide Banner */}
                  <div className="mt-6 p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800">
                          교육부 학교급식 영양 및 알레르기 안내
                        </p>
                        <p className="text-slate-500 text-[11px]">
                          식단 번호(1~19번)는 식품 알레르기 유발 물질 번호입니다. 궁금한 점은 급식 도우미에서 확인해 보세요.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsAllergyModalOpen(true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium transition-colors"
                      >
                        알레르기 19종 안내
                      </button>
                      <Link
                        to="/faq"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold transition-colors"
                      >
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>급식 도우미</span>
                      </Link>
                    </div>
                  </div>
                </>
              }
            />

            <Route
              path="/favorites"
              element={
                <FavoritesPage
                  currentSchool={currentSchool}
                  currentUser={currentUser}
                  favoriteSchools={favoriteSchools}
                  onSelectSchool={handleSelectSchool}
                  onToggleFavoriteSchool={handleToggleFavoriteSchool}
                  favoriteMeals={favoriteMeals}
                  onRemoveFavoriteMeal={handleRemoveFavoriteMeal}
                  storeItems={storeItems}
                  privateItems={privateItems}
                  storeLoading={storeLoading}
                  storeError={storeError}
                  onRefreshStore={loadStoreList}
                  onRefreshPrivateStore={loadPrivateStoreList}
                  onRecommendFavoriteSchool={handleRecommendFavoriteSchool}
                  recommendingSchool={recommendingSchool}
                  onOpenSchoolSearch={() => setIsSchoolSearchOpen(true)}
                  onOpenAuthModal={() => {
                    setAuthModalError(null);
                    setIsAuthModalOpen(true);
                  }}
                  onStoreError={handleStoreError}
                />
              }
            />

            <Route
              path="/community"
              element={
                <CommunityPage
                  currentSchool={currentSchool}
                  storeItems={storeItems}
                  storeLoading={storeLoading}
                  storeError={storeError}
                  currentUser={currentUser}
                  onRefreshStore={loadStoreList}
                  onStoreError={handleStoreError}
                />
              }
            />

            <Route path="/faq" element={<FaqHelperPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="mt-auto py-6 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500">
          <div className="max-w-6xl mx-auto px-4">
            <p className="font-medium text-slate-700">todaymeal · 이번 주 급식 알리미</p>
            <p className="text-[11px] text-slate-400 mt-1">
              본 서비스는 교육부 나이스(NEIS) 오픈 API를 통해 공공데이터를 실시간 제공합니다.
            </p>
          </div>
        </footer>

        {/* Modals */}
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => {
            setIsAuthModalOpen(false);
            setAuthModalError(null);
          }}
          onAuthSuccess={handleAuthSuccess}
          initialError={authModalError}
        />

        <SchoolSearchModal
          isOpen={isSchoolSearchOpen}
          onClose={() => setIsSchoolSearchOpen(false)}
          currentSchool={currentSchool}
          onSelectSchool={handleSelectSchool}
          recentSchools={recentSchools}
          favoriteSchools={favoriteSchools}
          onToggleFavoriteSchool={handleToggleFavoriteSchool}
        />

        <AllergyModal
          isOpen={isAllergyModalOpen}
          onClose={() => setIsAllergyModalOpen(false)}
          selectedAllergies={userAllergies}
          onToggleAllergy={handleToggleAllergy}
          onClearAllergies={handleClearAllergies}
        />

        <MealDetailModal
          isOpen={Boolean(detailModal)}
          onClose={() => setDetailModal(null)}
          meal={detailModal?.meal || null}
          dayText={detailModal?.dayText || ''}
        />
      </div>
    </HashRouter>
  );
}
