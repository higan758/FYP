import React, { useEffect, useMemo, useRef, useState } from 'react';
import './battle.css';

export default function Sprite({
  spriteSheet,
  animation = 'idle',
  frameWidth = 64,
  frameHeight = 64,
  framesPerRow = 4,
  rowIndex = 0,
  flipX = false,
  scale = 3,
  fps,
  loop,
  shouldAnimate = false,
  playKey = 0,
  onAnimationEnd,
  className = ''
}) {
  const [currentFrame, setCurrentFrame] = useState(0);
  const rafRef = useRef(null);
  const lastTimeRef = useRef(0);

  const animationFps = useMemo(() => {
    if (typeof fps === 'number' && fps > 0) return fps;
    return getAnimationFps(animation);
  }, [animation, fps]);

  const isLooping = useMemo(() => {
    if (typeof loop === 'boolean') return loop;
    return shouldLoop(animation);
  }, [animation, loop]);

  useEffect(() => {
    setCurrentFrame(0);
  }, [animation]);

  useEffect(() => {
    if (!shouldAnimate) {
      setCurrentFrame(0);
      return;
    }

    const frameDuration = 1000 / animationFps;
    let hasEnded = false;

    const tick = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const elapsed = time - lastTimeRef.current;

      if (elapsed >= frameDuration) {
        setCurrentFrame((prevFrame) => {
          const next = prevFrame + 1;
          if (next >= framesPerRow) {
            if (!isLooping && !hasEnded) {
              hasEnded = true;
              if (typeof onAnimationEnd === 'function') {
                onAnimationEnd();
              }
            }
            return isLooping ? 0 : framesPerRow - 1;
          }
          return next;
        });
        lastTimeRef.current = time;
      }

      if (isLooping || !hasEnded) {
        rafRef.current = window.requestAnimationFrame(tick);
      }
    };

    rafRef.current = window.requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        window.cancelAnimationFrame(rafRef.current);
      }
      lastTimeRef.current = 0;
    };
  }, [animationFps, framesPerRow, isLooping, onAnimationEnd, playKey, shouldAnimate]);

  const containerStyle = {
    width: `${frameWidth * scale}px`,
    height: `${frameHeight * scale}px`,
    position: 'relative',
    overflow: 'hidden',
  };

  const spriteStyle = {
    width: `${frameWidth * scale}px`,
    height: `${frameHeight * scale}px`,
    backgroundImage: `url(${spriteSheet})`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: `${-currentFrame * frameWidth * scale}px ${-rowIndex * frameHeight * scale}px`,
    backgroundSize: `${frameWidth * framesPerRow * scale}px auto`,
    imageRendering: 'pixelated',
    transform: flipX ? 'scaleX(-1)' : 'none',
  };

  return (
    <div className={`sprite-container ${className}`} style={containerStyle}>
      <div className="sprite" style={spriteStyle} />
    </div>
  );
}

function getAnimationFps(animation) {
  const fpsByAnimation = {
    idle: 6,
    run: 10,
    attack: 12,
    hit: 10,
    death: 6,
    roll: 12,
  };
  return fpsByAnimation[animation] || 8;
}

function shouldLoop(animation) {
  const loopAnimations = ['idle', 'run'];
  return loopAnimations.includes(animation);
}
