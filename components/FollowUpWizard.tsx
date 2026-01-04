
import React, { useState, useEffect } from 'react';
import { FollowUpItem } from '../types';
import { getSignature, sendGmail, getUserProfile } from '../services/gmailService';

interface Props {
  item: FollowUpItem;
  onClose: () => void;
  onComplete: () => void;
}

const FollowUpWizard: React.FC<Props> = ({ item, onClose, onComplete }) => {
  const [messageBody, setMessageBody] = useState('');
  const [signatureHtml, setSignatureHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('gmail_token');
      try {
        const [sigHtml, profile] = await Promise.all([
          token ? getSignature(token) : Promise.resolve(''),
          token ? getUserProfile(token) : Promise.resolve(null)
        ]);
        
        const initialMessage = `Hi ${item.recipientName},\n\nI'm just checking in to see if you had a chance to look at my previous email regarding "${item.subject}".\n\nLooking forward to hearing from you.`;
        const salutation = profile?.displayName ? `\n\nBest regards,\n${profile.displayName}` : `\n\nBest regards,`;
        
        setMessageBody(`${initialMessage}${salutation}`);
        setSignatureHtml(sigHtml);
      } catch (err) {
        console.error("Initialization error:", err);
        setMessageBody(`Hi,\n\nJust checking in on my last email regarding "${item.subject}".`);
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
      // Escape plain text for HTML and convert newlines
      const safeBody = messageBody
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;")
        .replace(/\n/g, '<br>');

      // Combine with the rich HTML signature
      const combinedHtml = `${safeBody}${signatureHtml ? `<br><br>--<br>${signatureHtml}` : ''}`;
      
      await sendGmail(token, item.recipientEmail, `Re: ${item.subject}`, combinedHtml, item.threadId);
      onComplete();
    } catch (err: any) {
      setError(err.message || "Failed to send email");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="win95-outset w-full max-w-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="win95-titlebar shrink-0">
          <div className="flex items-center gap-2">
             <i className="fas fa-paper-plane text-[10px]"></i>
             <span>Sentinal - Follow-Up Assistant</span>
          </div>
          <button onClick={onClose} className="win95-close">x</button>
        </div>
        
        <div className="p-6 space-y-4 bg-[#c0c0c0] overflow-y-auto">
          <div className="flex gap-4 border-b border-gray-400 pb-4 items-center">
             <div className="w-12 h-12 bg-white win95-inset flex items-center justify-center text-2xl shrink-0">✉️</div>
             <div className="flex-1 overflow-hidden">
               <div className="text-[10px] text-gray-600 uppercase font-bold tracking-tight">Recipient:</div>
               <div className="font-bold text-blue-900 truncate">{item.recipientEmail}</div>
             </div>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-4 border-t-[#000080] border-gray-300 rounded-full animate-spin"></div>
              <div className="text-xs font-bold animate-pulse">Syncing Gmail Profile & Signature...</div>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-end">
                  <label className="text-[11px] font-bold">Your Message:</label>
                  {error && <span className="text-red-700 text-[10px] font-bold animate-bounce">{error}</span>}
                </div>
                <textarea 
                  value={messageBody}
                  onChange={(e) => setMessageBody(e.target.value)}
                  className="win95-inset w-full h-40 p-3 text-sm outline-none font-mono resize-none leading-relaxed"
                  disabled={sending}
                  spellCheck={false}
                />
              </div>

              {signatureHtml && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold opacity-70">Signature Preview (Includes Logos):</label>
                  <div className="win95-inset bg-white p-3 min-h-[60px] max-h-[150px] overflow-auto text-sm border-dashed border-gray-300">
                    <div className="text-gray-400 mb-2 border-b border-gray-100 text-[10px] font-mono">--</div>
                    <div 
                      className="gmail-signature-render"
                      dangerouslySetInnerHTML={{ __html: signatureHtml }} 
                    />
                  </div>
                </div>
              )}
              
              <div className="flex justify-between items-center bg-[#dfdfdf] p-2 border border-gray-400 mt-4">
                <p className="text-[10px] text-gray-600 italic max-w-[280px] leading-tight">
                  <i className="fas fa-info-circle mr-1"></i>
                  Sentinal sends HTML-formatted emails, ensuring your logos and formatting are preserved exactly as configured in Gmail.
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
        
        <div className="bg-[#dfdfdf] p-1 border-t border-gray-500 flex justify-between text-[9px] px-2 text-gray-500 shrink-0">
           <span>Status: {sending ? 'Transmitting HTML...' : 'Ready'}</span>
           <span>Lead: {item.recipientName}</span>
        </div>
      </div>
    </div>
  );
};

export default FollowUpWizard;
