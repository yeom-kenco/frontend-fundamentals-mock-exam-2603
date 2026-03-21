import { useQuery } from '@tanstack/react-query';
import { getRooms } from 'pages/remotes';

export function useRooms() {
  return useQuery(['rooms'], getRooms, {
    staleTime: 1000 * 60 * 5, // 5분 동안은 신선한 데이터로 간주
  });
}
