import { useState } from 'react';

import PageComponentBase from '../PageComponentBase/PageComponentBase';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import styles from './jrrp.module.css';
import myRequest from '../../request';
import { useUserContext } from '../../context/context';

export function JrrpPage() {
  const [user] = useUserContext();

  const [jrrp, setJrrp] = useState<number | null>(null);

  const handleSubmit = async () => {
    setJrrp(null);

    try {
      const fromString = user.getFromString();
      console.log(user);
      const b64FromString = Buffer.from(fromString).toString('base64');

      const req = await myRequest.requestToProxy({
        path: 'jrrp',
        method: 'GET',
        params: {
          from: b64FromString,
        },
      });

      setJrrp(req.data.result.jrrp);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <PageComponentBase>
      <Button
        className={styles.okButton}
        variant="contained"
        onClick={handleSubmit}
      >
        点这里喵w~
      </Button>
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
