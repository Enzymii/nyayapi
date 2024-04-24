import React from 'react';
import { useBindQQContext } from '../../context/context';

import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import styles from './BindQQ.module.css';

export const BindQQ: React.FC = () => {
  const [bind, dispatch] = useBindQQContext();
  const [text, setText] = React.useState(bind.qq ?? '');

  const [textFieldStatus, setTextFieldStatus] = React.useState<{
    text: string;
    error: boolean;
  }>({ text: '', error: false });

  const handleChangeCheckBox = (
    _: React.ChangeEvent<HTMLInputElement>,
    v: boolean
  ) => {
    dispatch({ type: v ? 'bind' : 'unbind' });
  };

  const handleChangeInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setText(e.target.value);
  };

  const handleValidation = () => {
    if (bind.bind) {
      if (text.length === 0) {
        setTextFieldStatus({
          text: '你还没有告诉沫纯你的QQ号喵w~',
          error: true,
        });
        dispatch({ type: 'bind', qq: '' });
        return false;
      } else if (!/^\d{5,11}$/.test(text)) {
        setTextFieldStatus({ text: '沫纯不觉得有这样的QQ号喵w~', error: true });
        dispatch({ type: 'bind', qq: '' });
        return false;
      } else {
        setTextFieldStatus({ text: '', error: false });
        dispatch({ type: 'bind', qq: text });
      }
    }
  };

  return (
    <div className={styles.box}>
      <div>
        我要和我的QQ记录绑定！
        <Checkbox onChange={handleChangeCheckBox} />
      </div>
      <div className={styles.textFieldRow}>
        <TextField
          className={styles.textField}
          disabled={!bind.bind}
          required={bind.bind}
          autoComplete="jrrp-qq"
          id="jrrp-qq"
          label="你的QQ是什么喵w"
          variant="standard"
          inputProps={{ maxLength: 11 }}
          style={{ marginRight: '1rem' }}
          error={textFieldStatus.error}
          helperText={textFieldStatus.text}
          value={text}
          onChange={handleChangeInput}
        />
        <Button
          variant="text"
          color="primary"
          size="small"
          disabled={!bind.bind}
          onClick={handleValidation}
        >
          确认
        </Button>
      </div>
      {bind.bind && bind.qq && bind.qq.length > 0 && (
        <div className={styles.avatarRow}>
          <Avatar src={`https://q1.qlogo.cn/g?b=qq&nk=${bind.qq}&s=100`} />
          <Typography variant="body1">←所以这个是你喵w~</Typography>
        </div>
      )}
    </div>
  );
};
