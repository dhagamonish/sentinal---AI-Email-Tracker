
import React, { useState } from 'react';
import { EmailTracking, TrackingStatus } from '../types';
import EmailCard from './EmailCard';

interface Props {
  emails: EmailTracking[];
  onFollowUp: (email: EmailTracking) => void;
  onReply: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => void;
  onSimulateTime: (id: string) => void;
}

const EmailList: React.FC<Props> = ({ emails, onFollowUp, onReply, onDelete, onSimulateTime }) => {
  const [filter, setFilter] = useState<TrackingStatus | 'ALL'>('ALL');

  const filteredEmails = emails.filter(e => filter === 'ALL' || e.status === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Property Sheet Tabs */}
      <div className="flex gap-[2px] px-2 pt-2 bg-[#c0c0c0]">
        {(['ALL', 'WAITING', 'NEEDS_FOLLOW_UP', 'REPLIED', 'DISCARDED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1 text-[11px] font-bold relative -mb-[2px] z-[1] transition-all ${
              filter === f 
                ? 'bg-[#c0c0c0] border-t-2 border-l-2 border-r-2 border-white !border-b-transparent shadow-[-1px_0_0_#000,1px_0_0_#000] z-[10]' 
                : 'bg-[#b0b0b0] border-t-2 border-l-2 border-r-2 border-white border-b-2 border-b-gray-600'
            }`}
          >
            {f === 'ALL' ? 'General' : f.replace('NEEDS_FOLLOW_UP', 'Alerts').replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <div className="grid grid-cols-1 divide-y divide-gray-200">
          {/* Table Header Look */}
          <div className="flex text-[11px] font-bold bg-[#dfdfdf] border border-gray-400 p-1 mb-2">
            <div className="w-1/3 border-r border-gray-400 px-2">Name</div>
            <div className="w-1/4 border-r border-gray-400 px-2">Status</div>
            <div className="flex-1 px-2">Actions</div>
          </div>
          
          {filteredEmails.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-xs italic">
                (empty folder)
            </div>
          ) : (
            filteredEmails.map(email => (
              <EmailCard 
                key={email.id} 
                email={email} 
                onFollowUp={() => onFollowUp(email)}
                onReply={(content) => onReply(email.id, content)}
                onDelete={() => onDelete(email.id)}
                onSimulate={() => onSimulateTime(email.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailList;
