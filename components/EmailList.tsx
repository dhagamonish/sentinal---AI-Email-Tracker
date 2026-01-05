
import React, { useState, useMemo } from 'react';
import { EmailTracking, TrackingStatus } from '../types';

interface Props {
  emails: EmailTracking[];
  onFollowUp: (email: EmailTracking) => void;
  onReply: (id: string, content: string) => Promise<void>;
  onDelete: (id: string) => void;
  onSimulateTime: (id: string) => void;
}

const EmailList: React.FC<Props> = ({ emails, onFollowUp, onDelete }) => {
  const [filter, setFilter] = useState<TrackingStatus | 'ALL'>('ALL');

  const filteredEmails = useMemo(() => 
    emails.filter(e => filter === 'ALL' || e.status === filter),
    [emails, filter]
  );

  const formatTimeAgo = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Property Sheet Tabs */}
      <div className="flex gap-[2px] px-2 pt-2 bg-[#c0c0c0] shrink-0">
        {(['ALL', 'WAITING', 'NEEDS_FOLLOW_UP', 'REPLIED', 'DISCARDED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1 text-[11px] font-bold relative -mb-[2px] z-[1] transition-all border-t-2 border-l-2 border-r-2 border-white ${
              filter === f 
                ? 'bg-[#c0c0c0] z-[10] border-b-transparent shadow-[1px_0_0_#404040]' 
                : 'bg-[#b0b0b0] border-b-2 border-b-white translate-y-[2px] opacity-80'
            }`}
          >
            {f === 'ALL' ? 'General' : f === 'NEEDS_FOLLOW_UP' ? 'Alerts' : f}
          </button>
        ))}
      </div>

      {/* Table Container */}
      <div className="flex-grow flex flex-col overflow-hidden bg-white win95-inset p-[1px] relative">
        <div className="flex text-[11px] font-bold bg-[#dfdfdf] border-b border-gray-400 p-1 sticky top-0 z-[10] shrink-0">
          <div className="w-1/4 border-r border-gray-400 px-3 py-1">Name</div>
          <div className="w-1/4 border-r border-gray-400 px-3 py-1 text-center">Time Sent</div>
          <div className="w-1/4 border-r border-gray-400 px-3 py-1">Status</div>
          <div className="flex-1 px-3 py-1">Actions</div>
        </div>
        
        {/* Only this part will scroll */}
        <div className="flex-grow overflow-y-auto bg-white scrollbar-gutter-stable min-h-0">
          {filteredEmails.length === 0 ? (
            <div className="h-full min-h-[100px] flex items-center justify-center text-gray-400 text-xs italic">
                (empty folder)
            </div>
          ) : (
            <div className="flex flex-col">
              {filteredEmails.map(email => (
                <div key={email.id} className="flex items-center text-[12px] p-2 border-b border-gray-50 hover:bg-[#000080] hover:text-white group">
                  <div className="w-1/4 px-2 font-medium truncate">{email.recipientName}</div>
                  <div className="w-1/4 px-2 text-[11px] text-center font-mono opacity-80">
                    {formatTimeAgo(email.lastActivityAt)}
                  </div>
                  <div className="w-1/4 px-2 text-[11px]">
                    <span className={`px-2 py-[1px] border ${email.status === 'NEEDS_FOLLOW_UP' ? 'bg-red-700 text-white border-red-900 animate-pulse' : 'border-transparent'}`}>
                      {email.status}
                    </span>
                  </div>
                  <div className="flex-1 px-2 flex gap-1 justify-end">
                    {email.status === 'NEEDS_FOLLOW_UP' && (
                      <button 
                        onClick={() => onFollowUp(email)}
                        className="win95-button !py-0 !px-2 !text-[10px] group-hover:!text-black font-bold"
                      >
                        Follow-Up
                      </button>
                    )}
                    <button 
                      onClick={() => onDelete(email.id)}
                      className="win95-button !py-0 !px-2 !text-[10px] group-hover:!text-black text-red-800"
                    >
                      Del
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EmailList;
