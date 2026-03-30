import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { createReservation, queryKeys } from 'pages/remotes';
import type { CreateReservationRequest } from 'types/reservation';
import { useBookingSearchParams } from './useBookingSearchParams';

export function useBookingSubmit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { date, startTime, endTime, attendees, equipment } = useBookingSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation(
    (data: CreateReservationRequest) => createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(queryKeys.reservations(variables.date));
        queryClient.invalidateQueries(queryKeys.myReservations());
      },
    }
  );

  const submitBooking = async (roomId: string | null) => {
    if (!roomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return { success: false as const };
    }
    if (!startTime || !endTime) {
      setErrorMessage('시작 시간과 종료 시간을 선택해주세요.');
      return { success: false as const };
    }

    try {
      const result = await createMutation.mutateAsync({
        roomId,
        date,
        start: startTime,
        end: endTime,
        attendees,
        equipment,
      });

      if ('ok' in result && result.ok) {
        navigate('/?status=booked');
        return { success: true as const };
      }

      const errResult = result as { message?: string };
      setErrorMessage(errResult.message ?? '예약에 실패했습니다.');
      return { success: false as const };
    } catch (err: unknown) {
      let serverMessage = '예약에 실패했습니다.';
      if (axios.isAxiosError(err)) {
        const data = err.response?.data as { message?: string } | undefined;
        serverMessage = data?.message ?? serverMessage;
      }
      setErrorMessage(serverMessage);
      return { success: false as const };
    }
  };

  return {
    submitBooking,
    isSubmitting: createMutation.isLoading,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
}
