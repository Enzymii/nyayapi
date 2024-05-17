import { useState } from 'react';

import PageComponentBase from '../PageComponentBase/PageComponentBase';
import Typography from '@mui/material/Typography';

import styles from './jrrp.module.css';
import myRequest from '../../request';
import { useUserContext } from '../../context/context';
import DebounceButton from '../DebounceButton/DebounceButton';

export function JrrpPage() {
  const [user] = useUserContext();

  const [jrrp, setJrrp] = useState<number | null>(null);

  const handleSubmit = async () => {
    setJrrp(null);

    try {
      const req = await myRequest.requestToProxy({
        path: 'jrrp',
        method: 'GET',
        params: {
          from: user.getFromString(),
        },
      });

      setJrrp(req.data.result.jrrp);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageComponentBase>
      <DebounceButton
        className={styles.okButton}
        debounceTime={3000}
        variant="contained"
        onClick={handleSubmit}
      >
        点这里喵w~
      </DebounceButton>
      {jrrp !== null && (
        <div className={styles.result}>
          <Typography variant="body1">
            沫纯猜测{user.nickname}的今日人品值为{jrrp}喵w~
          </Typography>
        </div>
      )}
    </PageComponentBase>
  );
}
