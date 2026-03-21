import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { formatDate } from 'utils/date';
import { validateBookingTime } from 'utils/validation';

export function useBookingFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [date, setDate] = useState(searchParams.get('date') || formatDate(new Date()));
  const [startTime, setStartTime] = useState(searchParams.get('startTime') || '');
  const [endTime, setEndTime] = useState(searchParams.get('endTime') || '');
  const [attendees, setAttendees] = useState(Number(searchParams.get('attendees')) || 1);
  const [equipment, setEquipment] = useState<string[]>(
    searchParams.get('equipment') ? searchParams.get('equipment')!.split(',').filter(Boolean) : []
  );
  const [preferredFloor, setPreferredFloor] = useState<number | null>(
    searchParams.get('floor') ? Number(searchParams.get('floor')) : null
  );
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // URL 쿼리 파라미터 동기화
  useEffect(() => {
    const params: Record<string, string> = {};
    if (date) params.date = date;
    if (startTime) params.startTime = startTime;
    if (endTime) params.endTime = endTime;
    if (attendees > 1) params.attendees = String(attendees);
    if (equipment.length > 0) params.equipment = equipment.join(',');
    if (preferredFloor !== null) params.floor = String(preferredFloor);
    setSearchParams(params, { replace: true });
  }, [date, startTime, endTime, attendees, equipment, preferredFloor, setSearchParams]);

  // 입력 검증 및 초기화 로직
  const validationError = validateBookingTime(startTime, endTime, attendees);
  const isFilterComplete = startTime !== '' && endTime !== '' && !validationError;

  const handleFilterChange = () => {
    setSelectedRoomId(null);
    setErrorMessage(null);
  };

  return {
    date,
    setDate,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    attendees,
    setAttendees,
    equipment,
    setEquipment,
    preferredFloor,
    setPreferredFloor,
    selectedRoomId,
    setSelectedRoomId,
    errorMessage,
    setErrorMessage,
    validationError,
    isFilterComplete,
    handleFilterChange,
  };
}
