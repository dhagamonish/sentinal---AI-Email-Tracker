
import React, { useState, useEffect } from 'react';
import { FollowUpItem } from '../types';
import { generateFollowUpDraft } from '../services/geminiService';

interface Props {
  item: FollowUpItem;
  onClose: () => void;
  onComplete: () => void;
}

const FollowUpWizard: React.FC<Props> = ({ item, onClose, onComplete }) => {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await generateFollowUpDraft(item);
      setDraft(res);
      setLoading(false);
    })();
  }, [item]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="win95-outset w-full max-w-lg">
        <div className="win95-titlebar">
          <span>AI Follow-Up Assistant</span>
          <button onClick={onClose} className="win95-close">x</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-4 border-b border-gray-400 pb-4">
             <div className="text-3xl">✉️</div>
             <div>
               <div className="text-xs text-gray-600 uppercase">Recipient</div>
               <div className="font-bold">{item.recipientName}</div>
             </div>
          </div>

          {loading ? (
            <div className="py-10 text-center">
              <div className="text-sm animate-pulse">AI is drafting a reply...</div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <label className="text-[11px] font-bold">Suggested Draft:</label>
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="win95-inset w-full h-40 p-3 text-sm outline-none font-mono"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-[10px] text-gray-500 italic max-w-[200px]">
                  Copy this to Gmail and send. Then click "Done" to clear from list.
                </p>
                <div className="flex gap-2">
                  <button onClick={onClose} className="win95-button w-24">Cancel</button>
                  <button onClick={onComplete} className="win95-button font-bold w-24">Done</button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowUpWizard;
