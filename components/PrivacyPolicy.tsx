
import React from 'react';

interface Props {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="win95-outset w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh]">
      <div className="win95-titlebar shrink-0">
        <div className="flex items-center gap-2">
          <i className="fas fa-shield-alt text-[10px]"></i>
          <span>Help: Privacy Policy</span>
        </div>
        <button onClick={onBack} className="win95-close">x</button>
      </div>
      <div className="bg-[#c0c0c0] p-6 text-slate-900 overflow-y-auto win95-inset m-2 scrollbar-gutter-stable">
        <h1 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Sentinal Privacy Policy</h1>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold underline mb-1">1. Scope of Data Access</h2>
            <p>
              Sentinal AI accesses your Gmail account using official Google OAuth protocols. Our application is architected to be <b>privacy-first</b>:
            </p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>We only read metadata from your "Sent" folder to track recipient addresses and subjects.</li>
              <li>We scan thread updates to detect when a lead has provided a response.</li>
              <li>We transmit follow-up emails only upon your explicit command.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">2. Data Usage & AI Policy</h2>
            <p>
              Your email content is analyzed by the Gemini 3 Flash model solely for the purpose of generating drafts and sentiment classification. We <b>never</b> use your private emails to train general models, and we do not sell your outreach data to third-party advertisers.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">3. Local Storage</h2>
            <p>
              Lead names and statuses are stored in your browser's local cache. Clearing your browser data will disconnect the assistant and reset your tracking history.
            </p>
          </section>

          <section className="bg-white/30 p-3 border border-gray-400 italic">
            For further inquiries regarding data handling, please reach out to: <br/>
            <span className="font-bold text-blue-900 select-all">legal@sentinalassistant.io</span>
          </section>
        </div>
      </div>
      <div className="p-3 bg-[#c0c0c0] flex justify-center shrink-0 border-t border-gray-400">
        <button onClick={onBack} className="win95-button px-10 py-1 font-bold">OK</button>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
