import React, { useEffect, useMemo, useRef, useState } from 'react';
import { PAIN_POINTS, FEATURES } from './constants';
import EmailForm from './components/EmailForm';
import { ArrowDown, Play, Sparkles, Star } from 'lucide-react';

const MOTION = {
  heroSequence: true,
  parallax: true,
  revealCards: true,
  mockupInteractive: true,
  ctaMotion: true,
  formMicro: true,
  progress: true,
  storytelling: false,
} as const;

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mediaQuery.matches);
    onChange();
    mediaQuery.addEventListener('change', onChange);
    return () => mediaQuery.removeEventListener('change', onChange);
  }, []);

  return reduced;
};

const useScrollY = (
  enabled: boolean,
  scrollContainer?: React.RefObject<HTMLElement | null>
): number => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setScrollY(0);
      return;
    }

    let rafId = 0;
    const target = scrollContainer?.current;
    const isWindowScroll = !target;

    const readScrollY = () => (isWindowScroll ? window.scrollY : target.scrollTop);

    const update = () => {
      setScrollY(readScrollY());
      rafId = 0;
    };

    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(update);
    };

    setScrollY(readScrollY());

    const listenerTarget: Window | HTMLElement = isWindowScroll ? window : target;
    listenerTarget.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      listenerTarget.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [enabled, scrollContainer]);

  return scrollY;
};

const useScrollProgress = (
  enabled: boolean,
  targetRef: React.RefObject<HTMLElement | null>,
  scrollContainer?: React.RefObject<HTMLElement | null>
): number => {
  const scrollY = useScrollY(enabled, scrollContainer);
  const [viewportHeight, setViewportHeight] = useState(0);

  useEffect(() => {
    if (!enabled) {
      setViewportHeight(0);
      return;
    }

    const updateViewport = () => setViewportHeight(window.innerHeight);
    updateViewport();
    window.addEventListener('resize', updateViewport, { passive: true });
    return () => window.removeEventListener('resize', updateViewport);
  }, [enabled]);

  return useMemo(() => {
    if (!enabled || !targetRef.current || viewportHeight === 0) return 0;

    const targetTop = targetRef.current.getBoundingClientRect().top + window.scrollY;
    const pointForFull = targetTop - viewportHeight + 120;
    if (pointForFull <= 0) return 100;

    return clamp((scrollY / pointForFull) * 100, 0, 100);
  }, [enabled, targetRef, viewportHeight, scrollY]);
};

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  enabled?: boolean;
  scrollContainer?: React.RefObject<HTMLElement | null>;
};

const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  delay = 0,
  enabled = true,
  scrollContainer,
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setVisible(true);
      return;
    }
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      {
        root: scrollContainer?.current ?? null,
        threshold: 0.16,
        rootMargin: '0px 0px -8% 0px',
      }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [enabled, scrollContainer]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0) scale(1)' : 'translateY(18px) scale(0.985)',
        filter: visible ? 'blur(0px)' : 'blur(4px)',
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: '680ms',
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

