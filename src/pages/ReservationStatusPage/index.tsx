import { css } from '@emotion/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStatusMessage } from './hooks/useStatusMessage';
import { Top, Spacing, Border, Button } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { DateSelector } from './components/DateSelector';
import { ReservationTimeline } from './components/ReservationTimeline';
import { MessageBanner } from './components/MessageBanner';
import { MyReservationList } from './components/MyReservationList';
import { formatDate } from 'utils/date';

export function ReservationStatusPage() {
  const navigate = useNavigate();
  const [date, setDate] = useState(formatDate(new Date()));
  const { message, showSuccess, showError } = useStatusMessage();

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

      <ReservationTimeline date={date} />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <MessageBanner message={message} />

      <MyReservationList
        onCancelSuccess={() => showSuccess('예약이 취소되었습니다.')}
        onCancelError={() => showError('취소에 실패했습니다.')}
      />

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <div css={css`padding: 0 24px;`}>
        <Button display="full" onClick={() => navigate('/booking')}>
          예약하기
        </Button>
      </div>
      <Spacing size={24} />
    </div>
  );
}
