
import React from 'react';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats;
  total: number;
}

const Dashboard: React.FC<Props> = ({ stats }) => {
  const cards = [
    { label: 'TRACKING', value: stats.active, icon: 'fa-hourglass-start', color: 'text-blue-800' },
    { label: 'FOLLOWUP', value: stats.followupsNeeded, icon: 'fa-bell', color: 'text-red-800' },
    { label: 'REPLIED', value: stats.replied, icon: 'fa-envelope-open', color: 'text-green-800' },
    { label: 'DISCARD', value: stats.discarded, icon: 'fa-trash', color: 'text-gray-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <div key={idx} className="win95-outset p-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#000080] mb-2 px-1">
            <i className={`fas ${card.icon}`}></i>
            <span className="tracking-wider uppercase">{card.label}</span>
          </div>
          <div className="win95-inset bg-black p-3 h-14 flex items-center justify-center">
             <span className="text-2xl font-mono text-[#00ff00] leading-none tracking-widest drop-shadow-[0_0_2px_rgba(0,255,0,0.5)]">
                {String(card.value)}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
