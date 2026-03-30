import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMyReservations, cancelReservation, queryKeys } from 'pages/remotes';

export function useMyReservations() {
  const queryClient = useQueryClient();

  const { data: myReservations = [] } = useQuery(queryKeys.myReservations(), getMyReservations);

  const cancelMutation = useMutation((id: string) => cancelReservation(id), {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(queryKeys.myReservations());
    },
  });

  const cancelReservationById = (id: string) => cancelMutation.mutateAsync(id);

  return { myReservations, cancelReservationById };
}
