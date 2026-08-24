"use client";

import { Team } from "@/types";

interface MetricBarProps {
  label: string;
  awayTeam: Team;
  homeTeam: Team;
  awayValue: number;
  homeValue: number;
  awaySecondary: string;
  homeSecondary: string;
  awayColor: string;
  homeColor: string;
  maxValue?: number;
  isPercentile?: boolean;
}

export function MetricBar({
  label,
  awayTeam,
  homeTeam,
  awayValue,
  homeValue,
  awaySecondary,
  homeSecondary,
  awayColor,
  homeColor,
  maxValue = 100,
  isPercentile = false,
}: MetricBarProps) {
  const awayPercent = Math.min((awayValue / maxValue) * 100, 100);
  const homePercent = Math.min((homeValue / maxValue) * 100, 100);

  return (
    <div className="bg-white border-4 border-bauhaus-black p-4 shadow-geo-md">
      {label && (
        <p className="text-xs font-black text-bauhaus-black mb-3 uppercase tracking-wider">
          {label}
        </p>
      )}

      {/* Away Team Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-bauhaus-black uppercase">
            {awayTeam.abbr}
          </span>
          <span className="text-sm font-black text-bauhaus-black">
            {isPercentile ? `${awayValue.toFixed(0)}th` : awayValue.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-bauhaus-muted border-2 border-bauhaus-black h-3 overflow-hidden">
          <div
            className="h-full transition-all border-r-2 border-bauhaus-black"
            style={{
              backgroundColor: awayColor,
              width: `${awayPercent}%`,
              opacity: 1,
            }}
          />
        </div>
        <div className="text-xs text-bauhaus-black font-bold mt-1">
          {awaySecondary}
        </div>
      </div>

      {/* Home Team Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-black text-bauhaus-black uppercase">
            {homeTeam.abbr}
          </span>
          <span className="text-sm font-black text-bauhaus-black">
            {isPercentile ? `${homeValue.toFixed(0)}th` : homeValue.toFixed(2)}
          </span>
        </div>
        <div className="w-full bg-bauhaus-muted border-2 border-bauhaus-black h-3 overflow-hidden">
          <div
            className="h-full transition-all border-r-2 border-bauhaus-black"
            style={{
              backgroundColor: homeColor,
              width: `${homePercent}%`,
              opacity: 1,
            }}
          />
        </div>
        <div className="text-xs text-bauhaus-black font-bold mt-1">
          {homeSecondary}
        </div>
      </div>
    </div>
  );
}
