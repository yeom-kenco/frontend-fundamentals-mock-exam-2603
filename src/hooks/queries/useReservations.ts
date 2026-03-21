import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReservations, createReservation, getMyReservations, cancelReservation } from 'pages/remotes';

// 특정 날짜의 전체 예약 현황 조회
export function useReservations(date: string) {
  return useQuery(['reservations', date], () => getReservations(date), {
    enabled: !!date,
  });
}

// 내 예약 목록 조회
export function useMyReservations() {
  return useQuery(['myReservations'], getMyReservations);
}

// 예약 생성
export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation(createReservation, {
    onSuccess: (_, variables) => {
      // 예약 성공 시 관련 데이터 무효화 (자동 갱신)
      queryClient.invalidateQueries(['reservations', variables.date]);
      queryClient.invalidateQueries(['myReservations']);
    },
  });
}

// 예약 취소
export function useCancelReservation() {
  const queryClient = useQueryClient();
  return useMutation(cancelReservation, {
    onSuccess: () => {
      queryClient.invalidateQueries(['reservations']);
      queryClient.invalidateQueries(['myReservations']);
    },
  });
}
