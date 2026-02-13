import React, { useEffect, useState } from 'react';
import { Send, Calendar, CheckCircle2 } from 'lucide-react';

type EmailFormProps = {
  enhanced?: boolean;
};

const EmailForm: React.FC<EmailFormProps> = ({ enhanced = false }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  const WEBHOOK_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || 'YOUR_SCRIPT_ID';
  const motionOn = enhanced && !reducedMotion;

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReducedMotion(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError(null);

    try {
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      setSubmitted(true);
      setEmail('');
    } catch (err) {
      console.error('Submission error:', err);
      setError('죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="w-full flex justify-center">
        <div className="relative w-full max-w-sm bg-[#263056]/40 border border-[#5CA6CE]/40 rounded-3xl p-8 text-center animate-in fade-in zoom-in duration-500 backdrop-blur-md overflow-hidden">
          {motionOn && <span className="absolute inset-0 rounded-3xl animate-success-ripple pointer-events-none" />}
          <div className="w-12 h-12 bg-[#5CA6CE]/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={24} className="text-[#5CA6CE]" />
          </div>
          <h3 className="text-2xl font-black mb-2 text-[#5CA6CE]">신청 완료!</h3>
          <p className="text-base text-gray-300">
            소중한 의견 감사합니다.
            <br />
            런칭 시 가장 먼저 연락드릴게요.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-6 text-sm text-[#5A5B9F] hover:text-[#5CA6CE] transition-colors font-medium"
          >
            다른 이메일로 등록하기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-sm flex flex-col items-center">
        <div className="flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-[#5CA6CE]/30 bg-[#5CA6CE]/5">
          <Calendar size={14} className="text-[#5CA6CE]" />
          <span className="text-[12px] font-bold text-[#5CA6CE] tracking-wider uppercase">2026. Coming Soon</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <div className="relative group rounded-2xl">
            {motionOn && (
              <span className="absolute inset-0 rounded-2xl bg-[#5CA6CE]/10 blur-xl animate-input-glow animate-glow-soft pointer-events-none" />
            )}
            <div className="relative">
              <input
                type="email"
                required
                placeholder="이메일 입력하고 사전 혜택 받기"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#1A1924]/80 border border-white/10 rounded-2xl px-6 py-5 outline-none focus:border-[#5CA6CE] focus:ring-4 focus:ring-[#5CA6CE]/10 transition-all text-white placeholder:text-gray-500 text-lg shadow-2xl backdrop-blur-sm relative"
              />
              {motionOn && <span className="absolute inset-0 rounded-2xl overflow-hidden animate-input-sweep pointer-events-none" />}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs px-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-[#5CA6CE] to-[#5A5B9F] hover:brightness-110 active:scale-[0.98] text-white font-black py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(92,166,206,0.3)] disabled:opacity-50 ${
              motionOn ? 'animate-button-breathe' : ''
            }`}
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span className="text-lg">사전 신청하기</span>
                <Send size={20} />
              </>
            )}
          </button>
          <p className="text-[11px] text-gray-400 text-center opacity-70">
            * 입력하신 이메일은 서비스 런칭 알림용으로만 사용됩니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default EmailForm;
