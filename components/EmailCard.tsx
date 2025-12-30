
import React, { useState } from 'react';
import { EmailTracking } from '../types';

interface Props {
  email: EmailTracking;
  onFollowUp: () => void;
  onReply: (content: string) => Promise<void>;
  onDelete: () => void;
  onSimulate: () => void;
}

const EmailCard: React.FC<Props> = ({ email, onFollowUp, onReply, onDelete, onSimulate }) => {
  const [showHistory, setShowHistory] = useState(false);
  const [replyInput, setReplyInput] = useState('');
  const [isReplying, setIsReplying] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const statusTags = {
    WAITING: { label: 'Waiting...', color: 'text-blue-700' },
    NEEDS_FOLLOW_UP: { label: 'ACTION NEEDED', color: 'text-red-600 font-bold' },
    REPLIED: { label: 'Replied!', color: 'text-green-600' },
    DISCARDED: { label: 'Closed', color: 'text-gray-500' },
  };

  const handleCommitReply = async () => {
    if (!replyInput.trim()) return;
    setIsAnalyzing(true);
    try {
      await onReply(replyInput);
      setIsReplying(false);
      setReplyInput('');
    } catch (err) {
      console.error("Failed to log reply:", err);
      alert("System error logging reply. Check connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className={`p-2 hover:bg-[#000080] hover:text-white group border-b border-gray-100 text-[12px] transition-colors`}>
      <div className="flex items-center justify-between">
        <div className="w-1/3 flex items-center gap-2 overflow-hidden">
          <i className="fas fa-file-alt opacity-50"></i>
          <span className="truncate">{email.recipientName}</span>
        </div>
        <div className="w-1/4">
          <span className={`${statusTags[email.status].color} group-hover:text-white`}>
            {statusTags[email.status].label} {email.followUpCount > 0 ? `(${email.followUpCount})` : ''}
          </span>
        </div>
        <div className="flex-1 flex justify-end gap-1">
          {email.status === 'NEEDS_FOLLOW_UP' ? (
            <button onClick={onFollowUp} className="win95-button !bg-red-200 font-bold !text-[10px] !py-0.5 group-hover:!text-black">Write Follow-up</button>
          ) : email.status === 'WAITING' ? (
            <button onClick={onSimulate} className="win95-button !text-[10px] !py-0.5 opacity-50 hover:opacity-100 group-hover:!text-black">Wait 24h</button>
          ) : null}
          <button onClick={() => setShowHistory(!showHistory)} className="win95-button !text-[10px] !py-0.5 group-hover:!text-black">History</button>
          <button onClick={onDelete} className="win95-button !text-[10px] !py-0.5 text-red-700 group-hover:!text-red-500">Delete</button>
        </div>
      </div>

      {isReplying && (
        <div className="mt-2 win95-outset p-2 text-black">
          <div className="win95-titlebar !bg-gray-500 mb-2">
            <span>Log Received Data</span>
          </div>
          <textarea
            value={replyInput}
            onChange={(e) => setReplyInput(e.target.value)}
            className="win95-inset w-full h-16 p-1 text-[11px] outline-none"
            placeholder="Paste raw email text..."
            disabled={isAnalyzing}
          />
          <div className="flex justify-end mt-2 gap-2">
            <button onClick={() => setIsReplying(false)} disabled={isAnalyzing} className="win95-button">Cancel</button>
            <button
              onClick={handleCommitReply}
              disabled={isAnalyzing}
              className="win95-button font-bold min-w-[80px]"
            >
              {isAnalyzing ? 'Analyzing...' : 'Commit'}
            </button>
          </div>
        </div>
      )}

      {showHistory && (
        <div className="mt-2 bg-[#dfdfdf] border-2 border-gray-400 p-2 text-black font-mono text-[10px]">
          <div className="font-bold border-b border-gray-400 mb-2 pb-1">-- ACTIVITY LOG: {email.recipientEmail} --</div>
          {email.history.map(h => (
            <div key={h.id} className="mb-2">
              <div className="flex justify-between border-b border-dotted border-gray-400 mb-1">
                <span>
                  <span className="text-blue-800">[{new Date(h.date).toLocaleDateString()}]</span>
                  <span className="uppercase font-bold"> {h.type}:</span>
                </span>
                {h.sentiment && (
                  <span className={`font-bold px-1 ${h.sentiment.toLowerCase().includes('interested') && !h.sentiment.toLowerCase().includes('not')
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-400 text-black'
                    }`}>
                    AI: {h.sentiment}
                  </span>
                )}
              </div>
              <div className="pl-2 mb-1">{h.content.substring(0, 200)}{h.content.length > 200 ? '...' : ''}</div>
              {h.summary && (
                <div className="bg-white border-l-4 border-indigo-600 p-1 italic text-[9px]">
                  AI Summary: {h.summary}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmailCard;
