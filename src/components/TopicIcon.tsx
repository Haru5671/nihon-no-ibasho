import type { Topic } from '@/data/posts';

interface Props {
  topic: Topic;
  size?: number;
  className?: string;
}

export default function TopicIcon({ topic, size = 16, className = '' }: Props) {
  const s = size;
  const style = { width: s, height: s, display: 'inline-block', flexShrink: 0 };

  switch (topic) {
    case '仕事・AI':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="5" width="16" height="11" rx="1.5" />
          <path d="M6 5V4a1 1 0 011-1h6a1 1 0 011 1v1" />
          <path d="M7 10h2M11 10h2M7 13h6" />
          <circle cx="14.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case '孤独・さみしさ':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="10" cy="7" r="3" />
          <path d="M4 17c0-3.314 2.686-6 6-6s6 2.686 6 6" />
          <path d="M16 8l1.5-1.5M17.5 10H19" strokeWidth="1.2" />
        </svg>
      );
    case '眠れない・不安':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 3a7 7 0 100 14 7 7 0 000-14z" />
          <path d="M10 3C7 3 5 5 5 8c0 2 1 3.5 2.5 4.5" />
          <path d="M8 10h4M10 8v4" strokeWidth="1.2" />
        </svg>
      );
    case '家族・人間関係':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="7" cy="6" r="2.5" />
          <circle cx="13" cy="6" r="2.5" />
          <path d="M2 17c0-2.761 2.239-5 5-5M18 17c0-2.761-2.239-5-5-5" />
          <path d="M7 12c1.5 0 3 .5 3 2v3M13 12c-1.5 0-3 .5-3 2v3" />
        </svg>
      );
    case '恋愛・パートナー':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 16s-7-4.5-7-9a4 4 0 018 0 4 4 0 018 0c0 4.5-7 9-7 9z" />
        </svg>
      );
    case '体・こころ':
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 17c-3.5-2-7-5-7-9a5 5 0 0110 0 5 5 0 0110 0c0 4-3.5 7-7 9" />
          <path d="M10 7v6M7 10h6" strokeWidth="1.3" />
        </svg>
      );
    case 'なんでも':
    default:
      return (
        <svg style={style} className={className} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 10c0 3.866-3.134 7-7 7a6.97 6.97 0 01-4-1.256L3 17l1.256-3A6.97 6.97 0 013 10c0-3.866 3.134-7 7-7s7 3.134 7 7z" />
          <path d="M7 10h.01M10 10h.01M13 10h.01" strokeWidth="2" />
        </svg>
      );
  }
}
