'use client';

import { useSearchParams } from 'next/navigation';
import { QuizizzGameArena } from '@/components/game/QuizizzGameArena';

export default function SiswaQuizizzGamePage() {
  const searchParams = useSearchParams();
  const pinParam = searchParams ? searchParams.get('pin') : null;

  return <QuizizzGameArena initialPin={pinParam || '849201'} />;
}
