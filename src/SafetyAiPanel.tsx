import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  X,
  Search,
  PanelLeft,
  Plus,
  MoreVertical,
  Send,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Lightbulb,
} from 'lucide-react';
import { POINT_ORANGE, accentRgba } from './pointColorSchemes';

const MAX_INPUT = 300;

export type SafetyAiColors = {
  bg: string;
  border: string;
  text: string;
  muted: string;
  inputBg: string;
  sidebarBg: string;
  cardBg: string;
  aiBubble: string;
  bannerBg: string;
  userBubble: string;
};

type Props = {
  locale: 'ko' | 'en';
  isDark: boolean;
  colors: SafetyAiColors;
  onClosePanel: () => void;
};

type ChatMsg = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  /** 타임스탬프는 첫 질문 위에만 표시 */
  timeCenter?: string;
};

type ConvItem = {
  id: string;
  titleKo: string;
  titleEn: string;
  timeKo: string;
  timeEn: string;
};

const KEYWORDS: { ko: string; en: string }[] = [
  { ko: '필수 안전 표지판 종류와 규격과 확인하기', en: 'Check types and specs of required safety signs' },
  { ko: '작업자 필수 보호구 리스트 확인하기', en: 'Check required PPE list for workers' },
  { ko: "설계 중인 공정에서 발생 가능한 '사고 시나리오' 미리 확인하기", en: "Preview accident scenarios in the process under design" },
  { ko: '사고 없는 로봇 가동 순서! 안전한 재기동 절차 확인하셨나요?', en: 'Safe robot operation order — have you verified restart procedures?' },
  { ko: '바닥 라인만으로도 위험구역을 시각화하는 방법 확인하기', en: 'How to visualize hazard zones with floor lines only' },
  { ko: '로봇 시스템 유지보수 매뉴얼과 작성 방법 확인하기', en: 'Robot system maintenance manuals and how to write them' },
  { ko: '화재 예방을 위한 소화기 설치 적합성 확인하기', en: 'Check fire extinguisher placement for fire prevention' },
  { ko: '바닥 케이블 보호 및 넘어짐 위험 대책 확인하기', en: 'Cable protection on floor and trip hazard countermeasures' },
];

const MOCK_REPLY_KO = `산업 현장에서 로봇을 재기동할 때는 안전검사 고시 및 산업안전보건기준에 따라 다음을 반드시 확인해야 합니다.

**1. 재기동 전 필수 확인 사항 (안전검사 고시 별표 12)**
• 위험방지 조치 이행 여부
• 비상정지·보호장치 정상 동작
• 작업자 접근 통제

**2. 법적 재기동 절차 및 원칙**
• 점검 → 기록 → 단계적 기동 순서 준수
• 협동로봇은 PFL·SSM 등 모드별 안전 거리 재확인`;

const MOCK_REPLY_EN = `Before restarting robots in industrial settings, verify safety inspection notices and occupational health standards.

**1. Pre-restart checks**
• Hazard mitigation in place
• E-stop and safeguards functional
• Access control

**2. Legal restart principles**
• Inspect → document → staged startup
• For cobots, re-verify PFL/SSM safety distances`;

