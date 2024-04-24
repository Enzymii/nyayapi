import { useState } from 'react';

import PageComponentBase from '../PageComponentBase/PageComponentBase';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

import styles from './jrrp.module.css';

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

  const [nickname, setNickname] = useState<string>('');
  const [textFieldStatus, setTextFieldStatus] = useState<TextFieldStatus>({
    nickname: null,
    qq: null,
  });

  const handleSubmit = () => {
    setTextFieldStatus({ nickname: null, qq: null });

    if (nickname === '') {
      setTextFieldStatus((prev) => ({
        ...prev,
        nickname: { text: '请告诉沫纯你是谁喵w~', error: true },
      }));
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
    </PageComponentBase>
  );
}
