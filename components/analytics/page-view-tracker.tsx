'use client';

import { useEffect } from 'react';

interface PageViewTrackerProps {
  hotelId: string;
  pagePath: string;
  roomId?: string;
}

export default function PageViewTracker({ hotelId, pagePath, roomId }: PageViewTrackerProps) {
  useEffect(() => {
    void fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hotelId, eventType: 'page_view', pagePath, roomId }),
      keepalive: true,
    }).catch((error) => console.warn('Page-view tracking failed:', error));
  }, [hotelId, pagePath, roomId]);

  return null;
}
