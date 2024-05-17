import React from 'react';
import { useImmer } from 'use-immer';
import { useUserContext } from '../../context/context';

import DebounceButton from '../DebounceButton/DebounceButton';
import PageComponentBase from '../PageComponentBase/PageComponentBase';
import ButtonGroup from '@mui/material/ButtonGroup';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';

import myRequest from '../../request';

import styles from './coc.module.css';

const ResultRow = ({
  result,
  selected = false,
  ...attrs
}: {
  result: Record<string, number>;
  selected: boolean;
  onClick?: () => void;
}) => {
  const sum = Object.values(result).reduce((acc, cur) => acc + cur, 0);

  const items = [...Object.entries(result), ['SUM', sum]].map(
    ([key, value]) => (
      <div
        key={key}
        className={`${styles.itemText} ${key === 'SUM' ? styles.sumText : ''}`}
      >
        <span>
          {key}: {value}
        </span>
      </div>
    )
  );

  return (
    <ListItem
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      {...attrs}
    >
      {items}
    </ListItem>
  );
};

export function CocPage() {
  const [user] = useUserContext();

  const [results, setResults] = useImmer<Record<string, number>[]>([]);
  const [selected, setSelected] = React.useState<number>(-1);

  const handleClick = async (count: number) => {
    // TODO: send request to backend
    const res = await myRequest.requestToProxy({
      path: 'coc7',
      method: 'GET',
      params: { from: user.getFromString(), num: count },
    });

    if (!res.data.result.length) {
      return;
    }

    setResults((draft) => {
      draft.push(...res.data.result);
    });
  };

  const buttonProps = [
    { text: '+1', count: 1, time: 300, variant: 'contained' },
    { text: '+5', count: 5, time: 1000, variant: 'outlined' },
    { text: '+10', count: 10, time: 2000, variant: 'outlined' },
  ];

  const resultRows = results.map((result, i) => (
    <ResultRow
      key={`coc_result_row_${i}`}
      result={result}
      selected={selected === i}
      onClick={() => setSelected(i)}
    />
  ));

  return (
    <PageComponentBase>
      <ButtonGroup className={styles.toolButtons}>
        {buttonProps.map((props) => (
          <DebounceButton
            key={props.text}
            debounceTime={props.time}
            onClick={() => handleClick(props.count)}
            variant={props.variant as 'contained' | 'outlined'}
          >
            {props.text}
          </DebounceButton>
        ))}
      </ButtonGroup>
      <List>{resultRows}</List>
    </PageComponentBase>
  );
}
