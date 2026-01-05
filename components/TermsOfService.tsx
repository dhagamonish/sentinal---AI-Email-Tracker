
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
        <h1 className="text-xl font-bold mb-4 border-b border-gray-400 pb-2">Sentinal Terms of Service</h1>
        
        <div className="space-y-4 text-sm leading-relaxed">
          <section>
            <h2 className="font-bold underline mb-1">1. User Agreement</h2>
            <p>
              By utilizing the Sentinal application, you certify that you possess the legal authority to manage the Gmail account connected to this software. Sentinal is provided as a productivity tool for professional outreach management.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">2. Anti-Spam Compliance</h2>
            <p>
              You agree to comply with all regional and international anti-spam regulations (including CAN-SPAM and GDPR). Sentinal is designed for professional relationship management; use for mass automated spam or harassment is strictly prohibited and may result in immediate service termination.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">3. Limitation of Liability</h2>
            <p>
              Sentinal and its developers are not liable for any miscommunications, missed leads, or technical issues resulting from Gmail API fluctuations or user error. Users are responsible for reviewing all email communications before they are transmitted.
            </p>
          </section>

          <section>
            <h2 className="font-bold underline mb-1">4. Service Modifications</h2>
            <p>
              We reserve the right to update these terms or the functionality of Sentinal at any time without prior notice to ensure compliance with Google's evolving developer policies and global security standards.
            </p>
          </section>

          <section className="bg-white/30 p-3 border border-gray-400 italic">
            For legal inquiries or support, please contact: <br/>
            <span className="font-bold text-blue-900 select-all">team@bycontrolplusa.co.in</span>
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
