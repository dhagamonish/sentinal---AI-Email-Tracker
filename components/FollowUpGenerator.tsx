
import React, { useState, useEffect } from 'react';
import { EmailTracking } from '../types';
import { generateFollowUpDraft } from '../services/geminiService';

interface Props {
  email: EmailTracking;
  onClose: () => void;
  onSend: (id: string, content: string) => void;
}

const FollowUpGenerator: React.FC<Props> = ({ email, onClose, onSend }) => {
  const [draft, setDraft] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const generateDraft = async () => {
    setIsLoading(true);
    setError('');
    try {
      const result = await generateFollowUpDraft(email);
      setDraft(result);
    } catch (err) {
      setError('System Error: Unable to fetch draft.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    generateDraft();
  }, [email]);

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose}></div>
      <div className="relative win95-outset w-full max-w-xl">
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <i className="fas fa-magic text-[10px]"></i>
            <span>Follow-up Wizard - [Step 1 of 1]</span>
          </div>
          <button onClick={onClose} className="win95-close">x</button>
        </div>

        <div className="bg-[#dfdfdf] p-6 border-b border-gray-400 flex gap-4">
           <div className="w-16 h-16 bg-white border-2 border-gray-600 flex items-center justify-center text-3xl">
              🚀
           </div>
           <div>
              <h3 className="font-bold">Follow-up Generator</h3>
              <p className="text-[11px]">Preparing Follow-up #{email.followUpCount + 1} for lead <b>{email.recipientName}</b>.</p>
           </div>
        </div>

        <div className="p-4">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
               <div className="w-full win95-inset h-4 bg-gray-300 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[#000080] animate-[shimmer_2s_infinite]" style={{ width: '40%' }}></div>
               </div>
               <span className="text-xs font-bold animate-pulse">Consulting AI Knowledge Base...</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold mb-1">Suggested Message Body:</label>
                <textarea 
                  value={draft}
                  onChange={e => setDraft(e.target.value)}
                  className="win95-inset w-full h-48 p-2 text-[12px] outline-none font-mono"
                ></textarea>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button onClick={generateDraft} className="win95-button text-xs underline">Regenerate</button>
                <div className="flex gap-2">
                  <button onClick={onClose} className="win95-button w-24">Cancel</button>
                  <button 
                    onClick={() => onSend(email.id, draft)}
                    className="win95-button font-bold w-24"
                  >
                    Finish
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#c0c0c0] p-1 border-t border-gray-500 text-[9px] px-2 italic text-gray-600">
           CAUTION: After 3 follow-ups, lead will be purged from active records.
        </div>
      </div>
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
      `}</style>
    </div>
  );
};

export default FollowUpGenerator;
