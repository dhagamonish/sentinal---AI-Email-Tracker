
import React, { useState } from 'react';
import { EmailTracking } from '../types';

interface Props {
  email: EmailTracking;
  isSelected: boolean;
  onToggleSelect: () => void;
  onFollowUp: () => void;
  onReply: (content: string) => Promise<void>;
  onDelete: () => void;
  onSimulate: () => void;
}

const EmailCard: React.FC<Props> = ({ email, isSelected, onToggleSelect, onFollowUp, onReply, onDelete, onSimulate }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const statusTags = {
    WAITING: { label: 'Waiting', color: 'text-blue-800' },
    NEEDS_FOLLOW_UP: { label: 'ALERT: ACTION', color: 'text-red-700 font-bold' },
    REPLIED: { label: 'Replied', color: 'text-green-700' },
    DISCARDED: { label: 'Closed', color: 'text-gray-500 italic' },
  };

  const handleCommitReply = async () => {
    if (!replyInput.trim()) return;
    setIsSaving(true);
    try {
      await onReply(replyInput);
      setIsReplying(false);
      setReplyInput('');
    } catch (err) {
      console.error("Failed to log reply:", err);
      alert("System error logging reply. Check connection.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={`p-1 group border-b border-gray-100 text-[12px] transition-colors ${isSelected ? 'bg-[#000080] text-white' : 'hover:bg-[#dfdfdf]'}`}>
      <div className="flex items-center justify-between">
        <div className="w-8 flex justify-center cursor-pointer" onClick={(e) => {
          e.stopPropagation();
          onToggleSelect();
        }}>
          <input 
            type="checkbox" 
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className="w-3 h-3 cursor-pointer"
          />
        </div>
        <div className="w-1/3 flex items-center gap-2 overflow-hidden px-1">
           <i className={`fas fa-user-circle ${isSelected ? 'text-white' : 'text-gray-400'}`}></i>
           <span className="truncate font-medium">{email.recipientName}</span>
        </div>
        <div className="w-1/4 px-1">
           <span className={`${isSelected ? 'text-white' : statusTags[email.status].color} text-[11px]`}>
              {statusTags[email.status].label} {email.followUpCount > 0 && email.status !== 'REPLIED' ? `(F/U: ${email.followUpCount})` : ''}
           </span>
        </div>
        <div className="flex-1 flex justify-end gap-1 px-1">
            {email.status === 'NEEDS_FOLLOW_UP' && (
                <button onClick={onFollowUp} className="win95-button !text-[10px] !py-0 !px-1 group-hover:!text-black font-bold">FollowUp</button>
            )}
            <button onClick={() => setIsReplying(!isReplying)} className="win95-button !text-[10px] !py-0 !px-1 group-hover:!text-black">Log</button>
            <button onClick={() => setShowHistory(!showHistory)} className="win95-button !text-[10px] !py-0 !px-1 group-hover:!text-black">History</button>
            <button onClick={onDelete} className="win95-button !text-[10px] !py-0 !px-1 group-hover:!text-black text-red-700 font-bold">Del</button>
        </div>
      </div>

      {isReplying && (
        <div className="mt-2 win95-outset p-3 text-black ml-8 shadow-md">
           <div className="win95-titlebar !bg-[#808080] mb-2">
              <span className="text-[11px]">Record Manual Entry</span>
           </div>
           <textarea 
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              className="win95-inset w-full h-20 p-2 text-[11px] outline-none font-mono"
              placeholder="Paste raw reply content or notes here..."
              disabled={isSaving}
           />
           <div className="flex justify-end mt-2 gap-2">
              <button onClick={() => setIsReplying(false)} disabled={isSaving} className="win95-button !text-[11px]">Cancel</button>
              <button 
                onClick={handleCommitReply} 
                disabled={isSaving}
                className="win95-button font-bold min-w-[80px] !text-[11px]"
              >
                {isSaving ? 'Processing...' : 'Save Log'}
              </button>
           </div>
        </div>
      )}

      {showHistory && (
        <div className="mt-2 bg-[#dfdfdf] border-2 border-gray-400 p-2 text-black font-mono text-[10px] ml-8 shadow-inner">
           <div className="font-bold border-b border-gray-400 mb-2 pb-1 flex items-center gap-2">
              <i className="fas fa-history"></i>
              <span>TRANSACTION LOG: {email.recipientEmail}</span>
           </div>
           <div className="max-h-48 overflow-y-auto pr-1">
             {email.history.length === 0 ? (
               <div className="italic text-gray-500 py-1">No history recorded.</div>
             ) : (
               email.history.slice().reverse().map(h => (
                  <div key={h.id} className="mb-3 last:mb-0 border-l-2 border-gray-300 pl-2 ml-1">
                     <div className="flex justify-between items-start mb-1">
                        <span className="bg-gray-700 text-white px-1 text-[9px] uppercase font-bold">
                           {h.type}
                        </span>
                        <span className="text-gray-600 text-[9px]">
                           {new Date(h.date).toLocaleString()}
                        </span>
                     </div>
                     <div className="bg-white p-1 border border-gray-200 break-words line-clamp-3">
                        {h.content}
                     </div>
                  </div>
               ))
             )}
           </div>
        </div>
      )}
    </div>
  );
};

export default EmailCard;
