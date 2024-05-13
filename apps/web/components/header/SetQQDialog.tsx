import { useState } from 'react';
import { useUserContext } from '../../context/context';

import Avatar from '@mui/material/Avatar';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import styles from './header.module.css';
import DialogContent from '@mui/material/DialogContent';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import Button from '@mui/material/Button';

export default function SetQQDialog() {
  const [user, dispatch] = useUserContext();

  const [open, setOpen] = useState(false);
  const [inputIsTextField, setInputIsTextField] = useState(true);
  const [qq, setQQ] = useState('');
  const [inputError, setInputError] = useState('');

  const getQQAvatar = (qq: string, alwaysFetch = true) =>
    alwaysFetch && qq && qq.length > 0
      ? `https://q1.qlogo.cn/g?b=qq&nk=${qq}&s=640`
      : 'https://moegirl.uk/images/b/b7/Transparent_Akkarin.jpg';

  const avatarAlt =
    user.bindQQ && user.qq ? `所以你的QQ号是${user.qq}喵w~` : '未知QQ喵w~';
  const avatarSrc = getQQAvatar(user.qq, user.bindQQ);

  const handleClickAvatar = () => {
    if (qq.length === 0) {
      dispatch({ type: 'unbindQQ' });
    }

    setOpen(true);
  };

  const handleSubmit = () => {
    setInputError('');
    const qqStr = qq.toString();
    if (qqStr.length < 5 || qqStr.length > 11) {
      setInputError('沫纯不觉得有这种QQ号喵w~');
      return;
    }

    // TODO: 保存到一些状态里
    dispatch({ type: 'setQQ', qq: qqStr });

    setOpen(false);
  };

  const TextFieldInput = (
    <>
      <TextField
        className={styles.input}
        variant="standard"
        label="我的QQ号是"
        autoComplete="jrrp-qq"
        value={qq}
        onChange={(e) => setQQ(e.target.value)}
        error={inputError.length > 0}
        required
      />
      <Typography
        variant="h6"
        component="div"
        className={styles.linker}
        onClick={() => setInputIsTextField(false)}
      >
        我不喜欢输入框！我要用滑动条！
      </Typography>
    </>
  );

  const SliderInput = (
    <>
      <Slider
        defaultValue={100000000}
        step={1}
        min={10000}
        max={10000000000}
        onChange={(_, v) => setQQ(Number(v).toString())}
        valueLabelDisplay="auto"
      />
      <Typography
        variant="body1"
        component="div"
        className={styles.linker}
        onClick={() => setInputIsTextField(true)}
      >
        算了，我还是喜欢输入框~
      </Typography>
    </>
  );

  return (
    <>
      <Avatar
        src={avatarSrc}
        alt={avatarAlt}
        onClick={handleClickAvatar}
        sx={{ width: 48, height: 48 }}
      />
      <Dialog open={open} className={styles.dialogBox}>
        <DialogTitle>请在这里设置你的QQ号喵w~</DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => setOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers className={styles.dialogContent}>
          {inputIsTextField ? TextFieldInput : SliderInput}
          <div className={styles.preview}>
            <Avatar src={getQQAvatar(qq)} alt="喵w" />
            <Typography variant="body2" component="span">
              ← 所以这个是你喵w?
            </Typography>
          </div>
          {inputError.length > 0 ? (
            <Typography
              variant="body2"
              component="div"
              className={styles.error}
            >
              {inputError}
            </Typography>
          ) : null}
          <Button
            variant="contained"
            className={styles.confirmButton}
            onClick={handleSubmit}
          >
            沫纯知道了喵w~
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
