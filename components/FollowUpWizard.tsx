
import React, { useState, useEffect } from 'react';
import { FollowUpItem } from '../types';
import { generateFollowUpDraft } from '../services/geminiService';
import { getSignature, sendGmail, getUserProfile } from '../services/gmailService';

interface Props {
  item: FollowUpItem;
  onClose: () => void;
  onComplete: () => void;
}

const FollowUpWizard: React.FC<Props> = ({ item, onClose, onComplete }) => {
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('gmail_token');
      try {
        const [draftBody, sigText, profile] = await Promise.all([
          generateFollowUpDraft(item),
          token ? getSignature(token) : Promise.resolve(''),
          token ? getUserProfile(token) : Promise.resolve(null)
        ]);
        
        // Assemble the email: Body + Salutation + Signature
        const salutation = profile?.displayName ? `\n\nBest regards,\n${profile.displayName}` : `\n\nBest regards,`;
        const signature = sigText ? `\n--\n${sigText}` : '';
        
        setDraft(`${draftBody}${salutation}${signature}`);
      } catch (err) {
        console.error("Initialization error:", err);
        setDraft("Hi, just checking in on my last email.");
      } finally {
        setLoading(false);
      }
    })();
  }, [item]);

  const handleSend = async () => {
    const token = localStorage.getItem('gmail_token');
    if (!token) {
      setError("Gmail not connected. Please connect first.");
      return;
    }

    setSending(true);
    setError(null);
    try {
      await sendGmail(token, item.recipientEmail, `Re: ${item.subject}`, draft, item.threadId);
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="win95-outset w-full max-w-lg shadow-2xl">
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
             <i className="fas fa-paper-plane text-[10px]"></i>
             <span>Sentinal - AI Follow-Up Assistant</span>
          </div>
          <button onClick={onClose} className="win95-close">x</button>
        </div>
        
        <div className="p-6 space-y-4 bg-[#c0c0c0]">
          <div className="flex gap-4 border-b border-gray-400 pb-4 items-center">
             <div className="w-12 h-12 bg-white win95-inset flex items-center justify-center text-2xl">✉️</div>
             <div>
               <div className="text-[10px] text-gray-600 uppercase font-bold tracking-tight">Recipient:</div>
               <div className="font-bold text-blue-900 truncate max-w-[300px]">{item.recipientEmail}</div>
             </div>
          </div>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-t-[#000080] border-gray-300 rounded-full animate-spin"></div>
              <div className="text-xs font-bold animate-pulse">Syncing Gmail Profile & AI...</div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-bold">Compose Message:</label>
                  {error && <span className="text-red-700 text-[10px] font-bold animate-bounce">{error}</span>}
                </div>
                <textarea 
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  className="win95-inset w-full h-56 p-3 text-sm outline-none font-mono resize-none leading-relaxed"
                  disabled={sending}
                  spellCheck={false}
                />
              </div>
              
              <div className="flex justify-between items-center bg-[#dfdfdf] p-2 border border-gray-400">
                <p className="text-[10px] text-gray-600 italic max-w-[220px] leading-tight">
                  The message above includes your official Gmail signature.
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={sending} 
                    onClick={onClose} 
                    className="win95-button w-24"
                  >
                    Cancel
                  </button>
                  <button 
                    disabled={sending} 
                    onClick={handleSend} 
                    className="win95-button font-bold w-32 bg-[#000080] text-white flex items-center justify-center gap-2"
                  >
                    {sending ? (
                      <i className="fas fa-spinner animate-spin"></i>
                    ) : (
                      <i className="fas fa-paper-plane"></i>
                    )}
                    {sending ? 'Sending...' : 'Send Now'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
        
        <div className="bg-[#dfdfdf] p-1 border-t border-gray-500 flex justify-between text-[9px] px-2 text-gray-500">
           <span>Status: {sending ? 'Transmitting...' : 'Draft Synchronized'}</span>
           <span>Lead: {item.recipientName}</span>
        </div>
      </div>
    </div>
  );
};

export default FollowUpWizard;
