import { useQuery } from '@tanstack/react-query';
import { getRooms, getReservations, queryKeys } from 'pages/remotes';

export function useReservationTimeline(date: string) {
  const { data: rooms = [] } = useQuery(queryKeys.rooms(), getRooms);
  const { data: reservations = [] } = useQuery(queryKeys.reservations(date), () => getReservations(date), {
    enabled: !!date,
  });

  return { rooms, reservations };
}
