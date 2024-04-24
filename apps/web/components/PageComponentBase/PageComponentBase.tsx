import React from 'react';
import Divider from '@mui/material/Divider';
import styles from './PageComponentBase.module.css';

interface MyComponentProps {
  children: React.ReactNode;
}

const MyComponent: React.FC<MyComponentProps> = ({ children }) => {
  const childrenArray = React.Children.toArray(children);

  const childrenWithDividers = childrenArray.reduce<React.ReactNode[]>(
    (acc, child, index) => {
      if (index === 0) {
        return [child];
      } else {
        return [
          ...acc,
          <Divider className={styles.divider} key={`divider-${index}`} />,
          child,
        ];
      }
    },
    []
  );

  return <div>{childrenWithDividers}</div>;
};

export default MyComponent;
