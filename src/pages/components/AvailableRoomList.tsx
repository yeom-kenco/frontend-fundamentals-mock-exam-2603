import { css } from '@emotion/react';
import { Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS } from '../../constants';
import { Room } from '../../domain/reservation';
import { AvailableRoomListItem } from './AvailableRoomListItem';

interface Props {
  rooms: Room[];
  selectedRoomId: string | null;
  onSelect: (id: string) => void;
}

export function AvailableRoomList({ rooms, selectedRoomId, onSelect }: Props) {
  if (rooms.length === 0) {
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
          조건에 맞는 회의실이 없습니다.
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
      {rooms.map(room => (
        <AvailableRoomListItem
          key={room.id}
          room={room}
          isSelected={selectedRoomId === room.id}
          onClick={() => onSelect(room.id)}
        />
      ))}
    </div>
  );
}
