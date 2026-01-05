
import React from 'react';

interface Props {
  onConnect: () => void;
  onClose: () => void;
}

const ConnectModal: React.FC<Props> = ({ onConnect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[1px]">
      <div className="win95-outset w-full max-w-sm shadow-2xl">
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <i className="fas fa-key text-[10px]"></i>
            <span>System Login</span>
          </div>
          <button onClick={onClose} className="win95-close">x</button>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 bg-white border border-gray-400 flex items-center justify-center shrink-0 shadow-[inset_-1px_-1px_#fff,inset_1px_1px_#808080]">
               <img src="https://upload.wikimedia.org/wikipedia/commons/b/b7/Google_Gmail_logo.svg" className="w-8" alt="Gmail" />
            </div>
            <div className="space-y-2">
              <h2 className="font-bold text-sm">Connection Required</h2>
              <p className="text-[11px] leading-tight text-gray-700">
                To start tracking your outreach, please connect your Gmail account. This allows us to detect replies automatically.
              </p>
            </div>
          </div>

          <div className="win95-inset bg-[#ffffcc] p-3 text-[10px] text-gray-800 border-l-4 border-yellow-500">
            <div className="font-bold mb-1 flex items-center gap-1">
              <i className="fas fa-exclamation-triangle text-yellow-600"></i>
              <span>Login Troubleshooting</span>
            </div>
            <p className="mb-1">If you see a <b>"Google hasn't verified this app"</b> screen:</p>
            <ol className="list-decimal ml-4 space-y-1">
              <li>Click <b>"Advanced"</b> on the Google page.</li>
              <li>Click <b>"Go to sentinaltracker.vercel.app (unsafe)"</b> at the bottom.</li>
            </ol>
            <p className="mt-1 opacity-70 italic">This is normal for personal development projects.</p>
          </div>

          <div className="win95-inset bg-[#dfdfdf] p-2 text-[10px] text-gray-600 italic">
            Note: We only request read-only access to scan for replies and send access for follow-ups.
          </div>

          <div className="flex justify-center pt-2 gap-2">
            <button 
              onClick={onConnect}
              className="win95-button font-bold px-6 py-2 flex items-center justify-center gap-2"
            >
              <i className="fab fa-google"></i>
              Connect Gmail
            </button>
            <button 
              onClick={onClose}
              className="win95-button px-6 py-2"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectModal;
