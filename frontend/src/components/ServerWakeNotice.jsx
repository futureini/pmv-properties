import React, { useEffect, useState } from 'react';
import { subscribePending } from '../api.js';

// Small banner shown only when a data request has been waiting more than a few
// seconds — i.e. the (free-plan) server is waking up. Disappears by itself.
export default function ServerWakeNotice() {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    let timer = null;
    const unsubscribe = subscribePending((count) => {
      if (count > 0 && !timer) {
        timer = setTimeout(() => setSlow(true), 3500);
      } else if (count === 0) {
        clearTimeout(timer);
        timer = null;
        setSlow(false);
      }
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, []);

  if (!slow) return null;
  return (
    <div
      role="status"
      className="fixed top-0 inset-x-0 z-[60] bg-brand text-white text-xs text-center px-3 py-2 shadow"
    >
      Server is starting up, properties will appear in a few seconds…
      <br />
      சர்வர் தயாராகிறது, சில விநாடிகளில் சொத்துகள் தெரியும்…
    </div>
  );
}
