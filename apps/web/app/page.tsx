'use client';

import { useEffect, useState } from 'react';
import Tabs from '@mui/material/Tabs';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import { JrrpPage } from '../components/jrrp/jrrp';
import { Header } from '../components/header/header';
import { useUserContext } from '../context/context';
import Footer from '../components/footer/footer';

import styles from './page.module.css';
import { CocPage } from '../components/coc/coc';
import { useSearchParams } from 'next/navigation';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const tabNames = ['jrrp', 'r', 'coc', 'dnd', 'choice'];

export default function Page() {
  const [value, setValue] = useState(0);
  const [, dispatch] = useUserContext();
  const query = useSearchParams();

  useEffect(() => {
    const tabQueryParam = query.get('tab') as string;
    if (tabQueryParam) {
      const tabIndex = tabNames.indexOf(tabQueryParam);
      if (tabIndex >= 0) {
        setValue(tabIndex);
      }
    }
  }, [query]);

  useEffect(() => {
    const nickname = localStorage.getItem('nickname');
    if (nickname) {
      dispatch({ type: 'setNickname', nickname });
    } else {
      const randString = Math.random().toString(36).substring(5);
      dispatch({ type: 'setNickname', nickname: '未命名喵' + randString });
    }
    const qq = localStorage.getItem('qq');
    if (qq) {
      dispatch({ type: 'setQQ', qq });
    }
  }, [dispatch]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const TabList = tabNames.map((name, index) => (
    <Tab label={`.${name}`} {...a11yProps(index)} key={name} />
  ));

  return (
    <div className={styles.body}>
      <div className={styles.content}>
        <Header />
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            {TabList}
          </Tabs>
        </Box>
        <CustomTabPanel value={value} index={0}>
          <JrrpPage />
        </CustomTabPanel>
        <CustomTabPanel value={value} index={2}>
          <CocPage />
        </CustomTabPanel>
      </div>
      <Footer className={styles.footer} />
    </div>
  );
}
