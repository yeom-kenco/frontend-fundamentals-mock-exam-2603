import { css } from '@emotion/react';
import { Spacing } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';
import { EQUIPMENT_LABELS, ALL_EQUIPMENT } from 'constants/equipment';
import { FilterField } from './FilterField';

interface EquipmentToggleGroupProps {
  selected: string[];
  onChange: (equipment: string[]) => void;
}

export function EquipmentToggleGroup({ selected, onChange }: EquipmentToggleGroupProps) {
  const toggleEquipment = (eq: string) => {
    const isSelected = selected.includes(eq);
    onChange(isSelected ? selected.filter(e => e !== eq) : [...selected, eq]);
  };

  return (
    <FilterField label="필요 장비">
      <Spacing size={2} />
      <div css={css`display: flex; gap: 8px; flex-wrap: wrap;`}>
        {ALL_EQUIPMENT.map(eq => {
          const isActive = selected.includes(eq);
          return (
            <button
              key={eq}
              type="button"
              onClick={() => toggleEquipment(eq)}
              aria-label={EQUIPMENT_LABELS[eq]}
              aria-pressed={isActive}
              css={css`
                padding: 8px 16px; border-radius: 20px;
                border: 1px solid ${isActive ? colors.blue500 : colors.grey200};
                background: ${isActive ? colors.blue50 : colors.grey50};
                color: ${isActive ? colors.blue600 : colors.grey700};
                font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s;
                &:hover { border-color: ${isActive ? colors.blue500 : colors.grey400}; }
              `}
            >
              {EQUIPMENT_LABELS[eq]}
            </button>
          );
        })}
      </div>
    </FilterField>
  );
}
