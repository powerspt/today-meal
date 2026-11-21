import React, { useState } from 'react';
import {
  MEAL_FAQ_LIST,
  QUICK_FAQ_QUESTIONS,
  findBestFaqMatch,
  MealFaqItem,
} from '../data/mealFaq';
import {
  HelpCircle,
  Send,
  Sparkles,
  Image as ImageIcon,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export const FaqHelperPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [matchedFaq, setMatchedFaq] = useState<MealFaqItem | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [aiNotice, setAiNotice] = useState<string | null>(null);
  const [openFaqId, setOpenFaqId] = useState<string | null>(MEAL_FAQ_LIST[0].id);

  const runSearch = (rawQuery: string) => {
    const trimmed = rawQuery.trim();
    if (!trimmed) return;
    setSubmittedQuery(trimmed);
    const found = findBestFaqMatch(trimmed);
    setMatchedFaq(found);
    setHasSearched(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    runSearch(question);
  };

  const handleQuickQuestion = (q: string) => {
    setQuestion(q);
    runSearch(q);
  };

  return (
    <div className="space-y-6">
      {/* Header & AI Image Button */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-bold text-slate-900">급식 도우미 Q&amp;A</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            급식 식단, 알레르기, 학교 검색, 즐겨찾기 등 궁금한 점을 물어보세요.
          </p>
        </div>

        <button
          id="ai-meal-image-btn"
          type="button"
          onClick={() => setAiNotice('이 기능은 배포판에서는 쓸 수 없어요')}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 text-xs font-semibold transition-colors self-start sm:self-auto"
        >
          <ImageIcon className="w-4 h-4 text-purple-600" />
          <span>AI 식단 그림 만들기</span>
        </button>
      </div>

      {/* Notice for disabled AI feature in deployed version */}
      {aiNotice && (
        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-semibold flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
            <span>{aiNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setAiNotice(null)}
            className="text-purple-600 hover:text-purple-900 text-xs underline"
          >
            닫기
          </button>
        </div>
      )}

      {/* Search / Ask Card */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-4">
        {/* Frequent Questions Buttons ABOVE input */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-500">자주 묻는 질문</span>
          <div className="flex flex-wrap gap-2">
            {QUICK_FAQ_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => handleQuickQuestion(q)}
                className="px-3 py-1.5 rounded-xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/80 text-xs font-medium transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Question Input */}
        <form onSubmit={handleSubmit} className="space-y-1.5">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="궁금한 내용을 입력해 주세요 (예: 알레르기 번호가 뭐예요?)"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!question.trim()}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>질문하기</span>
            </button>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            이름 · 학번 · 연락처는 쓰지 마세요
          </p>
        </form>

        {/* Answer Display */}
        {hasSearched && (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>질문: {submittedQuery}</span>
            </div>
            {matchedFaq ? (
              <div className="space-y-1.5">
                <p className="text-sm font-bold text-emerald-900">{matchedFaq.question}</p>
                <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                  {matchedFaq.answer}
                </p>
              </div>
            ) : (
              <p className="text-sm font-bold text-slate-700">
                아직 모르는 질문이에요
              </p>
            )}
          </div>
        )}
      </section>

      {/* Full FAQ Accordion List */}
      <section className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900">
          전체 안내 목록 ({MEAL_FAQ_LIST.length}개)
        </h3>
        <div className="divide-y divide-slate-100">
          {MEAL_FAQ_LIST.map((item) => {
            const isOpen = openFaqId === item.id;
            return (
              <div key={item.id} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                  className="w-full flex items-center justify-between gap-2 text-left py-1 text-xs sm:text-sm font-semibold text-slate-800 hover:text-emerald-700"
                >
                  <span>{item.question}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                    {item.answer}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