const App: React.FC = () => {
  const ctaFormRef = useRef<HTMLDivElement | null>(null);
  const reducedMotion = usePrefersReducedMotion();
  const [heroReady, setHeroReady] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const motionEnabled = !reducedMotion;
  const progress = useScrollProgress(MOTION.progress && motionEnabled, ctaFormRef);
  const scrollY = useScrollY(MOTION.parallax && motionEnabled);
  const parallaxY = MOTION.parallax && motionEnabled ? clamp(scrollY * 0.08, 0, 24) : 0;

  useEffect(() => {
    const raf = window.requestAnimationFrame(() => setHeroReady(true));
    return () => window.cancelAnimationFrame(raf);
  }, []);

  const sequenceStyle = (delay: number): React.CSSProperties => {
    if (!MOTION.heroSequence || !motionEnabled) return {};
    return {
      opacity: heroReady ? 1 : 0,
      transform: heroReady ? 'translateY(0px)' : 'translateY(12px)',
      transition: `opacity 650ms ease ${delay}ms, transform 650ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms`,
    };
  };

  const onMockupMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!MOTION.mockupInteractive || !motionEnabled) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width;
    const py = (event.clientY - rect.top) / rect.height;
    const nextY = clamp((px - 0.5) * 4, -2.2, 2.2);
    const nextX = clamp((0.5 - py) * 4, -2.2, 2.2);
    setTilt({ x: nextX, y: nextY });
  };

  return (
    <div className="min-h-screen w-full bg-[#0d0c12] flex justify-center selection:bg-[#5CA6CE]/30 selection:text-white overflow-x-hidden font-sans">
      <main
        className="w-full max-w-[480px] bg-[#16151D] min-h-screen relative shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col overflow-x-hidden"
      >
        <div
          className="absolute top-0 left-0 w-full h-[800px] bg-gradient-to-b from-[#263056]/60 via-[#16151D] to-transparent pointer-events-none"
          style={{ transform: `translateY(${parallaxY}px)` }}
        />
        <div className="absolute top-40 left-[-20%] w-80 h-80 bg-[#5CA6CE] blur-[120px] rounded-full opacity-10 pointer-events-none animate-pulse-glow" />
        <div className="absolute top-[60%] right-[-20%] w-80 h-80 bg-[#5A5B9F] blur-[120px] rounded-full opacity-10 pointer-events-none animate-pulse-glow" />

        {MOTION.progress && (
          <div className="fixed right-4 top-1/2 -translate-y-1/2 h-44 w-1.5 rounded-full bg-white/10 overflow-hidden z-40">
            <div
              className="w-full bg-gradient-to-b from-[#A0D4F0] via-[#5CA6CE] to-[#5A5B9F] animate-progress-sweep"
              style={{ height: `${progress}%` }}
            />
          </div>
        )}

        <section className="relative pt-12 pb-16 px-8 flex flex-col items-center text-center">
          <Reveal enabled={MOTION.revealCards && motionEnabled} className="relative w-full mb-16 z-20" delay={40}>
            <div
              className="relative"
              style={{
                opacity: !MOTION.heroSequence || !motionEnabled ? 1 : heroReady ? 1 : 0,
                transform: `${!MOTION.heroSequence || !motionEnabled || heroReady ? 'translateY(0px)' : 'translateY(12px)'} perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'opacity 650ms ease, transform 650ms cubic-bezier(0.22, 1, 0.36, 1)',
              }}
              onMouseMove={onMockupMove}
              onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            >
              <div className="absolute inset-0 bg-[#5CA6CE] blur-[60px] opacity-10 rounded-full" />
              <div className="relative animate-float p-[1px] rounded-[42px] bg-gradient-to-b from-white/20 via-white/5 to-transparent shadow-[0_40px_80px_rgba(0,0,0,0.7)] overflow-hidden">
                <div className="bg-[#1A1924]/90 backdrop-blur-xl rounded-[41px] p-6 border border-white/5">
                  <div className="flex justify-between items-center mb-6 px-1">
                    <div className="h-4 w-16 bg-white/5 rounded-full" />
                    <div className="flex gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      <div className="w-1.5 h-1.5 rounded-full bg-[#5CA6CE]" />
                    </div>
                  </div>

                  <div className="relative mb-8 overflow-hidden py-1">
                    <div className="animate-scroll-x flex gap-4">
                      {[1, 2, 3, 4, 5, 1, 2, 3, 4, 5].map((i, idx) => (
                        <div
                          key={`avatar-${idx}`}
                          className="flex-shrink-0 w-14 h-14 rounded-full bg-gradient-to-br from-[#5CA6CE] to-[#5A5B9F] p-[1.5px] shadow-lg"
                        >
                          <div className="w-full h-full rounded-full bg-[#16151D] border-2 border-[#16151D] overflow-hidden">
                            <img
                              src={`https://picsum.photos/seed/crea${i}${idx}/100/100`}
                              alt="Avatar"
                              className="w-full h-full object-cover grayscale-[0.2] hover:grayscale-0 transition-all"
                            />
                          </div>
                          {idx % 3 === 0 && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#5CA6CE] rounded-full border-2 border-[#1A1924] flex items-center justify-center">
                              <Star size={8} className="text-white fill-white" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-5">
                    {[1, 2, 3].map((i) => (
                      <div key={`mock-line-${i}`} className="flex gap-4 items-center group cursor-default">
                        <div className="w-20 h-12 bg-gray-800/60 rounded-xl overflow-hidden relative shadow-inner">
                          <img
                            src={`https://picsum.photos/seed/vidhero${i}/200/120`}
                            alt="Video preview"
                            className="opacity-30 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Play size={14} className="text-white fill-white opacity-40 animate-pulse" />
                          </div>
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#5CA6CE]/30 w-1/2 rounded-full" />
                          </div>
                          <div className="h-1.5 w-1/3 bg-white/5 rounded-full" />
                        </div>
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/5 flex items-center justify-center">
                          <div className="w-1 h-3 bg-white/10 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-1 bg-white/10 rounded-full" />
              </div>
              <div className="absolute -bottom-4 right-4 bg-gradient-to-r from-[#5CA6CE] to-[#5A5B9F] text-white px-4 py-2 rounded-2xl text-[9px] font-black shadow-2xl tracking-[0.2em] uppercase border border-white/10">
                Prototype
              </div>
            </div>
          </Reveal>

          <Reveal enabled={MOTION.revealCards && motionEnabled} delay={120}>
            <h1
              className="text-[32px] font-black tracking-tight mb-6 text-glow leading-[1.2] bg-clip-text text-transparent bg-gradient-to-r from-[#5CA6CE] to-[#A0D4F0] animate-heading-unify animate-gradient-heading"
              style={sequenceStyle(130)}
            >
              내가 고른 사람을
              <br />
              가장 편하게 보는 곳
            </h1>
          </Reveal>

          <p className="text-gray-400 font-bold text-base tracking-widest mb-12 uppercase" style={sequenceStyle(240)}>
            올와티 <span className="mx-2 opacity-30">|</span> OlWATY
          </p>

          <div className="w-full flex justify-center" style={sequenceStyle(320)}>
            <EmailForm enhanced={MOTION.formMicro && motionEnabled} />
          </div>

          <div className="mt-16 animate-bounce text-gray-500/50">
            <ArrowDown size={24} strokeWidth={1.5} />
          </div>
        </section>

        <section className="px-6 py-16 relative z-10">
          <div className="flex flex-col items-center mb-12">
            <div className="bg-[#5A5B9F]/20 text-[#5A5B9F] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-4 border border-[#5A5B9F]/20 uppercase">
              Points
            </div>
            <Reveal enabled={MOTION.revealCards && motionEnabled} delay={20}>
              <h2 className="text-3xl font-black text-white leading-tight animate-heading-unify">혹시 이런 상황인가요?</h2>
            </Reveal>
          </div>

          <div className="space-y-6">
            {PAIN_POINTS.map((point, index) => (
              <Reveal
                key={point.id}
                enabled={MOTION.revealCards && motionEnabled}
                delay={80 + index * 70}
              >
                <div className="bg-gradient-to-br from-[#263056]/30 to-transparent border border-white/5 rounded-[32px] p-8 transition-all hover:border-[#5CA6CE]/30 group backdrop-blur-md shadow-2xl">
                  <div className="flex items-start gap-6">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#5CA6CE]/10 text-[#5CA6CE] font-black text-sm border border-[#5CA6CE]/20 flex-shrink-0">
                      0{index + 1}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-xl mb-3 group-hover:text-[#5CA6CE] transition-colors">
                        {point.scenario}
                      </h3>
                      <p className="text-gray-400 text-[15px] leading-relaxed font-normal">{point.content}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="px-10 py-24 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#5CA6CE]/5 to-transparent" />
          <div className="relative z-10">
            <Sparkles className="mx-auto mb-6 text-[#5CA6CE] opacity-60" size={32} />
            <Reveal enabled={MOTION.revealCards && motionEnabled} delay={20}>
              <h2 className="text-2xl font-black text-white mb-6 leading-snug animate-heading-unify">
                알고리즘의 선택이 아닌,
                <br />
                <span className="text-[#5CA6CE]">직접 고른 선택</span>에 집중합니다.
              </h2>
            </Reveal>
            <div className="h-0.5 w-12 bg-gradient-to-r from-transparent via-[#5CA6CE] to-transparent mx-auto" />
          </div>
        </section>

        <section className="px-6 py-20 bg-[#0d0c12]/80 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#5CA6CE]/40 to-transparent" />

          <div className="flex flex-col items-center mb-16">
            <div className="bg-[#5CA6CE]/20 text-[#5CA6CE] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] mb-4 border border-[#5CA6CE]/20 uppercase">
              Solution
            </div>
            <Reveal enabled={MOTION.revealCards && motionEnabled} delay={20}>
              <h2 className="text-3xl font-black text-white animate-heading-unify">올와티에서는</h2>
            </Reveal>
          </div>

          <div className="space-y-12 mb-10">
            {FEATURES.map((feature, index) => (
              <Reveal key={feature.title} enabled={MOTION.revealCards && motionEnabled} delay={60 + index * 70}>
                <div className="flex gap-6 items-start group">
                  <div className="bg-[#1A1924] p-4 rounded-2xl h-fit border border-white/5 group-hover:bg-[#263056]/40 transition-colors shadow-xl flex-shrink-0">
                    {feature.icon}
                  </div>
                  <div className="pt-1">
                    <h4 className="text-xl font-bold text-white mb-2">{feature.title}</h4>
                    <p className="text-[15px] text-gray-400 leading-relaxed font-normal">{feature.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <Reveal enabled={MOTION.revealCards && motionEnabled} delay={200}>
            <div className="mt-20 p-8 rounded-[40px] bg-white/[0.02] border border-white/5 text-center">
              <div className="w-16 h-16 bg-[#5CA6CE]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Star size={32} className="text-[#5CA6CE]" />
              </div>
              <p className="text-gray-400 font-medium leading-relaxed">
                이제 당신의 피드를 직접 컨트롤하세요.
                <br />
                진짜 보고 싶은 영상은 놓치지 않도록.
              </p>
            </div>
          </Reveal>
        </section>

        <section className="px-8 py-28 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-[#263056]/40 via-transparent to-transparent pointer-events-none" />
          <Reveal enabled={MOTION.ctaMotion && motionEnabled} delay={60} className="relative z-10 flex flex-col items-center">
            <p className="text-[#5A5B9F] font-black text-xs tracking-[0.3em] uppercase mb-6">Your pick, your watch</p>
            <Reveal enabled={MOTION.ctaMotion && motionEnabled} delay={90}>
              <h2 className="flex flex-col items-center text-white mb-8 leading-[1.2] animate-heading-unify">
                <span className="text-[20px] md:text-[24px] font-bold tracking-tight mb-4">
                  <span className="text-[#5CA6CE] text-glow">내가 고른 사람</span>을
                  <br />
                  가장 편하게 보는 곳
                </span>
                <span className="text-[36px] md:text-[42px] font-black text-[#5CA6CE] tracking-tight">올와티 OlWATY</span>
              </h2>
            </Reveal>

            <div className="w-12 h-1 bg-gradient-to-r from-transparent via-[#5CA6CE]/40 to-transparent mb-12" />

            <div className="mb-12">
              <p className="text-gray-200 text-lg font-semibold">
                2026년, 곧 만나요.
                <br />
                <span className="text-gray-400 font-normal text-base mt-2 block">런칭 알림을 예약하세요.</span>
              </p>
            </div>

            <div ref={ctaFormRef} className="w-full flex justify-center">
              <EmailForm enhanced={MOTION.formMicro && motionEnabled} />
            </div>
          </Reveal>
        </section>

        <footer className="py-20 px-8 border-t border-white/5 text-center bg-[#0d0c12]">
          <div className="flex justify-center gap-8 mb-10 text-gray-500 font-bold tracking-[0.2em] text-[10px]">
            <span className="hover:text-[#5CA6CE] cursor-pointer transition-colors">INSTAGRAM</span>
            <span className="hover:text-[#5CA6CE] cursor-pointer transition-colors">TWITTER</span>
            <span className="hover:text-[#5CA6CE] cursor-pointer transition-colors">CONTACT</span>
          </div>
          <p className="text-[11px] text-gray-600 font-medium mb-1.5">© 2026 OLWaty Inc. All rights reserved.</p>
          <p className="text-[10px] text-gray-700 tracking-wide font-light italic">
            Premium Curation Service for Modern Viewers.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
