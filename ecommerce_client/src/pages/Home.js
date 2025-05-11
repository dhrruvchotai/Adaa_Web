import homeImg from './homeImg.jpg';
import { useNavigate } from 'react-router-dom';
import React from 'react';
import { useSprings, animated } from '@react-spring/web';
import { useEffect, useRef, useState } from 'react';
import './Home.css';

const SplitText = ({
  text = '',
  className = '',
  delay = 100,
  animationFrom = { opacity: 0, transform: 'translate3d(0,40px,0)' },
  animationTo = { opacity: 1, transform: 'translate3d(0,0,0)' },
  easing = 'easeOutCubic',
  threshold = 0.1,
  rootMargin = '-100px',
  textAlign = 'center',
  onLetterAnimationComplete,
}) => {
  const words = text.split(' ').map(word => word.split(''));
  const letters = words.flat();
  const [inView, setInView] = useState(false);
  const ref = useRef();
  const animatedCount = useRef(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const springs = useSprings(
    letters.length,
    letters.map((_, i) => ({
      from: animationFrom,
      to: inView
        ? async (next) => {
            await next(animationTo);
            animatedCount.current += 1;
            if (animatedCount.current === letters.length && onLetterAnimationComplete) {
              onLetterAnimationComplete();
            }
          }
        : animationFrom,
      delay: i * delay,
      config: { easing },
    }))
  );

  return (
    <p
      ref={ref}
      className={`split-parent ${className}`}
      style={{ textAlign, overflow: 'hidden', display: 'inline', whiteSpace: 'normal', wordWrap: 'break-word' }}
    >
      {words.map((word, wordIndex) => (
        <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
          {word.map((letter, letterIndex) => {
            const index = words
              .slice(0, wordIndex)
              .reduce((acc, w) => acc + w.length, 0) + letterIndex;
            return (
              <animated.span
                key={index}
                style={{
                  ...springs[index],
                  display: 'inline-block',
                  willChange: 'transform, opacity',
                }}
              >
                {letter}
              </animated.span>
            );
          })}
          <span style={{ display: 'inline-block', width: '0.3em' }}>&nbsp;</span>
        </span>
      ))}
    </p>
  );
};

function Home() {
    const navigate = useNavigate();

    return (
        <div
            className="home-container"
            style={{
                backgroundImage: `url(${homeImg})`,
                backgroundRepeat: "no-repeat",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                width: "100vw",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "flex-start",
                padding: "0 5%",
            }}
        >
            <div className="home-heading" style={{ fontSize: "40px", marginBottom: "20px" }}>
                <SplitText text="Get into the World of Shopping" />
            </div>
            {/* Remove SplitText for "Best Online Store" */}
            <div className="home-subheading" style={{ fontSize: "70px", marginBottom: "40px" }}>
                Best Online Store
            </div>
            {/* Button without animation */}
            <button
                className="home-button"
                onClick={() => navigate('./auth/login')}
            >
                Let's Go
            </button>
        </div>
    );
}

export default Home;