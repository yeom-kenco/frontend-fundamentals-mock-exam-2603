import { css } from '@emotion/react';
import { Text, ListRow, Button } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS } from '../../constants';
import { Room, Reservation } from '../../domain/reservation';
import { MyReservationListItem } from './MyReservationListItem';

interface Props {
  reservations: Reservation[];
  rooms: Room[];
  onCancel: (id: string) => void;
}

export function MyReservationList({ reservations, rooms, onCancel }: Props) {
  const getRoomName = (roomId: string) => rooms.find(r => r.id === roomId)?.name ?? roomId;

  if (reservations.length === 0) {
    return (
      <div
        css={css`
          padding: 40px 0;
          text-align: center;
          background: ${colors.grey50};
          border-radius: 14px;
        `}
      >
        <Text typography="t6" color={colors.grey500}>
          예약 내역이 없습니다.
        </Text>
      </div>
    );
  }

  return (
    <div
      css={css`
        display: flex;
        flex-direction: column;
        gap: 10px;
      `}
    >
      {reservations.map(res => (
        <MyReservationListItem key={res.id} reservation={res} roomName={getRoomName(res.roomId)} onCancel={onCancel} />
      ))}
    </div>
  );
}
