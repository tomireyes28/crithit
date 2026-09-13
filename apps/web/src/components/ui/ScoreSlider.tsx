'use client';

import React, { useState } from 'react';
import { getScoreColorInfo } from '@crithit/shared';

interface ScoreSliderProps {
  initialValue?: number;
  onChange?: (value: number) => void;
  disabled?: boolean;
}

export const ScoreSlider: React.FC<ScoreSliderProps> = ({
  initialValue = 85,
  onChange,
  disabled = false,
}) => {
  const [score, setScore] = useState<number>(initialValue);
  const info = getScoreColorInfo(score);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    setScore(val);
    onChange?.(val);
  };

  const setPreset = (val: number) => {
    setScore(val);
    onChange?.(val);
  };

  return (
    <div className="w-full bg-brand-card border border-brand-border/60 rounded-2xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-brand-muted font-bold block mb-1">
            Puntuación CritHit
          </span>
          <h4 className="text-xl font-bold text-brand-text flex items-center gap-2">
            Tu Calificación:
            <span
              className="text-2xl font-black font-mono transition-colors duration-200"
              style={{ color: info.colorHex }}
            >
              {score}/100
            </span>
          </h4>
        </div>

        <div
          className="font-mono font-black text-2xl h-14 px-5 rounded-xl border flex items-center justify-center transition-all duration-300 shadow-lg"
          style={{
            backgroundColor: `${info.colorHex}20`,
            borderColor: `${info.colorHex}80`,
            color: info.colorHex,
            boxShadow: `0 0 20px -5px ${info.colorHex}40`,
          }}
        >
          {score}
        </div>
      </div>

      {/* Progress Bar & Slider Input */}
      <div className="space-y-2">
        <div className="relative h-3 bg-brand-surface rounded-full overflow-hidden border border-brand-border">
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${score}%`,
              backgroundColor: info.colorHex,
              boxShadow: `0 0 12px ${info.colorHex}`,
            }}
          />
        </div>

        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={score}
          onChange={handleSliderChange}
          disabled={disabled}
          className="w-full cursor-pointer appearance-none bg-transparent focus:outline-none disabled:opacity-50"
          style={{ accentColor: info.colorHex }}
        />
      </div>

      {/* Rating Label and Scale Indicator */}
      <div className="flex items-center justify-between text-xs text-brand-muted">
        <span className="text-rose-400 font-medium">0 - Terrible</span>
        <span
          className="font-bold text-sm tracking-wide transition-colors duration-200 px-3 py-1 rounded-full border"
          style={{
            color: info.colorHex,
            borderColor: `${info.colorHex}40`,
            backgroundColor: `${info.colorHex}15`,
          }}
        >
          {info.label}
        </span>
        <span className="text-emerald-400 font-medium">100 - Imprescindible</span>
      </div>

      {/* Quick Presets */}
      <div className="pt-2 border-t border-brand-border/40 flex items-center justify-between gap-1 overflow-x-auto text-xs">
        {[
          { label: '25', val: 25 },
          { label: '50', val: 50 },
          { label: '70', val: 70 },
          { label: '80', val: 80 },
          { label: '90', val: 90 },
          { label: '95', val: 95 },
          { label: '100', val: 100 },
        ].map((item) => (
          <button
            key={item.val}
            type="button"
            onClick={() => setPreset(item.val)}
            className={`px-3 py-1 rounded-md font-mono font-medium transition-all ${
              score === item.val
                ? 'bg-brand-primary text-white font-bold'
                : 'text-brand-muted hover:text-brand-text hover:bg-brand-surface'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};
