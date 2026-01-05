
import React from 'react';

interface Props {
  onBack: () => void;
}

const TermsOfService: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full bg-[#008080] flex flex-col p-4 md:p-12 overflow-y-auto">
      <div className="win95-outset w-full max-w-4xl mx-auto flex flex-col shadow-2xl animate-in fade-in duration-300">
        <div className="win95-titlebar shrink-0">
          <div className="flex items-center gap-2">
            <i className="fas fa-file-contract text-[10px]"></i>
            <span>Sentinal Help - Terms of Service</span>
          </div>
          <button onClick={onBack} className="win95-close">x</button>
        </div>
        
        <div className="bg-[#c0c0c0] p-4 md:p-8 text-slate-900 flex flex-col gap-6">
          <div className="win95-inset bg-white p-6 md:p-12 shadow-inner">
            <h1 className="text-3xl font-bold mb-6 border-b-2 border-gray-100 pb-4 uppercase tracking-tighter">Terms of Service</h1>
            
            <div className="space-y-6 text-sm leading-relaxed max-w-2xl">
              <section>
                <h2 className="text-lg font-bold border-l-4 border-orange-800 pl-3 mb-3">1. User Agreement</h2>
                <p className="text-gray-700">
                  By utilizing the Sentinal application, you certify that you possess the legal authority to manage the Gmail account connected to this software. Sentinal is provided as a productivity tool for professional outreach management.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold border-l-4 border-orange-800 pl-3 mb-3">2. Anti-Spam Compliance</h2>
                <p className="text-gray-700">
                  You agree to comply with all regional and international anti-spam regulations (including CAN-SPAM and GDPR). Sentinal is designed for professional relationship management; use for mass automated spam or harassment is strictly prohibited and may result in immediate service termination.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold border-l-4 border-orange-800 pl-3 mb-3">3. Limitation of Liability</h2>
                <p className="text-gray-700">
                  Sentinal and its developers are not liable for any miscommunications, missed leads, or technical issues resulting from Gmail API fluctuations or user error. Users are responsible for reviewing all email communications before they are transmitted.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold border-l-4 border-orange-800 pl-3 mb-3">4. Service Modifications</h2>
                <p className="text-gray-700">
                  We reserve the right to update these terms or the functionality of Sentinal at any time without prior notice to ensure compliance with Google's evolving developer policies and global security standards.
                </p>
              </section>

              <section className="bg-orange-50 p-4 border border-orange-200 italic mt-8">
                For legal inquiries or support, please contact: <br/>
                <span className="font-bold text-blue-900 select-all text-base mt-2 block">team@bycontrolplusa.co.in</span>
              </section>
            </div>
          </div>

          <div className="flex justify-center py-4">
             <button onClick={onBack} className="win95-button px-12 py-2 font-bold text-sm uppercase flex items-center gap-2">
               <i className="fas fa-check"></i>
               Accept and Return
             </button>
          </div>
        </div>

        <div className="bg-[#c0c0c0] border-t border-gray-500 p-2 text-[10px] text-gray-600 flex justify-between px-4">
          <span>Sentinal Documentation v1.5</span>
          <span>© 2024 Sentinal Legal</span>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
