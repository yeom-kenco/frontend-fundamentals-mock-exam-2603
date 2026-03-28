import { useQuery } from '@tanstack/react-query';
import { getRooms, getReservations } from 'pages/remotes';
import type { Room, Reservation } from 'types/reservation';

export function useReservationTimeline(date: string) {
  const { data: rooms = [] } = useQuery<Room[]>(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery<Reservation[]>(
    ['reservations', date],
    () => getReservations(date),
    { enabled: !!date }
  );

  return { rooms, reservations };
}
