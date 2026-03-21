import { filterAvailableRooms, Room, Reservation } from './reservation';

describe('filterAvailableRooms 도메인 로직 테스트', () => {
  const mockRooms: Room[] = [
    { id: '1', name: '작은 회의실', floor: 3, capacity: 4, equipment: ['tv'] },
    { id: '2', name: '큰 회의실', floor: 5, capacity: 10, equipment: ['tv', 'whiteboard'] },
  ];

  it('참석 인원보다 수용 인원이 적은 회의실은 제외된다', () => {
    const result = filterAvailableRooms(mockRooms, [], {
      date: '2026-03-22',
      startTime: '10:00',
      endTime: '11:00',
      attendees: 5, // 작은 회의실(4명) 탈락 예상
      equipment: [],
      preferredFloor: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('선택한 장비가 없는 회의실은 제외된다', () => {
    const result = filterAvailableRooms(mockRooms, [], {
      date: '2026-03-22',
      startTime: '10:00',
      endTime: '11:00',
      attendees: 2,
      equipment: ['whiteboard'], // 작은 회의실 탈락 예상
      preferredFloor: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('기존 예약과 시간이 겹치는 회의실은 제외된다', () => {
    const mockReservations: Reservation[] = [
      // 큰 회의실이 10:30 ~ 11:30에 이미 예약됨
      { id: 'res1', roomId: '2', date: '2026-03-22', start: '10:30', end: '11:30', attendees: 5, equipment: [] },
    ];
    const result = filterAvailableRooms(mockRooms, mockReservations, {
      date: '2026-03-22',
      startTime: '10:00',
      endTime: '11:00', // 10:30부터 겹침! 큰 회의실 탈락 예상
      attendees: 2,
      equipment: [],
      preferredFloor: null,
    });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });
});
