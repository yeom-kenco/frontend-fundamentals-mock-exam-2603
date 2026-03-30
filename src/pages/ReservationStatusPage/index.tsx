import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMyReservations } from './hooks/useMyReservations';
import { useStatusMessage } from './hooks/useStatusMessage';
import { Top, Spacing, Border, Button, Text, ListRow } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useReservationTimeline } from './hooks/useReservationTimeline';
import { DateSelector } from './components/DateSelector';
import { ReservationTimeline } from './components/ReservationTimeline';
import { MessageBanner } from './components/MessageBanner';
import { EQUIPMENT_LABELS } from 'constants/equipment';
import { formatDate } from 'utils/date';
import type { Room, Reservation } from 'types/reservation';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date()));

  const { message, showSuccess, showError } = useStatusMessage();
  const { rooms, reservations } = useReservationTimeline(date);
  const { myReservations, cancelReservationById } = useMyReservations();

  const confirmAndCancelReservation = async (id: string) => {
    try {
      await cancelReservationById(id);
      showSuccess('예약이 취소되었습니다.');
    } catch {
      showError('취소에 실패했습니다.');
    }
  };

  const getRoomName = (roomId: string) => rooms.find((r: Room) => r.id === roomId)?.name ?? roomId;

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        회의실 예약
      </Top.Top03>

      <Spacing size={24} />

      <DateSelector value={date} onChange={setDate} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <ReservationTimeline rooms={rooms} reservations={reservations} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <MessageBanner message={message} />

      {/* 내 예약 목록 */}
      <div css={css`padding: 0 24px;`}>
        <div css={css`display: flex; align-items: baseline; gap: 6px;`}>
          <Text typography="t5" fontWeight="bold" color={colors.grey900}>
            내 예약
          </Text>
          {myReservations.length > 0 && (
            <Text typography="t7" fontWeight="medium" color={colors.grey500}>
              {myReservations.length}건
            </Text>
          )}
        </div>
        <Spacing size={16} />

        {myReservations.length === 0 ? (
          <div css={css`padding: 40px 0; text-align: center; background: ${colors.grey50}; border-radius: 14px;`}>
            <Text typography="t6" color={colors.grey500}>
              예약 내역이 없습니다.
            </Text>
          </div>
        ) : (
          <div css={css`display: flex; flex-direction: column; gap: 10px;`}>
            {myReservations.map((res: Reservation) => (
              <div
                key={res.id}
                css={css`padding: 14px 16px; border-radius: 14px; background: ${colors.grey50}; border: 1px solid ${colors.grey200};`}
              >
                <ListRow
                  contents={
                    <ListRow.Text2Rows
                      top={getRoomName(res.roomId)}
                      topProps={{ typography: 't6', fontWeight: 'bold', color: colors.grey900 }}
                      bottom={`${res.date} ${res.start}~${res.end} · ${res.attendees}명 · ${res.equipment.map((e: string) => EQUIPMENT_LABELS[e]).join(', ') || '장비 없음'}`}
                      bottomProps={{ typography: 't7', color: colors.grey600 }}
                    />
                  }
                  right={
                    <Button
                      type="danger"
                      style="weak"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm('정말 취소하시겠습니까?')) {
                          confirmAndCancelReservation(res.id);
                        }
                      }}
                    >
                      취소
                    </Button>
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {/* 예약하기 버튼 */}
      <div css={css`padding: 0 24px;`}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
