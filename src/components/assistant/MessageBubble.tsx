import { linkifySources } from '@/lib/ai/linkifySources';
import { cn } from '@/lib/utils';
import type { AssistantSource } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { SourceList } from './SourceList';

interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  sources: AssistantSource[];
}

export function MessageBubble({ role, content, sources }: MessageBubbleProps) {
  const isUser = role === 'user';

  return (
    <div className={cn('flex', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[80%]', !isUser && 'w-full max-w-[80%]')}>
        <div
          className={cn(
            'rounded-card px-4 py-2.5 text-sm leading-relaxed',
            isUser ? 'bg-brand text-white' : 'bg-neutral-100 text-text-primary'
          )}
        >
          {isUser ? (
            content
          ) : (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                ul: ({ children }) => (
                  <ul className="mb-2 list-disc space-y-1 pl-5 last:mb-0">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="mb-2 list-decimal space-y-1 pl-5 last:mb-0">{children}</ol>
                ),
                h1: ({ children }) => <h1 className="mb-2 text-base font-semibold">{children}</h1>,
                h2: ({ children }) => <h2 className="mb-2 text-sm font-semibold">{children}</h2>,
                h3: ({ children }) => <h3 className="mb-1 text-sm font-semibold">{children}</h3>,
                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                a: ({ children, href }) => {
                  const isInternal = href?.startsWith('/');
                  return (
                    <a
                      href={href}
                      {...(!isInternal && { target: '_blank', rel: 'noreferrer' })}
                      className="font-medium text-brand underline underline-offset-2"
                    >
                      {children}
                    </a>
                  );
                },
              }}
            >
              {linkifySources(content, sources)}
            </ReactMarkdown>
          )}
        </div>
        {!isUser && <SourceList sources={sources} />}
      </div>
    </div>
  );
}
