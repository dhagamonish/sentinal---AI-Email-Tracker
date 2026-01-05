
import React from 'react';

interface Props {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="min-h-screen w-full bg-[#008080] flex flex-col p-4 md:p-12 overflow-y-auto">
      <div className="win95-outset w-full max-w-4xl mx-auto flex flex-col shadow-2xl animate-in fade-in duration-300">
        <div className="win95-titlebar shrink-0">
          <div className="flex items-center gap-2">
            <i className="fas fa-shield-alt text-[10px]"></i>
            <span>Sentinal Help - Privacy Policy</span>
          </div>
          <button onClick={onBack} className="win95-close">x</button>
        </div>
        
        <div className="bg-[#c0c0c0] p-4 md:p-8 text-slate-900 flex flex-col gap-6">
          <div className="win95-inset bg-white p-6 md:p-12 shadow-inner">
            <h1 className="text-3xl font-bold mb-6 border-b-2 border-gray-100 pb-4 uppercase tracking-tighter">Sentinal Privacy Policy</h1>
            
            <div className="space-y-6 text-sm leading-relaxed max-w-2xl">
              <section>
                <h2 className="text-lg font-bold border-l-4 border-blue-800 pl-3 mb-3">1. Scope of Data Access</h2>
                <p className="text-gray-700">
                  Sentinal accesses your Gmail account using official Google OAuth protocols. Our application is architected to be <b>privacy-first</b>:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-gray-600">
                  <li>We only read metadata from your "Sent" folder to track recipient addresses and subjects.</li>
                  <li>We check thread status to detect when a recipient has provided a response to your outreach.</li>
                  <li>We facilitate the sending of follow-up emails only upon your manual trigger.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-bold border-l-4 border-blue-800 pl-3 mb-3">2. Data Usage & Security</h2>
                <p className="text-gray-700">
                  Your email metadata is used solely for the purpose of identifying reply status and organizing your outreach workflow. We <b>never</b> store your email body content on our servers, and we do not sell your outreach data to third-party advertisers or data brokers.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-bold border-l-4 border-blue-800 pl-3 mb-3">3. Local Storage</h2>
                <p className="text-gray-700">
                  Lead names and statuses are stored in your browser's local cache. This ensures that your tracking data remains under your control within your local environment. Clearing your browser data will disconnect the assistant and reset your tracking history.
                </p>
              </section>

              <section className="bg-blue-50 p-4 border border-blue-200 italic mt-8">
                For further inquiries regarding data handling, please reach out to our team at: <br/>
                <span className="font-bold text-blue-900 select-all text-base mt-2 block">team@bycontrolplusa.co.in</span>
              </section>
            </div>
          </div>

          <div className="flex justify-center py-4">
             <button onClick={onBack} className="win95-button px-12 py-2 font-bold text-sm uppercase flex items-center gap-2">
               <i className="fas fa-arrow-left"></i>
               Back to Desktop
             </button>
          </div>
        </div>

        <div className="bg-[#c0c0c0] border-t border-gray-500 p-2 text-[10px] text-gray-600 flex justify-between px-4">
          <span>Sentinal Documentation v1.5</span>
          <span>Last Updated: 2024</span>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
