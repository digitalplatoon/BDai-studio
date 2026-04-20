'use client';

import dynamic from 'next/dynamic';

const StandaloneShell = dynamic(() => import('../../components/StandaloneShell'), {
  ssr: false,
});

export default function StudioPage() {
  return <StandaloneShell />;
}
