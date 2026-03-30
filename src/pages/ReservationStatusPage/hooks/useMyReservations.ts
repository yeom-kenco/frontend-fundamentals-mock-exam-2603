import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation } from 'pages/remotes';
import type { Reservation } from 'types/reservation';

export function useMyReservations() {
  const queryClient = useQueryClient();

  const { data: myReservations = [] } = useQuery<Reservation[]>(['myReservations'], getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });

  const cancelReservationById = (id: string) => cancelMutation.mutateAsync(id);

  return { myReservations, cancelReservationById };
}
