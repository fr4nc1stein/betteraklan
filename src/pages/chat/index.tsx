import { FormEvent, useEffect, useRef, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { Button } from '@bettergov/kapwa/button';
import { Bot, Send, User } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { SEO } from '@/components/layout/SEO';
import { TurnstileExecutor } from '@/lib/turnstile';

// Public by design — Turnstile site keys are meant to be embedded client-side.
const TURNSTILE_SITE_KEY = '0x4AAAAAAEE5-9SLqsCfv4BZ';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatApiResponse {
  answer?: string;
  error?: string;
}

export default function ChatPage() {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const executorRef = useRef<TurnstileExecutor | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!turnstileContainerRef.current) return;
    const executor = new TurnstileExecutor(
      turnstileContainerRef.current,
      TURNSTILE_SITE_KEY
    );
    executorRef.current = executor;
    executor.init().catch(() => {
      setError(t('chat.verificationUnavailable'));
    });

    return () => {
      executor.destroy();
      executorRef.current = null;
    };
  }, [t]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  async function sendMessage(message: string) {
    if (!message || sending) return;

    setError(null);
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setSending(true);

    try {
      if (!executorRef.current) {
        throw new Error(t('chat.verificationUnavailable'));
      }
      const turnstileToken = await executorRef.current.getToken();

      const res = await fetch('/api/citizens-charter-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, turnstileToken }),
      });
      const data: ChatApiResponse = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || t('chat.genericError'));
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.answer || t('chat.emptyAnswer') },
      ]);
    } catch (err) {
      setError((err as Error).message || t('chat.genericError'));
    } finally {
      setSending(false);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input.trim());
  }

  const suggestions = t('chat.suggestions', {
    returnObjects: true,
  }) as string[];

  return (
    <div className='flex h-[calc(100vh-104px)] flex-col'>
      <SEO title={t('chat.title')} description={t('chat.intro')} />

      <div className='flex-1 overflow-y-auto'>
        <div className='mx-auto max-w-3xl px-4 py-6'>
          {messages.length === 0 ? (
            <div className='flex h-full flex-col items-center justify-center py-16 text-center'>
              <Bot className='text-kapwa-text-muted mb-4 h-10 w-10' />
              <h1 className='text-kapwa-text-strong mb-2 text-2xl font-bold'>
                {t('chat.title')}
              </h1>
              <p className='text-kapwa-text-muted mb-8 max-w-md text-sm'>
                {t('chat.intro')}
              </p>
              <div className='grid w-full max-w-lg grid-cols-1 gap-2 sm:grid-cols-2'>
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion}
                    type='button'
                    onClick={() => sendMessage(suggestion)}
                    className='border-kapwa-border-weak hover:bg-kapwa-bg-muted text-kapwa-text-strong rounded-lg border px-4 py-3 text-left text-sm transition-colors'
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className='space-y-6'>
              {messages.map((m, i) => (
                <div key={i} className='flex gap-3'>
                  <div
                    className={
                      m.role === 'user'
                        ? 'bg-kapwa-bg-brand-default flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white'
                        : 'bg-kapwa-bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full'
                    }
                  >
                    {m.role === 'user' ? (
                      <User className='h-4 w-4' />
                    ) : (
                      <Bot className='h-4 w-4' />
                    )}
                  </div>
                  <div className='min-w-0 flex-1 pt-1'>
                    {m.role === 'assistant' ? (
                      <div
                        className='text-kapwa-text-strong space-y-2 text-sm [&_ol]:list-decimal
                          [&_ol]:space-y-1 [&_ol]:pl-4 [&_p]:leading-relaxed
                          [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-4'
                      >
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p className='text-kapwa-text-strong text-sm leading-relaxed'>
                        {m.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {sending && (
                <div className='flex gap-3'>
                  <div className='bg-kapwa-bg-muted flex h-8 w-8 shrink-0 items-center justify-center rounded-full'>
                    <Bot className='h-4 w-4' />
                  </div>
                  <p className='text-kapwa-text-muted pt-1 text-sm italic'>
                    {t('chat.thinking')}
                  </p>
                </div>
              )}
              {error && (
                <div className='rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700'>
                  {error}
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Invisible execute-mode widget — never visibly rendered, just
          redeems a fresh single-use token per sendMessage call. */}
      <div ref={turnstileContainerRef} />

      <div className='border-kapwa-border-weak border-t px-4 py-4'>
        <form
          onSubmit={handleSubmit}
          className='mx-auto flex max-w-3xl items-center gap-2'
        >
          <input
            ref={inputRef}
            type='text'
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={t('chat.placeholder')}
            disabled={sending}
            className='border-kapwa-border-weak flex-1 rounded-full border px-4 py-3 text-sm disabled:opacity-50'
          />
          <Button
            type='submit'
            disabled={sending || !input.trim()}
            aria-label={t('chat.send')}
          >
            <Send className='h-4 w-4' />
          </Button>
        </form>
        <p className='text-kapwa-text-muted mx-auto mt-2 max-w-3xl text-center text-xs'>
          {t('chat.disclaimer')}
        </p>
      </div>
    </div>
  );
}
