import { css } from '@emotion/react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Top, Spacing, Border, Text, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { TIME_SLOTS } from 'constants/timeSlots';
import { formatDate } from 'utils/date';
import { useBookingSearchParams } from './hooks/useBookingSearchParams';
import { useBookingValidation } from './hooks/useBookingValidation';
import { useAvailableRooms } from './hooks/useAvailableRooms';
import { useBookingSubmit } from './hooks/useBookingSubmit';
import { AvailableRoomList } from './components/AvailableRoomList';
import { FilterField } from './components/FilterField';
import { EquipmentToggleGroup } from './components/EquipmentToggleGroup';

const inputStyle = css`
  box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
  background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
  width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
  transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
`;

export function RoomBookingPage() {
  const navigate = useNavigate();

  const {
    date, startTime, endTime, attendees, equipment, preferredFloor,
    setDate, setStartTime, setEndTime, setAttendees, setEquipment, setPreferredFloor,
  } = useBookingSearchParams();

  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  const { validationError, isFilterComplete } = useBookingValidation({ startTime, endTime, attendees });
  const { availableRooms, floors } = useAvailableRooms({
    date, startTime, endTime, attendees, equipment, preferredFloor, isFilterComplete,
  });
  const { submitBooking, isSubmitting, errorMessage, setErrorMessage, clearError } = useBookingSubmit();

  // 필터 변경 시 선택 초기화
  const handleFilterChange = () => {
    setSelectedRoomId(null);
    clearError();
  };

  const handleBookRoom = async () => {
    if (!selectedRoomId) {
      setErrorMessage('회의실을 선택해주세요.');
      return;
    }

    const result = await submitBooking({
      roomId: selectedRoomId,
      date,
      start: startTime,
      end: endTime,
      attendees,
      equipment,
    });

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

      {/* 예약 조건 입력 */}
      <div css={css`padding: 0 24px;`}>
        <Text typography="t5" fontWeight="bold" color={colors.grey900}>
          예약 조건
        </Text>
        <Spacing size={16} />

        <FilterField label="날짜">
          <input
            type="date"
            value={date}
            min={formatDate(new Date())}
            onChange={e => { setDate(e.target.value); handleFilterChange(); }}
            aria-label="날짜"
            css={inputStyle}
          />
        </FilterField>
        <Spacing size={14} />

        <div css={css`display: flex; gap: 12px;`}>
          <FilterField label="시작 시간">
            <Select
              value={startTime}
              onChange={e => { setStartTime(e.target.value); handleFilterChange(); }}
              aria-label="시작 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(0, -1).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </FilterField>
          <FilterField label="종료 시간">
            <Select
              value={endTime}
              onChange={e => { setEndTime(e.target.value); handleFilterChange(); }}
              aria-label="종료 시간"
            >
              <option value="">선택</option>
              {TIME_SLOTS.slice(1).map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>
          </FilterField>
        </div>
        <Spacing size={14} />

        <div css={css`display: flex; gap: 12px;`}>
          <FilterField label="참석 인원">
            <input
              type="number"
              min={1}
              value={attendees}
              onChange={e => { setAttendees(Math.max(1, Number(e.target.value))); handleFilterChange(); }}
              aria-label="참석 인원"
              css={inputStyle}
            />
          </FilterField>
          <FilterField label="선호 층">
            <Select
              value={preferredFloor ?? ''}
              onChange={e => {
                const val = e.target.value;
                setPreferredFloor(val === '' ? null : Number(val));
                handleFilterChange();
              }}
              aria-label="선호 층"
            >
              <option value="">전체</option>
              {floors.map((f: number) => (
                <option key={f} value={f}>{f}층</option>
              ))}
            </Select>
          </FilterField>
        </div>
        <Spacing size={14} />

        <EquipmentToggleGroup
          selected={equipment}
          onChange={(next) => { setEquipment(next); handleFilterChange(); }}
        />
      </div>

      {validationError && (
        <div css={css`padding: 0 24px;`}>
          <Spacing size={8} />
          <span css={css`color: ${colors.red500}; font-size: 14px;`} role="alert">{validationError}</span>
        </div>
      )}

      <Spacing size={24} />
      <Border size={8} />
      <Spacing size={24} />

      {isFilterComplete && (
        <AvailableRoomList
          rooms={availableRooms}
          selectedRoomId={selectedRoomId}
          onSelectRoom={setSelectedRoomId}
          onBook={handleBookRoom}
          isBooking={isSubmitting}
        />
      )}

      <Spacing size={24} />
    </div>
  );
}
