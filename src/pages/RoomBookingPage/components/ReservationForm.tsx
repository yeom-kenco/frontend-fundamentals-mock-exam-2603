import { css } from '@emotion/react';
import { Text, Spacing, Select } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { TIME_SLOTS } from 'constants/timeSlots';
import { formatDate } from 'utils/date';
import { useBookingSearchParams } from '../hooks/useBookingSearchParams';
import { FilterField } from './FilterField';
import { EquipmentToggleGroup } from './EquipmentToggleGroup';

const inputStyle = css`
  box-sizing: border-box; font-size: 16px; font-weight: 500; line-height: 1.5; height: 48px;
  background-color: ${colors.grey50}; border-radius: 12px; color: ${colors.grey800};
  width: 100%; border: 1px solid ${colors.grey200}; padding: 0 16px; outline: none;
  transition: border-color 0.15s; &:focus { border-color: ${colors.blue500}; }
`;

interface ReservationFormProps {
  floors: number[];
}

export function ReservationForm({ floors }: ReservationFormProps) {
  const {
    date, startTime, endTime, attendees, equipment, preferredFloor,
    setDate, setStartTime, setEndTime, setAttendees, setEquipment, setPreferredFloor,
  } = useBookingSearchParams();

  return (
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
          onChange={e => setDate(e.target.value)}
          aria-label="날짜"
          css={inputStyle}
        />
      </FilterField>
      <Spacing size={14} />

      <div css={css`display: flex; gap: 12px;`}>
        <FilterField label="시작 시간">
          <Select
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
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
            onChange={e => setEndTime(e.target.value)}
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
            onChange={e => setAttendees(Math.max(1, Number(e.target.value)))}
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

      <EquipmentToggleGroup selected={equipment} onChange={setEquipment} />
    </div>
  );
}
