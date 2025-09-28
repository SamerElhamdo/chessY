import { useState } from 'react';
import type { ChatMessage } from '../types';
import { Button } from '../../../components/ui/button';

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps): JSX.Element {
  const [draft, setDraft] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.trim()) {
      return;
    }
    onSendMessage(draft.trim());
    setDraft('');
  };

  return (
    <section className="card-surface flex h-full flex-col rounded-3xl border border-slate-800/70 p-6">
      <header className="mb-4">
        <h3 className="text-lg font-semibold text-white">محادثة المباراة</h3>
      </header>
      <div className="flex-1 space-y-3 overflow-y-auto pr-2">
        {messages.map((message) => (
          <article
            key={message.id}
            className="rounded-2xl border border-slate-800/70 bg-slate-900/50 p-3 text-sm"
          >
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">{message.author}</span>
              <time dateTime={new Date(message.createdAt).toISOString()}>
                {new Intl.DateTimeFormat('ar-EG', {
                  hour: 'numeric',
                  minute: 'numeric'
                }).format(message.createdAt)}
              </time>
            </div>
            <p className="mt-2 text-slate-100">{message.content}</p>
          </article>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="أرسل رسالة إلى خصمك"
          className="flex-1 rounded-2xl border border-slate-800/70 bg-slate-900/50 px-4 py-3 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
        />
        <Button type="submit" disabled={!draft.trim()}>
          إرسال
        </Button>
      </form>
    </section>
  );
}
