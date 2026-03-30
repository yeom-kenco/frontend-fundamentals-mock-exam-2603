import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

const STATUS_MESSAGES: Record<string, string> = {
  booked: '예약이 완료되었습니다!',
};

export function useStatusMessage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFromUrl = searchParams.get('status');

  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    statusFromUrl && STATUS_MESSAGES[statusFromUrl]
      ? { type: 'success', text: STATUS_MESSAGES[statusFromUrl] }
      : null
  );

  useEffect(() => {
    if (statusFromUrl) {
      searchParams.delete('status');
      setSearchParams(searchParams, { replace: true });
    }
  }, [statusFromUrl, searchParams, setSearchParams]);

  const showSuccess = (text: string) => setMessage({ type: 'success', text });
  const showError = (text: string) => setMessage({ type: 'error', text });

  return { message, showSuccess, showError };
}