export function SafetyAiPanel({ locale, isDark, colors, onClosePanel }: Props) {
  const [sidebarNarrow, setSidebarNarrow] = useState(false);
  const [conversations, setConversations] = useState<ConvItem[]>([
    {
      id: '1',
      titleKo: 'Safety AI와 대화시작',
      titleEn: 'Start with Safety AI',
      timeKo: '방금 전',
      timeEn: 'Just now',
    },
  ]);
  const [activeConvId, setActiveConvId] = useState('1');
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [kwExpanded, setKwExpanded] = useState(false);
  const [kwSectionHidden, setKwSectionHidden] = useState(false);
  const [kwBelowChat, setKwBelowChat] = useState(false);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const L = useMemo(
    () =>
      locale === 'en'
        ? {
            title: 'Safety AI',
            beta: 'Beta',
            chatList: 'Chat list',
            newChat: 'New chat',
            collapseSidebar: 'Collapse list',
            expandSidebar: 'Expand list',
            search: 'Search',
            more: 'More',
            welcomeTitle: 'Ask about robot system safety',
            welcomeSub: 'Pick a suggested keyword or type your question',
            banner3d: 'Click equipment in the 3D view to see contextual keywords!',
            kwTitle: 'Suggested keywords',
            collapseAll: 'Hide completely',
            expandKw: 'Show suggested keywords',
            showMore: (n: number) => `More ∨ (+${n})`,
            collapseGrid: 'Collapse ∧',
            placeholder: 'Ask about robot system safety…',
            send: 'Send',
            disclaimer:
              'This AI is for reference only and may be imperfect. Cross-check standards or consult experts before field use.',
            viewKw: 'View suggested keywords',
            kwTag: 'General',
            copy: 'Copy',
            good: 'Helpful',
            bad: 'Not helpful',
          }
        : {
            title: 'Safety AI',
            beta: 'Beta',
            chatList: '대화 목록',
            newChat: '새 대화',
            collapseSidebar: '목록 접기',
            expandSidebar: '목록 펼치기',
            search: '검색',
            more: '더보기',
            welcomeTitle: '로봇 시스템 안전에 대해 물어보세요',
            welcomeSub: '추천 키워드를 선택하거나 질문을 입력해주세요',
            banner3d: '3D화면에 설치한 설비를 클릭하여 추천 키워드를 확인해보세요!',
            kwTitle: '추천 키워드',
            collapseAll: '완전히 접기',
            expandKw: '추천 키워드 펼치기',
            showMore: (n: number) => `더보기 ∨ (+${n}개)`,
            collapseGrid: '접기 ∧',
            placeholder: '로봇 시스템 안전에 대해 물어보세요…',
            send: '전송',
            disclaimer:
              '본 AI는 참고용이며 완벽한 답변을 제공하지 않습니다. 현장 적용은 표준/법령에 대한 교차 검증 혹은 전문가의 최종 검토를 거치는 것을 권장드립니다.',
            viewKw: '추천 키워드 보기',
            kwTag: '일반',
            copy: '복사',
            good: '도움됨',
            bad: '도움 안 됨',
          },
    [locale],
  );

  const kwSlice = kwExpanded ? KEYWORDS : KEYWORDS.slice(0, 4);
  const moreCount = KEYWORDS.length - 4;

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, kwBelowChat, kwExpanded]);

  const startNewConversation = useCallback(() => {
    const id = `c-${Date.now()}`;
    setConversations((prev) => [
      {
        id,
        titleKo: '새 대화',
        titleEn: 'New chat',
        timeKo: '방금 전',
        timeEn: 'Just now',
      },
      ...prev,
    ]);
    setActiveConvId(id);
    setMessages([]);
    setKwExpanded(false);
    setKwSectionHidden(false);
    setKwBelowChat(false);
    setInput('');
  }, []);

  const pushExchange = useCallback(
    (text: string) => {
      const reply = locale === 'en' ? MOCK_REPLY_EN : MOCK_REPLY_KO;
      const uid = `u-${Date.now()}`;
      const aid = `a-${Date.now()}`;
      setMessages((prev) => {
        const showTime = prev.length === 0;
        const timeCenter = showTime ? (locale === 'en' ? '09:23 AM' : '오전 09:23') : undefined;
        return [
          ...prev,
          { id: uid, role: 'user', content: text, timeCenter },
          { id: aid, role: 'assistant', content: reply },
        ];
      });
      setKwBelowChat(false);
      setKwExpanded(false);
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                titleKo: text.length > 22 ? `${text.slice(0, 22)}…` : text,
                titleEn: text.length > 28 ? `${text.slice(0, 28)}…` : text,
                timeKo: '1분 전',
                timeEn: '1 min ago',
              }
            : c,
        ),
      );
    },
    [activeConvId, locale],
  );

  const pickKeyword = useCallback(
    (text: string) => {
      pushExchange(text);
    },
    [pushExchange],
  );

  const sendManual = useCallback(() => {
    const t = input.trim();
    if (!t) return;
    if (t.length > MAX_INPUT) return;
    pushExchange(t);
    setInput('');
  }, [input, pushExchange]);

  const lastAssistantId = [...messages].reverse().find((m) => m.role === 'assistant')?.id;

  const renderKeywordGrid = () => {
    if (kwSectionHidden) {
      return (
        <button
          type="button"
          className="w-full py-2 text-[11px] font-semibold rounded-[8px] border transition-colors"
          style={{
            borderColor: accentRgba(POINT_ORANGE, 0.35),
            color: POINT_ORANGE,
            background: colors.cardBg,
          }}
          onClick={() => setKwSectionHidden(false)}
        >
          {L.expandKw} ^
        </button>
      );
    }

    return (
      <div className="rounded-[10px] border overflow-hidden" style={{ borderColor: colors.border, background: colors.cardBg }}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b" style={{ borderColor: colors.border }}>
          <div className="flex items-center gap-1.5 min-w-0">
            <Lightbulb className="w-3.5 h-3.5 shrink-0" style={{ color: POINT_ORANGE }} />
            <span className="text-[11px] font-bold truncate" style={{ color: colors.text }}>
              {L.kwTitle}
            </span>
          </div>
          <button
            type="button"
            className="text-[10px] font-semibold shrink-0 flex items-center gap-0.5"
            style={{ color: colors.muted }}
            onClick={() => setKwSectionHidden(true)}
          >
            {L.collapseAll}
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
        <div className="p-2 grid grid-cols-2 gap-1.5 max-h-[min(40vh,220px)] overflow-y-auto sfd-scroll">
          {kwSlice.map((k, i) => (
            <button
              key={`${k.ko}-${i}`}
              type="button"
              className="text-left rounded-[8px] border px-2.5 py-2 transition-colors duration-150 hover:opacity-95"
              style={{
                borderColor: colors.border,
                background: isDark ? 'rgba(255,255,255,0.03)' : '#fff',
              }}
              onClick={() => pickKeyword(locale === 'en' ? k.en : k.ko)}
            >
              <span
                className="inline-block text-[9px] font-semibold px-1 py-0.5 rounded mb-1"
                style={{ background: isDark ? 'rgba(255,255,255,0.1)' : '#f4f4f5', color: colors.muted }}
              >
                {L.kwTag}
              </span>
              <p className="text-[10px] font-medium leading-snug" style={{ color: colors.text }}>
                {locale === 'en' ? k.en : k.ko}
              </p>
            </button>
          ))}
        </div>
        {!kwExpanded ? (
          <div className="px-2 pb-2">
            <button
              type="button"
              className="w-full py-1.5 text-[10px] font-semibold rounded-[8px] transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f4f4f5', color: colors.muted }}
              onClick={() => setKwExpanded(true)}
            >
              {L.showMore(moreCount)}
            </button>
          </div>
        ) : (
          <div className="px-2 pb-2">
            <button
              type="button"
              className="w-full py-1.5 text-[10px] font-semibold rounded-[8px] transition-colors"
              style={{ background: isDark ? 'rgba(255,255,255,0.06)' : '#f4f4f5', color: colors.muted }}
              onClick={() => setKwExpanded(false)}
            >
              {L.collapseGrid}
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col min-h-0 rounded-[10px] border overflow-hidden" style={{ borderColor: colors.border, background: colors.bg }}>
      {/* 상단 헤더 */}
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b shrink-0" style={{ borderColor: colors.border, background: colors.sidebarBg }}>
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-[13px] font-bold truncate" style={{ color: colors.text }}>
            {L.title}
          </span>
          <span
            className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white"
            style={{ background: '#2563eb' }}
          >
            {L.beta}
          </span>
        </div>
        <button
          type="button"
          className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 transition-colors"
          style={{ color: colors.text }}
          onClick={onClosePanel}
          aria-label={locale === 'en' ? 'Close panel' : '패널 닫기'}
        >
          <X className="w-4 h-4" strokeWidth={2.2} />
        </button>
      </div>

      <div className="flex flex-1 min-h-0 min-w-0">
        {/* 좌: 대화 목록 */}
        <aside
          className="flex flex-col border-r shrink-0 transition-[width] duration-200 overflow-hidden"
          style={{
            width: sidebarNarrow ? 0 : 108,
            borderColor: colors.border,
            background: colors.sidebarBg,
          }}
        >
          <div className="w-[108px] flex flex-col h-full min-h-0">
            <div className="flex items-center justify-between px-2 py-1.5 border-b gap-1" style={{ borderColor: colors.border }}>
              <span className="text-[10px] font-bold truncate" style={{ color: colors.text }}>
                {L.chatList}
              </span>
              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" className="p-1 rounded" style={{ color: colors.muted }} aria-label={L.search}>
                  <Search className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  className="p-1 rounded"
                  style={{ color: colors.muted }}
                  aria-label={L.collapseSidebar}
                  onClick={() => setSidebarNarrow(true)}
                >
                  <PanelLeft className="w-3 h-3" />
                </button>
              </div>
            </div>
            <div className="p-1.5 shrink-0">
              <button
                type="button"
                className="w-full h-8 rounded-[8px] text-[10px] font-bold text-white flex items-center justify-center gap-1"
                style={{ background: POINT_ORANGE }}
                onClick={startNewConversation}
              >
                <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                {`+ ${L.newChat}`}
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-1.5 pb-2 flex flex-col gap-1">
              {conversations.map((c) => {
                const active = c.id === activeConvId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setActiveConvId(c.id);
                      setMessages([]);
                      setKwBelowChat(false);
                      setKwExpanded(false);
                    }}
                    className="text-left rounded-[8px] border px-2 py-1.5 relative pr-6 transition-colors"
                    style={{
                      borderColor: active ? POINT_ORANGE : colors.border,
                      background: active ? (isDark ? 'rgba(255,142,43,0.08)' : '#fff') : 'transparent',
                      boxShadow: active ? `0 0 0 1px ${accentRgba(POINT_ORANGE, 0.25)}` : 'none',
                    }}
                  >
                    <p className="text-[10px] font-semibold leading-tight line-clamp-2" style={{ color: colors.text }}>
                      {locale === 'en' ? c.titleEn : c.titleKo}
                    </p>
                    <p className="text-[9px] mt-0.5" style={{ color: colors.muted }}>
                      {locale === 'en' ? c.timeEn : c.timeKo}
                    </p>
                    <span className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5" style={{ color: colors.muted }}>
                      <MoreVertical className="w-3 h-3" />
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {sidebarNarrow && (
          <button
            type="button"
            className="w-7 shrink-0 border-r flex items-center justify-center"
            style={{ borderColor: colors.border, background: colors.sidebarBg, color: colors.muted }}
            onClick={() => setSidebarNarrow(false)}
            title={L.expandSidebar}
            aria-label={L.expandSidebar}
          >
            <PanelLeft className="w-3.5 h-3.5 rotate-180" />
          </button>
        )}

        {/* 우: 채팅 */}
        <div className="flex-1 flex flex-col min-w-0 min-h-0">
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto sfd-scroll px-2.5 py-2 flex flex-col gap-2">
            {messages.length === 0 ? (
              <>
                <div className="flex flex-col items-center text-center px-1 pt-2 pb-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center mb-2"
                    style={{ background: accentRgba(POINT_ORANGE, 0.25) }}
                  >
                    <MessageCircle className="w-6 h-6" strokeWidth={2} style={{ color: '#ffffff' }} />
                  </div>
                  <p className="text-[12px] font-bold leading-tight" style={{ color: colors.text }}>
                    {L.welcomeTitle}
                  </p>
                  <p className="text-[10px] mt-1 leading-snug" style={{ color: colors.muted }}>
                    {L.welcomeSub}
                  </p>
                  <div
                    className="mt-2 px-2.5 py-1.5 rounded-full text-[9px] font-medium leading-snug max-w-full"
                    style={{ background: colors.bannerBg, color: isDark ? '#fcd9a8' : '#92400e' }}
                  >
                    {L.banner3d}
                  </div>
                </div>
                {renderKeywordGrid()}
              </>
            ) : (
              <>
                {messages.map((m) =>
                  m.role === 'user' ? (
                    <div key={m.id}>
                      {m.timeCenter && (
                        <p className="text-center text-[9px] py-1" style={{ color: colors.muted }}>
                          {m.timeCenter}
                        </p>
                      )}
                      <div className="flex items-end justify-end gap-1.5">
                        <div
                          className="max-w-[92%] rounded-[12px] rounded-br-sm px-2.5 py-2 text-[10px] font-medium leading-relaxed text-white"
                          style={{ background: POINT_ORANGE }}
                        >
                          {m.content}
                        </div>
                        <div
                          className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[9px] font-bold"
                          style={{ background: isDark ? 'rgba(255,255,255,0.15)' : '#e5e7eb', color: colors.muted }}
                        >
                          U
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={m.id} className="flex items-start gap-1.5">
                      <div
                        className="w-6 h-6 rounded-full shrink-0 flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ background: POINT_ORANGE }}
                      >
                        S
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className="rounded-[10px] rounded-tl-sm px-2.5 py-2 text-[10px] leading-relaxed whitespace-pre-wrap"
                          style={{ background: colors.aiBubble, color: colors.text }}
                        >
                          {m.content}
                        </div>
                        <div className="flex items-center gap-1 mt-1">
                          <button type="button" className="p-1 rounded" style={{ color: colors.muted }} aria-label={L.good}>
                            <ThumbsUp className="w-3 h-3" />
                          </button>
                          <button type="button" className="p-1 rounded" style={{ color: colors.muted }} aria-label={L.bad}>
                            <ThumbsDown className="w-3 h-3" />
                          </button>
                          <button type="button" className="p-1 rounded" style={{ color: colors.muted }} aria-label={L.copy}>
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {m.id === lastAssistantId && !kwBelowChat && (
                          <div className="flex justify-center mt-2">
                            <button
                              type="button"
                              className="px-3 py-1.5 rounded-[8px] text-[10px] font-bold border transition-colors"
                              style={{
                                borderColor: POINT_ORANGE,
                                color: POINT_ORANGE,
                                background: 'transparent',
                              }}
                              onClick={() => setKwBelowChat(true)}
                            >
                              {L.viewKw} ^
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ),
                )}
                {kwBelowChat && <div className="pt-1">{renderKeywordGrid()}</div>}
              </>
            )}
          </div>

          <div className="shrink-0 border-t px-2.5 pt-2 pb-2" style={{ borderColor: colors.border, background: colors.sidebarBg }}>
            <div className="flex justify-end mb-0.5">
              <span className="text-[9px] tabular-nums" style={{ color: colors.muted }}>
                {input.length}/{MAX_INPUT}
              </span>
            </div>
            <div className="relative">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, MAX_INPUT))}
                rows={2}
                placeholder={L.placeholder}
                className="w-full resize-none rounded-[10px] border pl-2.5 pr-10 py-2 text-[10px] leading-snug outline-none focus-visible:ring-2 focus-visible:ring-[rgba(255,142,43,0.4)]"
                style={{
                  borderColor: colors.border,
                  background: colors.inputBg,
                  color: colors.text,
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendManual();
                  }
                }}
              />
              <button
                type="button"
                className="absolute right-1.5 bottom-1.5 w-7 h-7 rounded-[8px] flex items-center justify-center text-white disabled:opacity-40"
                style={{ background: isDark ? 'rgba(255,255,255,0.2)' : '#9ca3af' }}
                disabled={!input.trim()}
                onClick={sendManual}
                aria-label={L.send}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[8px] leading-snug mt-1.5 px-0.5" style={{ color: colors.muted }}>
              {L.disclaimer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
