import { css } from '@emotion/css';

import { GrafanaTheme2 } from '@grafana/data';

import { useStyles2 } from '../../../../themes/ThemeContext';
import { DataLinksCellProps } from '../types';
import { getCellLinks } from '../utils';

export const DataLinksCell = ({ field, rowIdx }: DataLinksCellProps) => {
  const styles = useStyles2(getStyles);

  const links = getCellLinks(field, rowIdx!);

  return (
    <div>
      {links &&
        links.map((link, idx) => {
          return !link.href && link.onClick == null ? (
            <span key={idx} className={styles.linkCell}>
              {link.title}
            </span>
          ) : (
            // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
            <span key={idx} className={styles.linkCell} onClick={link.onClick}>
              <a href={link.href} target={link.target}>
                {link.title}
              </a>
            </span>
          );
        })}
    </div>
  );
};

const getStyles = (theme: GrafanaTheme2) => ({
  linkCell: css({
    userSelect: 'text',
    whiteSpace: 'nowrap',
    fontWeight: theme.typography.fontWeightMedium,
    paddingRight: theme.spacing(1.5),
  }),
});
