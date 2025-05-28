import React, { useEffect, useState } from "react";
import "./ComingSoon.css";
import AppHeader from "../../components/Header/Header";

const ComingSoon: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 10,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const targetDate = new Date("2024-12-31T00:00:00"); // Set the target launch date
    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        return;
      }

      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval); // Clean up on component unmount
  }, []);

  return (
    <>
      <div className="coming-soon-page">
        <div className="overlay">
          <div className="content">
            <h1 className="title">Coming Soon</h1>
            <p className="description">
              We are working hard to bring something amazing. Stay tuned!
            </p>
            <div className="countdown">
              <span>Launching in:</span>
              <div className="countdown-time">
                <p>{timeLeft.hours}</p>:<p>{timeLeft.minutes}</p>:
                <p>{timeLeft.seconds}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComingSoon;
