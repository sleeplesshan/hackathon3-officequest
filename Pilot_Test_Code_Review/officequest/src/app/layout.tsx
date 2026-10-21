import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import { DbProvider } from '@/lib/db/DbProvider';
import { themeScript } from '@/lib/ui/theme-script';
import HyperFrameHost from '@/components/hyperframe/HyperFrameHost';
import TeamsHost from '@/components/teams/TeamsHost';
import RewardFeedback from '@/components/feedback/RewardFeedback';
import DemoDownloadFeedback from '@/components/feedback/DemoDownloadFeedback';
import '@/styles/feedback.css';

export const metadata: Metadata = { title: 'Office Quest × 효성마을', description: '일하고, 성장하고, 거래하세요. 사내 업무 퀘스트와 포인트 중고거래.' };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{__html:themeScript}}/></head>
      <body><DbProvider>{children}<TeamsHost/><HyperFrameHost/><RewardFeedback/><DemoDownloadFeedback/></DbProvider></body>
    </html>
  );
}
