import React, { useState, useEffect, useRef, useCallback } from 'react';
import Sprite from './Sprite';
import HPBar from './HPBar';
import DamageText from './DamageText';
import soundManager from './SoundManager';
import playerSprite from '../../assets/sprites/player.png';
import slimeSprite from '../../assets/sprites/slime_green.png';
import './battle.css';

const BATTLE_STATES = {
  IDLE: 'idle',
  PLAYER_SLASH: 'playerSlash',
  SLIME_ATTACK: 'slimeAttack',
  PLAYER_HIT: 'playerHit',
  SLIME_HIT: 'slimeHit',
  DEATH: 'death',
};

export default function BattleScene({
  playerHP = 100,
  enemyHP = 100,
  battleEvent = null,
  onCorrect,
  onWrong,
  showResult = false,
}) {
  const [battleState, setBattleState] = useState(BATTLE_STATES.IDLE);
  const [hitTarget, setHitTarget] = useState(null);
  const [damageTexts, setDamageTexts] = useState([]);
  const [playerPlayKey, setPlayerPlayKey] = useState(0);
  const [slimePlayKey, setSlimePlayKey] = useState(0);
  const damageIdRef = useRef(0);
  const lastEventIdRef = useRef(null);
  const timeoutsRef = useRef([]);

  const queueTimeout = useCallback((cb, ms) => {
    const id = setTimeout(cb, ms);
    timeoutsRef.current.push(id);
  }, []);

  const clearQueuedTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const addDamageText = useCallback((damage, type, x, y) => {
    const id = damageIdRef.current++;
    const newDamage = {
      id,
      damage,
      type,
      x: x + (Math.random() * 10 - 5),
      y: y + (Math.random() * 10 - 5),
    };

    setDamageTexts(prev => [...prev, newDamage]);

    setTimeout(() => {
      setDamageTexts(prev => prev.filter(d => d.id !== id));
    }, 1500);
  }, []);

  const toIdle = useCallback(() => {
    setHitTarget(null);
    setBattleState(BATTLE_STATES.IDLE);
  }, []);

  useEffect(() => {
    return () => {
      clearQueuedTimeouts();
    };
  }, [clearQueuedTimeouts]);

  useEffect(() => {
    soundManager.playBackgroundMusic();

    return () => {
      soundManager.stopBackgroundMusic();
    };
  }, []);

  useEffect(() => {
    if (enemyHP <= 0 || playerHP <= 0) {
      clearQueuedTimeouts();
      setHitTarget(enemyHP <= 0 ? 'slime' : 'player');
      setBattleState(BATTLE_STATES.DEATH);
      soundManager.stopBackgroundMusic();
      if (enemyHP <= 0) {
        setSlimePlayKey(prev => prev + 1);
        soundManager.playExplosion();
        soundManager.playVictory();
      } else {
        setPlayerPlayKey(prev => prev + 1);
        soundManager.playHurt();
      }
    }
  }, [clearQueuedTimeouts, enemyHP, playerHP]);

  useEffect(() => {
    if (!battleEvent || battleEvent.id === lastEventIdRef.current) return;
    if (enemyHP <= 0 || playerHP <= 0) return;

    clearQueuedTimeouts();

    lastEventIdRef.current = battleEvent.id;

    const damageToEnemy = battleEvent.damageToEnemy || 0;
    const damageToPlayer = battleEvent.damageToPlayer || 0;

    if (battleEvent.correct && damageToEnemy > 0) {
      if (typeof onCorrect === 'function') onCorrect();

      setHitTarget('slime');
      setBattleState(BATTLE_STATES.PLAYER_SLASH);
      setPlayerPlayKey(prev => prev + 1);
      soundManager.playExplosion();

      queueTimeout(() => {
        setBattleState(BATTLE_STATES.SLIME_HIT);
        setSlimePlayKey(prev => prev + 1);
        addDamageText(damageToEnemy, 'enemy', 70, 30);
      }, 350);

      queueTimeout(() => {
        toIdle();
      }, 750);

      return;
    }

    if (!battleEvent.correct && damageToPlayer > 0) {
      if (typeof onWrong === 'function') onWrong();

      setHitTarget('player');
      setBattleState(BATTLE_STATES.SLIME_ATTACK);
      setSlimePlayKey(prev => prev + 1);

      queueTimeout(() => {
        setBattleState(BATTLE_STATES.PLAYER_HIT);
        setPlayerPlayKey(prev => prev + 1);
        soundManager.playHurt();
        addDamageText(damageToPlayer, 'player', 30, 30);
      }, 350);

      queueTimeout(() => {
        toIdle();
      }, 750);
    }
  }, [
    addDamageText,
    battleEvent,
    clearQueuedTimeouts,
    enemyHP,
    onCorrect,
    onWrong,
    playerHP,
    queueTimeout,
    toIdle,
  ]);

  const getPlayerConfig = () => {
    if (battleState === BATTLE_STATES.PLAYER_SLASH) {
      return { animation: 'slash', rowIndex: 7, frames: 6, fps: 12, loop: false, shouldAnimate: true };
    }
    if (battleState === BATTLE_STATES.PLAYER_HIT) {
      return { animation: 'hit', rowIndex: 8, frames: 4, fps: 10, loop: false, shouldAnimate: true };
    }
    if (battleState === BATTLE_STATES.DEATH && hitTarget === 'player') {
      return { animation: 'death', rowIndex: 9, frames: 6, fps: 6, loop: false, shouldAnimate: true };
    }
    return { animation: 'idle', rowIndex: 0, frames: 6, fps: 6, loop: true, shouldAnimate: true };
  };

  const getSlimeConfig = () => {
    if (battleState === BATTLE_STATES.SLIME_ATTACK) {
      return { animation: 'attack', rowIndex: 1, frames: 4, fps: 10, loop: false, shouldAnimate: true };
    }
    if (battleState === BATTLE_STATES.SLIME_HIT) {
      return { animation: 'hit', rowIndex: 2, frames: 4, fps: 10, loop: false, shouldAnimate: true };
    }
    if (battleState === BATTLE_STATES.DEATH && hitTarget === 'slime') {
      return { animation: 'death', rowIndex: 2, frames: 4, fps: 5, loop: false, shouldAnimate: true };
    }
    return { animation: 'idle', rowIndex: 0, frames: 4, fps: 6, loop: true, shouldAnimate: true };
  };

  const playerConfig = getPlayerConfig();
  const slimeConfig = getSlimeConfig();

  const isVictory = enemyHP <= 0;
  const isDefeat = playerHP <= 0;

  return (
    <div className="battle-scene">
      <div className="battle-clouds" aria-hidden="true">
        <span className="cloud cloud-1" />
        <span className="cloud cloud-2" />
        <span className="cloud cloud-3" />
      </div>

      <div className="battle-mountains" aria-hidden="true" />

      <div className="battle-ground" />
      <div className="battle-foreground-grass" aria-hidden="true" />

      <div className="hp-bars-container">
        <HPBar 
          label="PLAYER HP" 
          value={playerHP} 
          max={100} 
          color="#10b981" 
          position="left" 
        />
        <HPBar 
          label="SLIME HP" 
          value={enemyHP} 
          max={100} 
          color="#ef4444" 
          position="right" 
        />
      </div>

      <div className="battle-characters">
        <div className="character-player">
          <Sprite
            spriteSheet={playerSprite}
            animation={playerConfig.animation}
            frameWidth={48}
            frameHeight={48}
            framesPerRow={playerConfig.frames}
            rowIndex={playerConfig.rowIndex}
            fps={playerConfig.fps}
            loop={playerConfig.loop}
            shouldAnimate={playerConfig.shouldAnimate}
            playKey={playerPlayKey}
            scale={3}
          />
        </div>

        <div className="character-enemy">
          <Sprite
            spriteSheet={slimeSprite}
            animation={slimeConfig.animation}
            frameWidth={32}
            frameHeight={24}
            framesPerRow={slimeConfig.frames}
            rowIndex={slimeConfig.rowIndex}
            fps={slimeConfig.fps}
            loop={slimeConfig.loop}
            shouldAnimate={slimeConfig.shouldAnimate}
            playKey={slimePlayKey}
            scale={4}
            flipX={true}
          />
        </div>
      </div>

      {damageTexts.map(dt => (
        <DamageText
          key={dt.id}
          damage={dt.damage}
          type={dt.type}
          x={dt.x}
          y={dt.y}
        />
      ))}

      {showResult && (isVictory || isDefeat) && (
        <div className="battle-overlay">
          <div className={`battle-result ${isVictory ? 'victory' : 'defeat'}`}>
            {isVictory ? 'VICTORY!' : 'DEFEAT!'}
          </div>
        </div>
      )}
    </div>
  );
}
