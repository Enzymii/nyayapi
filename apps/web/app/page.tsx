'use client';

import { useState } from 'react';
import { Button, Header } from 'ui';

export default function Page() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Header text="Web Here" />
      <Button onClick={() => setCount(count + 1)} />
      { count }
    </>
  );
}
