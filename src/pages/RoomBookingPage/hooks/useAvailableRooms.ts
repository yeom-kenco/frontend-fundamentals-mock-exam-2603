import { useQuery } from '@tanstack/react-query';
import { getRooms, getReservations } from 'pages/remotes';
import type { Room, Reservation } from 'types/reservation';

interface AvailableRoomsInput {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: string[];
  preferredFloor: number | null;
  isFilterComplete: boolean;
}

export function useAvailableRooms({
  date,
  startTime,
  endTime,
  attendees,
  equipment,
  preferredFloor,
  isFilterComplete,
}: AvailableRoomsInput) {
  const { data: rooms = [] } = useQuery<Room[]>(['rooms'], getRooms);
  const { data: reservations = [] } = useQuery<Reservation[]>(
    ['reservations', date],
    () => getReservations(date),
    { enabled: !!date }
  );

  const floors = [...new Set(rooms.map(r => r.floor))].sort((a, b) => a - b);

  const availableRooms = isFilterComplete
    ? rooms
        .filter(room => {
          if (room.capacity < attendees) return false;
          if (!equipment.every(eq => room.equipment.includes(eq))) return false;
          if (preferredFloor !== null && room.floor !== preferredFloor) return false;
          const hasConflict = reservations.some(
            r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
          );
          if (hasConflict) return false;
          return true;
        })
        .sort((a, b) => {
          if (a.floor !== b.floor) return a.floor - b.floor;
          return a.name.localeCompare(b.name);
        })
    : [];

  return { availableRooms, floors };
}
