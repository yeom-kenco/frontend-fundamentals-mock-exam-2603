export interface Room {
  id: string;
  name: string;
  floor: number;
  capacity: number;
  equipment: string[];
}

export interface Reservation {
  id: string;
  roomId: string;
  date: string;
  start: string;
  end: string;
  attendees: number;
  equipment: string[];
}

interface FilterCondition {
  date: string;
  startTime: string;
  endTime: string;
  attendees: number;
  equipment: string[];
  preferredFloor: number | null;
}

export function filterAvailableRooms(rooms: Room[], reservations: Reservation[], condition: FilterCondition): Room[] {
  const { date, startTime, endTime, attendees, equipment, preferredFloor } = condition;

  return rooms
    .filter(room => {
      // 1. 수용 인원
      if (room.capacity < attendees) return false;

      // 2. 장비 포함
      if (!equipment.every(eq => room.equipment.includes(eq))) return false;

      // 3. 층 조건(옵션)
      if (preferredFloor !== null && room.floor !== preferredFloor) return false;

      // 4. 시간 충돌 없음
      const hasConflict = reservations.some(
        r => r.roomId === room.id && r.date === date && r.start < endTime && r.end > startTime
      );
      if (hasConflict) return false;

      return true;
    })
    .sort((a, b) => {
      // 층수 오름차순 → 이름순 정렬
      if (a.floor !== b.floor) return a.floor - b.floor;
      return a.name.localeCompare(b.name);
    });
}
