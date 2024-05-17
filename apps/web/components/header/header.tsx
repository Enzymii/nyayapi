import React, { useEffect } from 'react';
import { useUserContext } from '../../context/context';

import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import EditIcon from '@mui/icons-material/Edit';

import styles from './header.module.css';
import SetQQDialog from './SetQQDialog';

export const Header: React.FC = () => {
  const [user, dispatch] = useUserContext();

  const [nicknameOnEdit, setNicknameOnEdit] = React.useState<boolean>(false);
  const [newNickname, setNewNickname] = React.useState<string>('');

  const [rememberNickname, setRememberNickname] =
    React.useState<boolean>(false);

  useEffect(() => {
    setNewNickname(user.nickname);
  }, [user.nickname]);

  const handleClickEdit = () => {
    setNicknameOnEdit(true);
  };

  const handleSubmitNicknameEdit = () => {
    dispatch({ type: 'setNickname', nickname: newNickname });

    // 保存到本地
    if (rememberNickname) {
      localStorage.setItem('nickname', newNickname);
    } else {
      localStorage.removeItem('nickname');
    }

    setNicknameOnEdit(false);
  };

  return (
    <div className={styles.header}>
      <div className={styles.content}>
        <SetQQDialog />
        {!nicknameOnEdit ? (
          <>
            <Typography variant="h5" component="h1" className={styles.nickname}>
              {user.nickname}
            </Typography>
            <EditIcon onClick={handleClickEdit} />
          </>
        ) : (
          <>
            <TextField
              value={newNickname}
              onChange={(e) => setNewNickname(e.target.value)}
            />
            <Button onClick={handleSubmitNicknameEdit}>修改</Button>
            <Checkbox
              value={rememberNickname}
              onChange={(e) => setRememberNickname(e.target.checked)}
            />
            <Typography variant="body2">让沫纯记住你的名字喵w~</Typography>
          </>
        )}
      </div>
      <div className={styles.tips}>
        <Typography variant="body2">
          Tips: 想和QQ记录绑定的话，或许可以试试点击头像喵w~
        </Typography>
      </div>
    </div>
  );
};
