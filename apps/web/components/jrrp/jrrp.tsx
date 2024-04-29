import { useState } from 'react';

import PageComponentBase from '../PageComponentBase/PageComponentBase';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import styles from './jrrp.module.css';
import myRequest from '../../request';
import { useBindQQContext } from '../../context/context';

export function JrrpPage() {
  interface TextFieldStatus {
    nickname: {
      text: string;
      error: boolean;
    } | null;
    qq: {
      text: string;
      error: boolean;
    } | null;
  }

  const [qq] = useBindQQContext();

  const [nickname, setNickname] = useState<string>('');
  const [textFieldStatus, setTextFieldStatus] = useState<TextFieldStatus>({
    nickname: null,
    qq: null,
  });

  const [jrrp, setJrrp] = useState<number | null>(null);

  const handleSubmit = async () => {
    setTextFieldStatus({ nickname: null, qq: null });
    setJrrp(null);

    if (nickname === '') {
      setTextFieldStatus((prev) => ({
        ...prev,
        nickname: { text: '请告诉沫纯你是谁喵w~', error: true },
      }));
      return;
    }

    try {
      const fromString = qq.qq ? `${qq.qq}@qq` : `${nickname}@webui`;
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
      <div className={styles.inputBox}>
        <TextField
          className={styles.textFieldName}
          required
          autoComplete="jrrp-name"
          id="jrrp-nickname"
          label="你是谁喵w"
          variant="standard"
          inputProps={{ maxLength: 30 }}
          error={textFieldStatus.nickname?.error}
          helperText={textFieldStatus.nickname?.text}
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
        />
        <Button
          className={styles.okButton}
          variant="contained"
          onClick={handleSubmit}
        >
          确认
        </Button>
      </div>
      {jrrp !== null && (
        <div className={styles.result}>
          <Typography variant="body1">
            沫纯猜测{nickname}的今日人品值为{jrrp}喵w~
          </Typography>
        </div>
      )}
    </PageComponentBase>
  );
}
