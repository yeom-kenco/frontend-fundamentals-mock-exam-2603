import { http } from 'pages/http';
import type { Room, Reservation, CreateReservationRequest, CreateReservationResponse } from 'types/reservation';

export function getRooms() {
  return http.get<Room[]>('/api/rooms');
}

export function getReservations(date: string) {
  return http.get<Reservation[]>(`/api/reservations?date=${date}`);
}

export function createReservation(data: CreateReservationRequest) {
  return http.post<CreateReservationRequest, CreateReservationResponse>('/api/reservations', data);
}

export function getMyReservations() {
  return http.get<Reservation[]>('/api/my-reservations');
}

export function cancelReservation(id: string) {
  return http.delete<{ ok: boolean }>(`/api/reservations/${id}`);
}

// 쿼리 키 중앙 관리 — 키 불일치 방지
export const queryKeys = {
  rooms: () => ['rooms'] as const,
  reservations: (date: string) => ['reservations', date] as const,
  myReservations: () => ['myReservations'] as const,
};
