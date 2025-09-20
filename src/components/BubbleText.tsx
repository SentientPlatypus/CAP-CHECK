import React, { useEffect, useState } from "react";

interface BubbleTextProps {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}

const BubbleText = ({ text, className = "", style }: BubbleTextProps) => {
  const [animatingIndex, setAnimatingIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatingIndex((prev) => (prev + 1) % text.length);
    }, 300); // Change letter every 300ms

    return () => clearInterval(interval);
  }, [text.length]);

  return (
    <h2 className={`font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent ${className}`} style={style}>
      {text.split("").map((char, idx) => (
        <span
          key={idx}
          className={`inline-block transition-all duration-300 ${
            idx === animatingIndex
              ? "animate-bounce text-primary scale-125"
              : ""
          }`}
          style={{
            animationDelay: `${idx * 50}ms`,
          }}
        >
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </h2>
  );
};

export default BubbleText;