import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';

interface DebounceProps extends React.ComponentProps<typeof LoadingButton> {
  debounceTime: number;
}

export default function DebounceButton({
  debounceTime,
  ...attrs
}: DebounceProps) {
  const [debounce, setDebounce] = useState(false);

  const handleClick = async (e) => {
    setDebounce(true);
    attrs.onClick(e);
    await new Promise((resolve) => setTimeout(resolve, debounceTime));
    setDebounce(false);
  };

  return (
    <LoadingButton
      {...attrs}
      loading={debounce}
      disabled={debounce}
      onClick={handleClick}
    >
      {attrs.children}
    </LoadingButton>
  );
}
