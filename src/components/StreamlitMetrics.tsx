import React from 'react';
import { TrendingUp, CheckCircle, Hand } from 'lucide-react';

interface StreamlitMetricProps {
  label: string;
  value: string | number;
  delta?: string;
  deltaColor?: 'normal' | 'inverse' | 'off';
  icon?: React.ReactNode;
}

export const StreamlitMetric: React.FC<StreamlitMetricProps> = ({
  label,
  value,
  delta,
  deltaColor = 'normal',
  icon,
}) => {
  return (
    <div className="bg-[#262730] border border-[#31333f] rounded-lg p-3.5 space-y-1 transition-all hover:border-[#808495]/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-[#808495] truncate">{label}</span>
        {icon && <span className="text-[#808495]">{icon}</span>}
      </div>

      <div className="text-2xl font-bold tracking-tight text-[#fafafa] font-mono truncate">
        {value}
      </div>

      {delta && (
        <div className="flex items-center gap-1 text-[11px] font-medium text-[#09ab3b] pt-0.5">
          <TrendingUp className="w-3 h-3" />
          <span>{delta}</span>
        </div>
      )}
    </div>
  );
};
