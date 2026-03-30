import { css } from '@emotion/react';
import { Text } from '_tosslib/components';
import { colors } from '_tosslib/constants/colors';

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
}

export function FilterField({ label, children }: FilterFieldProps) {
  return (
    <div css={css`display: flex; flex-direction: column; gap: 6px; flex: 1;`}>
      <Text as="label" typography="t7" fontWeight="medium" color={colors.grey600}>{label}</Text>
      {children}
    </div>
  );
}
