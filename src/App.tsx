import React, { useEffect, useState, useRef } from 'react';
import Phaser from 'phaser';
import { GameScene } from './game/GameScene';
import { Volume2, VolumeX, Trophy, Play, RotateCcw, Swords } from 'lucide-react';
import { SoundManager } from './game/SoundManager';

const Game: React.FC = () => {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'gameover'>('menu');
  const [winner, setWinner] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('mortal-kombat-muted') === 'true';
  });

  useEffect(() => {
    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'game-container',
      width: 1024,
      height: 576,
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 1500 },
          debug: false,
        },
      },
      scene: [GameScene],
      pixelArt: true,
      backgroundColor: '#000000',
    };

    gameRef.current = new Phaser.Game(config);

    const handleGameOver = (event: any) => {
      setWinner(event.detail.winner);
      setGameState('gameover');
    };

    window.addEventListener('gameover', handleGameOver);

    return () => {
      gameRef.current?.destroy(true);
      window.removeEventListener('gameover', handleGameOver);
    };
  }, []);

  useEffect(() => {
    SoundManager.setMute(isMuted);
    localStorage.setItem('mortal-kombat-muted', String(isMuted));
  }, [isMuted]);

  const startGame = () => {
    setGameState('playing');
    gameRef.current?.events.emit('start-game');
    SoundManager.playMusic();
  };

  const restartGame = () => {
    setGameState('playing');
    gameRef.current?.events.emit('restart-game');
  };

  const toggleMute = () => setIsMuted(!isMuted);

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-[#050505] overflow-hidden font-sans">
      <div id="game-container" className="shadow-[0_0_50px_rgba(255,0,0,0.3)] border-b-8 border-red-900" />

      {/* UI Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center">
        
        {/* Start Menu */}
        {gameState === 'menu' && (
          <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center pointer-events-auto z-10 p-4">
            <div className="flex flex-col items-center animate-in zoom-in duration-700">
              <div className="flex items-center gap-4 mb-2">
                <div className="h-1 w-24 bg-red-600"></div>
                <Swords size={48} className="text-red-600" />
                <div className="h-1 w-24 bg-red-600"></div>
              </div>
              <h1 className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-900 italic tracking-tighter mb-2 drop-shadow-[0_4px_4px_rgba(255,255,255,0.1)]">
                MORTA KOMBAT
              </h1>
              <p className="text-white/40 text-sm tracking-[1em] mb-12 uppercase">Ultimate React Edition</p>
            </div>

            <button
              onClick={startGame}
              className="group relative flex items-center gap-6 bg-gradient-to-r from-red-800 to-red-600 hover:from-red-700 hover:to-red-500 text-white px-16 py-6 rounded-none text-4xl font-black transition-all hover:scale-110 active:scale-95 border-l-4 border-r-4 border-white/20"
            >
              <Play fill="white" size={32} />
              BEGIN FIGHT
            </button>

            <div className="mt-16 text-gray-400 grid grid-cols-1 md:grid-cols-2 gap-12 text-xs uppercase tracking-[0.2em] bg-white/5 p-8 rounded-lg backdrop-blur-sm border border-white/10">
              <div className="flex flex-col gap-2">
                <p className="text-red-500 font-black mb-1 text-lg">Player 1 (Human)</p>
                <p>Move: WASD</p>
                <p>Punch: F</p>
                <p>Kick: G</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-blue-500 font-black mb-1 text-lg">Player 2 (AI/Human)</p>
                <p>Move: Arrows</p>
                <p>Punch: K</p>
                <p>Kick: L</p>
              </div>
            </div>
          </div>
        )}

        {/* Game Over Screen */}
        {gameState === 'gameover' && (
          <div className="absolute inset-0 bg-black/95 flex flex-col items-center justify-center pointer-events-auto z-20">
            <div className="relative mb-8 animate-bounce">
                <Trophy className="text-yellow-500" size={120} />
                <div className="absolute -inset-4 bg-yellow-500/20 blur-2xl rounded-full -z-10"></div>
            </div>
            
            <h2 className="text-7xl font-black text-white mb-2 uppercase italic tracking-tighter text-center">
              {winner === 'Draw' ? 'NO ONE SURVIVED' : `${winner} WINS`}
            </h2>
            
            <p className="text-red-600 text-4xl font-black mb-16 animate-pulse tracking-[0.5em] uppercase">
              FATALITY
            </p>

            <button
              onClick={restartGame}
              className="group flex items-center gap-4 bg-white text-black px-16 py-5 rounded-none text-2xl font-black hover:bg-red-600 hover:text-white transition-all transform hover:-rotate-1"
            >
              <RotateCcw size={32} className="group-hover:rotate-180 transition-transform duration-500" />
              REMATCH
            </button>
          </div>
        )}

        {/* Mute Toggle */}
        <div className="fixed top-4 right-4 pointer-events-auto z-50">
          <button
            onClick={toggleMute}
            className="p-4 bg-black/60 hover:bg-red-900/40 text-white rounded-none border border-white/20 transition-all backdrop-blur-md"
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Game;