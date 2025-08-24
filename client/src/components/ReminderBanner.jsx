import React, { useEffect, useState } from "react";

export default function ReminderBanner({ hasWalkToday }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const hours = now.getHours();
      setShow(hours >= 18 && !hasWalkToday);
    };
    check();
    const id = setInterval(check, 60 * 1000); // re-check every minute
    return () => clearInterval(id);
  }, [hasWalkToday]);

  if (!show) return null;
  return (
    <div className="banner" role="alert">
      <strong>Reminder:</strong> Rex still needs exercise today!
    </div>
  );
}
