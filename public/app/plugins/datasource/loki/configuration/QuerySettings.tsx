import * as React from 'react';

import { ConfigDescriptionLink, ConfigSubSection } from '@grafana/plugin-ui';
import { InlineField, Input } from '@grafana/ui';

type Props = {
  maxLines: string;
  onMaxLinedChange: (value: string) => void;
};

export const QuerySettings = (props: Props) => {
  const { maxLines, onMaxLinedChange } = props;
  return (
    <ConfigSubSection
      title="Queries"
      description={
        <ConfigDescriptionLink
          description="Additional options to customize your querying experience."
          suffix="loki/configure-loki-data-source/#queries"
          feature="query settings"
        />
      }
    >
      <InlineField
        label="Maximum lines"
        htmlFor="loki_config_maxLines"
        labelWidth={22}
        tooltip={
          <>
            Loki queries must contain a limit of the maximum number of lines returned (default: 1000). Increase this
            limit to have a bigger result set for ad-hoc analysis. Decrease this limit if your browser becomes sluggish
            when displaying the log results.
          </>
        }
      >
        <Input
          type="number"
          id="loki_config_maxLines"
          value={maxLines}
          onChange={(event: React.FormEvent<HTMLInputElement>) => onMaxLinedChange(event.currentTarget.value)}
          width={16}
          placeholder="1000"
          spellCheck={false}
        />
      </InlineField>
    </ConfigSubSection>
  );
};
