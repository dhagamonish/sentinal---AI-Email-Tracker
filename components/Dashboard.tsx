
import React from 'react';
import { DashboardStats } from '../types';

interface Props {
  stats: DashboardStats;
  total: number;
}

const Dashboard: React.FC<Props> = ({ stats, total }) => {
  const cards = [
    { label: 'Tracking', value: stats.active, icon: 'fa-hourglass-start', color: 'text-blue-800' },
    { label: 'FollowUp', value: stats.followupsNeeded, icon: 'fa-bell', color: 'text-red-800' },
    { label: 'Replied', value: stats.replied, icon: 'fa-envelope-open', color: 'text-green-800' },
    { label: 'Discard', value: stats.discarded, icon: 'fa-trash', color: 'text-gray-800' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {cards.map((card, idx) => (
        <div key={idx} className="win95-outset p-3">
          <div className="flex items-center gap-2 text-[11px] font-bold text-gray-700 uppercase mb-1">
            <i className={`fas ${card.icon} ${card.color}`}></i>
            <span>{card.label}</span>
          </div>
          <div className="win95-inset bg-black p-1 text-center">
            <span className="text-2xl font-mono text-green-500 tracking-widest">
              {card.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
