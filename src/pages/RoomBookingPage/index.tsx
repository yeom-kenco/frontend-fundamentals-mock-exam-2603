import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Spacing, Border, Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { useBookingSearchParams } from './hooks/useBookingSearchParams';
import { useBookingValidation } from './hooks/useBookingValidation';
import { useBookingSubmit } from './hooks/useBookingSubmit';
import { useAvailableRooms } from './hooks/useAvailableRooms';
import { ReservationForm } from './components/ReservationForm';
import { AvailableRoomList } from './components/AvailableRoomList';

export function RoomBookingPage() {
  const navigate = useNavigate();

  const { date, startTime, endTime, attendees, equipment, preferredFloor } = useBookingSearchParams();
  const { validationError, isFilterComplete } = useBookingValidation({ startTime, endTime, attendees });
  const { availableRooms, floors } = useAvailableRooms({
    date, startTime, endTime, attendees, equipment, preferredFloor, isFilterComplete,
  });
  const { submitBooking, isSubmitting, errorMessage, clearError } = useBookingSubmit();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // 필터 변경 시 선택 및 에러 초기화
  const filterKey = `${date}|${startTime}|${endTime}|${attendees}|${equipment.join(',')}|${preferredFloor}`;
  useEffect(() => {
    setSelectedRoomId(null);
    clearError();
  }, [filterKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBookRoom = async () => {
    const result = await submitBooking(selectedRoomId);
    if (!result.success) {
      setSelectedRoomId(null);
    }
  };

  return (
    <div css={css`background: ${colors.white}; padding-bottom: 40px;`}>
      <div css={css`padding: 12px 24px 0;`}>
        <button
          type="button"
          onClick={() => navigate('/')}
          aria-label="뒤로가기"
          css={css`
            background: none; border: none; padding: 0; cursor: pointer; font-size: 14px;
            color: ${colors.grey600}; &:hover { color: ${colors.grey900}; }
          `}
        >
          ← 예약 현황으로
        </button>
      </div>
      <Top.Top03 css={css`padding-left: 24px; padding-right: 24px;`}>
        예약하기
      </Top.Top03>

      {errorMessage && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={12} />
          <div
            css={css`
              padding: 10px 14px; border-radius: 10px; background: ${colors.red50};
              display: flex; align-items: center; gap: 8px;
            `}
          >
            <Text typography="t7" fontWeight="medium" color={colors.red500}>{errorMessage}</Text>
          </div>
        </div>
      )}

      <Spacing size={24} />

      <ReservationForm floors={floors} />

      {validationError && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={8} />
          <span css={css`color: ${colors.red500}; font-size: 14px;`} role="alert">{validationError}</span>
        </div>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      <AvailableRoomList
        selectedRoomId={selectedRoomId}
        onSelectRoom={setSelectedRoomId}
        onBook={handleBookRoom}
        isBooking={isSubmitting}
      />

      <Spacing size={24} />
    </div>
  );
}
