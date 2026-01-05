
import React from 'react';

interface Props {
  onBack: () => void;
}

const TermsOfService: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="win95-outset w-full max-w-2xl flex flex-col shadow-2xl animate-in zoom-in-95 duration-150 max-h-[85vh]">
      <div className="win95-titlebar shrink-0">
        <div className="flex items-center gap-2">
          <i className="fas fa-file-contract text-[10px]"></i>
          <span>Help: Terms of Service</span>
        </div>
        <button onClick={onBack} className="win95-close">x</button>
      </div>
      <div className="bg-[#c0c0c0] p-6 text-slate-900 overflow-y-auto win95-inset m-2 scrollbar-gutter-stable">
        <h1 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Terms of Service</h1>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold underline mb-1">1. User Agreement</h2>
            <p>
              By utilizing the Sentinal Email Assistant, you certify that you possess the legal authority to manage the Gmail account connected to this software.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">2. Anti-Spam Compliance</h2>
            <p>
              You agree to comply with all regional and international anti-spam regulations (including CAN-SPAM and GDPR). Sentinal is an assistant for professional outreach; use for mass automated spam is strictly prohibited and may result in service termination.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">3. Limitation of Liability</h2>
            <p>
              Sentinal AI and its developers are not liable for any miscommunications, missed leads, or technical issues resulting from Gmail API fluctuations or AI-generated content inaccuracies. All drafts should be reviewed before transmission.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">4. Service Modifications</h2>
            <p>
              We reserve the right to update these terms or the functionality of Sentinal at any time without prior notice to ensure compliance with Google's evolving developer policies.
            </p>
          </section>
        </div>
      </div>
      <div className="p-3 bg-[#c0c0c0] flex justify-center shrink-0 border-t border-gray-400">
        <button onClick={onBack} className="win95-button px-10 py-1 font-bold">I Agree</button>
      </div>
    </div>
  );
};

export default TermsOfService;
