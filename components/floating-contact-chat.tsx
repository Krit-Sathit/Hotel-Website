'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Phone,
  Mail,
  MessageCircle,
  X,
  Send,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface FloatingContactChatProps {
  hotelId: string;
  flowstayId?: number;
  slug: string;
  hotelName: string;
  phone?: string | null;
  email?: string | null;
  lineId?: string | null;
  whatsapp?: string | null;
}

function normalizeWhatsAppHref(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : '';
}

function normalizeLineInfo(raw: string): { label: string; href: string } | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    const seg = trimmed.split('/').filter(Boolean).pop() || 'LINE';
    const cleanId = decodeURIComponent(seg).replace(/^~/, '');
    return {
      label: `Line: ${cleanId}`,
      href: trimmed,
    };
  }
  const cleanId = trimmed.replace(/^line:\s*/i, '').trim();
  if (!cleanId) return null;
  const href = cleanId.startsWith('@')
    ? `https://line.me/R/ti/p/${encodeURIComponent(cleanId)}`
    : `https://line.me/ti/p/~${encodeURIComponent(cleanId)}`;
  return {
    label: `Line: ${cleanId}`,
    href,
  };
}

export default function FloatingContactChat({
  hotelId,
  flowstayId,
  slug,
  hotelName,
  phone: initialPhone,
  email: initialEmail,
  lineId: initialLineId,
  whatsapp: initialWhatsapp,
}: FloatingContactChatProps) {
  const [open, setOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const [resolvedFlowstayId, setResolvedFlowstayId] = useState<number | undefined>(() => {
    if (typeof flowstayId === 'number' && flowstayId > 0) return flowstayId;
    const numeric = Number(hotelId);
    return Number.isFinite(numeric) && numeric > 0 && /^\d+$/.test(String(hotelId))
      ? numeric
      : undefined;
  });
  const [phone, setPhone] = useState((initialPhone || '').trim());
  const [email, setEmail] = useState((initialEmail || '').trim());
  const [lineId, setLineId] = useState((initialLineId || '').trim());
  const [whatsapp, setWhatsapp] = useState((initialWhatsapp || '').trim());

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [sessionId] = useState(
    () => `hotel-${slug || hotelId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const qs = new URLSearchParams(window.location.search);
      if (qs.has('preview_template')) {
        setIsPreviewMode(true);
        return;
      }
    }

    // Hydrate live Line ID / WhatsApp / FlowStay numeric ID if any channel is missing
    if (!slug) return;
    let cancelled = false;
    fetch(`/api/hotel-chat?slug=${encodeURIComponent(slug)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || cancelled) return;
        if (data.flowstayId && !resolvedFlowstayId) {
          setResolvedFlowstayId(Number(data.flowstayId));
        }
        if (data.lineId && !lineId) {
          setLineId(String(data.lineId).trim());
        }
        if (data.whatsapp && !whatsapp) {
          setWhatsapp(String(data.whatsapp).trim());
        }
        if (data.phone && !phone) {
          setPhone(String(data.phone).trim());
        }
        if (data.email && !email) {
          setEmail(String(data.email).trim());
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [slug]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (chatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, chatLoading, chatOpen]);

  if (isPreviewMode) {
    return null;
  }

  const handleSendMessage = async (rawContent?: string) => {
    const content = (rawContent ?? chatInput).trim();
    if (!content || chatLoading) return;

    if (rawContent === undefined) {
      setChatInput('');
    }
    const priorHistory = chatMessages.slice(-10);
    setChatMessages((prev) => [...prev, { role: 'user', content }]);
    setChatLoading(true);

    try {
      const res = await fetch('/api/hotel-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          flowstayId: resolvedFlowstayId,
          slug,
          sessionId,
          message: content,
          history: priorHistory,
        }),
      });
      const data = await res.json();
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data?.response || 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } catch {
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
        },
      ]);
    } finally {
      setChatLoading(false);
      textareaRef.current?.focus();
    }
  };

  const handleClearChat = () => {
    setChatMessages([]);
    fetch('/api/hotel-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'clear',
        flowstayId: resolvedFlowstayId,
        slug,
        sessionId,
      }),
    }).catch(() => {});
  };

  const lineInfo = lineId ? normalizeLineInfo(lineId) : null;
  const whatsappHref = whatsapp ? normalizeWhatsAppHref(whatsapp) : '';

  const contactItems: Array<{
    icon: React.ReactNode;
    label: string;
    href?: string;
    onClick?: () => void;
    bg: string;
  }> = [
    {
      icon: <Bot className="h-4 w-4" />,
      label: 'AI Chat',
      onClick: () => {
        setOpen(false);
        setChatOpen(true);
      },
      bg: 'bg-blue-600',
    },
    ...(phone
      ? [
          {
            icon: <Phone className="h-4 w-4" />,
            label: phone,
            href: `tel:${phone.replace(/\s+/g, '')}`,
            bg: 'bg-gray-900',
          },
        ]
      : []),
    ...(lineInfo
      ? [
          {
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.281.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
              </svg>
            ),
            label: lineInfo.label,
            href: lineInfo.href,
            bg: 'bg-green-500',
          },
        ]
      : []),
    ...(whatsappHref
      ? [
          {
            icon: (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            ),
            label: 'WhatsApp',
            href: whatsappHref,
            bg: 'bg-green-600',
          },
        ]
      : []),
    ...(email
      ? [
          {
            icon: <Mail className="h-4 w-4" />,
            label: 'Email',
            href: `mailto:${email}`,
            bg: 'bg-gray-700',
          },
        ]
      : []),
  ];

  const suggestedPrompts = [
    'What room types do you have?',
    "What's the starting price?",
    'Any promotions available?',
    'Check-in/check-out times?',
  ];

  return (
    <>
      {/* Floating Contact Button (FAB) */}
      <div className="fixed bottom-20 lg:bottom-6 right-5 md:right-6 z-40 flex flex-col items-end gap-3 font-sans">
        {open && (
          <div className="flex flex-col items-end gap-2 mb-1 animate-fade-in">
            {contactItems.map((item, idx) =>
              item.href ? (
                <a
                  key={idx}
                  href={item.href}
                  target={
                    item.href.startsWith('tel:') || item.href.startsWith('mailto:')
                      ? undefined
                      : '_blank'
                  }
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 group"
                >
                  <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-gray-200 whitespace-nowrap transition-transform group-hover:-translate-x-0.5">
                    {item.label}
                  </span>
                  <span
                    className={`${item.bg} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
                  >
                    {item.icon}
                  </span>
                </a>
              ) : (
                <button
                  key={idx}
                  type="button"
                  onClick={item.onClick}
                  className="flex items-center gap-2 group cursor-pointer"
                >
                  <span className="bg-white text-gray-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md border border-gray-200 whitespace-nowrap transition-transform group-hover:-translate-x-0.5">
                    {item.label}
                  </span>
                  <span
                    className={`${item.bg} text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}
                  >
                    {item.icon}
                  </span>
                </button>
              )
            )}
          </div>
        )}

        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className="w-12 h-12 rounded-full bg-gray-900 text-white flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Contact Hotel"
        >
          {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        </button>
      </div>

      {/* AI Concierge Slide-over Sheet */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex justify-end font-sans">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
            onClick={() => setChatOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-white text-gray-900 h-full shadow-2xl flex flex-col border-l border-gray-200">
            {/* Sheet Header */}
            <div className="px-4 py-3.5 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 min-w-0">
                <Bot className="h-5 w-5 text-blue-600 shrink-0" />
                <h3 className="text-base font-semibold text-gray-900 truncate">{hotelName}</h3>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {chatMessages.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearChat}
                    className="text-xs text-gray-500 hover:text-gray-800 px-2.5 py-1 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Clear
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setChatOpen(false)}
                  className="p-1.5 rounded-md text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors cursor-pointer"
                  aria-label="Close AI Chat"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 text-center px-2">
                  <div className="flex flex-col items-center gap-3 text-gray-500">
                    <Sparkles className="h-11 w-11 text-blue-600/25" />
                    <p className="text-sm leading-relaxed max-w-xs">
                      Welcome! I&apos;m the AI concierge for {hotelName}. How can I help you?
                    </p>
                  </div>

                  <div className="flex flex-wrap justify-center gap-2 max-w-sm">
                    {suggestedPrompts.map((prompt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        disabled={chatLoading}
                        onClick={() => handleSendMessage(prompt)}
                        className="rounded-lg border border-gray-200 bg-white px-3.5 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 items-start ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'assistant' && (
                        <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-blue-50 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-blue-600" />
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
                          msg.role === 'user'
                            ? 'bg-gray-900 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        {msg.content}
                      </div>
                      {msg.role === 'user' && (
                        <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-700" />
                        </div>
                      )}
                    </div>
                  ))}

                  {chatLoading && (
                    <div className="flex items-start gap-2.5">
                      <div className="w-8 h-8 shrink-0 mt-0.5 rounded-full bg-blue-50 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="rounded-xl bg-gray-100 px-3.5 py-2.5">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="p-3 border-t border-gray-200 bg-gray-50/70 flex items-end gap-2"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask about this hotel... / สอบถามข้อมูลที่พัก..."
                className="flex-1 resize-none rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-blue-600 max-h-28"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || chatLoading}
                className="h-10 w-10 shrink-0 rounded-lg bg-gray-900 text-white flex items-center justify-center hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                aria-label="Send message"
              >
                {chatLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
