import { useSearchParams } from 'react-router-dom';
import { formatDate } from 'utils/date';

export function useBookingSearchParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const date = searchParams.get('date') || formatDate(new Date());
  const startTime = searchParams.get('startTime') || '';
  const endTime = searchParams.get('endTime') || '';
  const attendees = Number(searchParams.get('attendees')) || 1;
  const equipment = searchParams.get('equipment')?.split(',').filter(Boolean) ?? [];
  const preferredFloor = searchParams.get('floor') ? Number(searchParams.get('floor')) : null;

  const updateParam = (key: string, value: string | null) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  return {
    date,
    startTime,
    endTime,
    attendees,
    equipment,
    preferredFloor,
    setDate: (v: string) => updateParam('date', v),
    setStartTime: (v: string) => updateParam('startTime', v),
    setEndTime: (v: string) => updateParam('endTime', v),
    setAttendees: (v: number) => updateParam('attendees', v > 1 ? String(v) : null),
    setEquipment: (eq: string[]) => updateParam('equipment', eq.length > 0 ? eq.join(',') : null),
    setPreferredFloor: (f: number | null) => updateParam('floor', f !== null ? String(f) : null),
  };
}
