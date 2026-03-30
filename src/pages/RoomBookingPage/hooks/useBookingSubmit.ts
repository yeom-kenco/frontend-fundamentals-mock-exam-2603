import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { createReservation } from 'pages/remotes';
import type { CreateReservationRequest } from 'types/reservation';

export function useBookingSubmit() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createMutation = useMutation(
    (data: CreateReservationRequest) => createReservation(data),
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(['reservations', variables.date]);
        queryClient.invalidateQueries(['myReservations']);
      },
    }
  );

  const submitBooking = async (data: CreateReservationRequest) => {
    try {
      const result = await createMutation.mutateAsync(data);

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
    setErrorMessage,
    clearError: () => setErrorMessage(null),
  };
}
