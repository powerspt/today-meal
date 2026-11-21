import React, { useState, useEffect } from 'react';
import { store } from '../services/store';
import { X, LogIn, UserPlus, AlertCircle, Lock, User } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (name: string) => void;
  initialError?: string | null;
}

const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,12}$/;
const PIN_REGEX = /^\d{4}$/;

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialError = null,
}) => {
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(initialError);
  const [submittingAction, setSubmittingAction] = useState<'login' | 'signup' | null>(null);

  useEffect(() => {
    if (isOpen) {
      setErrorMsg(initialError || null);
    }
  }, [isOpen, initialError]);

  if (!isOpen) return null;

  const validateInputs = (): string | null => {
    const trimmedName = name.trim();
    if (!NICKNAME_REGEX.test(trimmedName)) {
      return '닉네임은 한글·영어·숫자 2~12자(띄어쓰기 없이)로 입력해 주세요.';
    }
    if (!PIN_REGEX.test(pin)) {
      return 'PIN은 숫자 4자리로 입력해 주세요.';
    }
    return null;
  };

  const handleAuth = async (action: 'login' | 'signup') => {
    const validationError = validateInputs();
    if (validationError) {
      setErrorMsg(validationError);
      return;
    }

    setSubmittingAction(action);
    setErrorMsg(null);
    try {
      // PIN is sent strictly as a string (never converted to Number) so leading zeros are preserved
      const res = await store(action, { name: name.trim(), pin });
      const loggedInName = String(res?.name || name.trim());
      setName('');
      setPin('');
      onAuthSuccess(loggedInName);
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || '요청을 처리하지 못했어요.');
    } finally {
      setSubmittingAction(null);
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    handleAuth('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        id="auth-modal-container"
        className="bg-white rounded-3xl w-full max-w-md flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <LogIn className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">닉네임 로그인</h2>
              <p className="text-[11px] text-slate-500">닉네임과 숫자 4자리 PIN으로 간편하게 시작해요</p>
            </div>
          </div>
          <button
            id="close-auth-modal-btn"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmitForm} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Nickname */}
          <div>
            <label
              htmlFor="auth-nickname-input"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              닉네임 (한글·영어·숫자 2~12자)
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-nickname-input"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.replace(/\s+/g, ''))}
                maxLength={12}
                placeholder="예: 급식왕12"
                autoComplete="off"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                autoFocus
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">실명 · 학번은 쓰지 마세요</p>
          </div>

          {/* 4-digit PIN */}
          <div>
            <label
              htmlFor="auth-pin-input"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              PIN (숫자 4자리)
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="auth-pin-input"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={4}
                value={pin}
                onChange={(e) => {
                  const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
                  setPin(digitsOnly);
                }}
                placeholder="●●●●"
                autoComplete="off"
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm tracking-[0.4em] focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
              휴대폰 잠금 번호 · 카드 비밀번호 · 생일은 쓰지 마세요. 이 앱에서만 쓰는 연습용이에요.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 pt-1">
            <button
              id="auth-login-submit-btn"
              type="submit"
              disabled={Boolean(submittingAction)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 shadow-xs"
            >
              <LogIn className="w-4 h-4" />
              <span>{submittingAction === 'login' ? '로그인 중...' : '로그인'}</span>
            </button>

            <button
              id="auth-signup-submit-btn"
              type="button"
              disabled={Boolean(submittingAction)}
              onClick={() => handleAuth('signup')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <span>{submittingAction === 'signup' ? '가입 중...' : '처음이에요(가입)'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
