import React, { useState, useMemo } from 'react';
import { SchoolInfo } from '../types';
import { StoreItem, store } from '../services/store';
import {
  MessageSquareQuote,
  Send,
  Trash2,
  RefreshCw,
  LogIn,
  AlertCircle,
} from 'lucide-react';

interface MealReviewsSectionProps {
  currentSchool: SchoolInfo;
  currentUser: string | null;
  storeItems: StoreItem[];
  storeLoading: boolean;
  storeError: string | null;
  onRefreshStore: () => Promise<void>;
  onStoreError: (err: any, requiresLogin?: boolean) => void;
  onOpenAuthModal: () => void;
}

export const MealReviewsSection: React.FC<MealReviewsSectionProps> = ({
  currentSchool,
  currentUser,
  storeItems,
  storeLoading,
  storeError,
  onRefreshStore,
  onStoreError,
  onOpenAuthModal,
}) => {
  const [reviewText, setReviewText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const reviews = useMemo(() => {
    return storeItems
      .filter(
        (item) =>
          item.data?.type === 'review' &&
          typeof item.data?.text === 'string'
      )
      .slice()
      .reverse();
  }, [storeItems]);

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = reviewText.trim();
    if (!trimmed) return;

    if (!currentUser) {
      onOpenAuthModal();
      return;
    }

    setIsSubmitting(true);
    try {
      await store('add', {
        data: {
          type: 'review',
          text: trimmed.slice(0, 100),
          schoolName: currentSchool.SCHUL_NM,
        },
      });
      setReviewText('');
      await onRefreshStore();
    } catch (err: any) {
      onStoreError(err, true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteReview = async (id: string) => {
    if (!currentUser) {
      onOpenAuthModal();
      return;
    }
    setDeletingId(id);
    try {
      await store('delete', { id });
      await onRefreshStore();
    } catch (err: any) {
      onStoreError(err, true);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section
      id="meal-reviews-section"
      className="mt-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageSquareQuote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              한 줄 후기 ({reviews.length})
            </h2>
            <p className="text-[11px] text-slate-500">
              오늘 급식 어땠나요? 로그인 후 100자 이내로 한 줄 후기를 남겨 보세요.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefreshStore}
          disabled={storeLoading}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${storeLoading ? 'animate-spin' : ''}`} />
          <span>새로 고침</span>
        </button>
      </div>

      {/* Error message */}
      {storeError && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{storeError}</span>
        </div>
      )}

      {/* Write Review Form or Login Prompt */}
      {currentUser ? (
        <form onSubmit={handleAddReview} className="space-y-1.5">
          <div className="flex gap-2">
            <input
              id="review-text-input"
              type="text"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              maxLength={100}
              placeholder={`${currentUser}님, 급식 한 줄 후기를 남겨 주세요 (100자 이내)`}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              id="review-submit-btn"
              type="submit"
              disabled={isSubmitting || !reviewText.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? '등록 중' : '남기기'}</span>
            </button>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span>이름 · 학번 · 연락처는 쓰지 마세요</span>
            <span>{reviewText.length}/100</span>
          </div>
        </form>
      ) : (
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <p className="text-xs text-slate-600">
            한 줄 후기를 남기거나 내가 쓴 후기를 지우려면 닉네임으로 로그인해 주세요.
          </p>
          <button
            type="button"
            onClick={onOpenAuthModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shrink-0"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>로그인하고 후기 쓰기</span>
          </button>
        </div>
      )}

      {/* Review List */}
      {storeLoading && reviews.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          한 줄 후기를 불러오는 중...
        </div>
      ) : reviews.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/70 rounded-xl border border-dashed border-slate-200">
          아직 작성된 한 줄 후기가 없어요. 첫 번째 후기를 남겨 보세요!
        </div>
      ) : (
        <ul className="space-y-2">
          {reviews.map((item) => {
            const isMine = Boolean(currentUser && item.user && item.user === currentUser);
            return (
              <li
                key={item.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex items-start justify-between gap-3"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap text-[11px]">
                    <span className="font-bold text-slate-800">
                      {item.user || '익명'}
                    </span>
                    {item.data?.schoolName && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
                        {String(item.data.schoolName)}
                      </span>
                    )}
                    <span className="text-slate-400">
                      {item.time ? String(item.time).slice(0, 16) : ''}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-800 break-words leading-relaxed">
                    {String(item.data.text)}
                  </p>
                </div>

                {isMine && (
                  <button
                    type="button"
                    disabled={deletingId === item.id}
                    onClick={() => handleDeleteReview(item.id)}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/70 transition-colors shrink-0 disabled:opacity-50"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>{deletingId === item.id ? '삭제 중' : '지우기'}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};
