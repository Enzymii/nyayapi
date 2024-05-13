import config from '../../config/config';

import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';

import styles from './footer.module.css';

const Footer = ({ className }: { className: string }) => {
  const footerContent = config.footer.map((item) => {
    if (item.type === 'text') {
      return (
        <Typography key={item.name} className={styles.content} variant="body2">
          {item.content}
        </Typography>
      );
    }
    return (
      <Link key={item.name} className={styles.content} href={item.href}>
        {item.content}
      </Link>
    );
  });

  return (
    config.footer && (
      <div className={`${className} ${styles.footer}`}>{footerContent}</div>
    )
  );
};

export default Footer;
