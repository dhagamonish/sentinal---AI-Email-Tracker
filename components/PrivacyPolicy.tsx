
import React from 'react';

interface Props {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="win95-outset max-w-2xl mx-auto my-8 p-0 overflow-hidden shadow-2xl">
      <div className="win95-titlebar">
        <span>Sentinal AI - Privacy Policy</span>
        <button onClick={onBack} className="win95-close">x</button>
      </div>
      <div className="bg-[#c0c0c0] p-8 text-slate-800 h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">1. Introduction</h2>
          <p className="text-sm leading-relaxed">
            Sentinal AI is committed to protecting your privacy. This policy explains how we handle your information when you use our Gmail-integrated follow-up assistant. By using Sentinal AI, you agree to the practices described in this policy.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">2. Information We Collect</h2>
          <p className="text-sm leading-relaxed mb-2">
            Sentinal AI accesses your Gmail account using Google OAuth. Our access is strictly limited to the following:
          </p>
          <ul className="list-disc pl-5 text-sm space-y-1">
            <li><strong>Sent Messages:</strong> We read metadata and content from sent email threads to identify active outreach.</li>
            <li><strong>Reply Detection:</strong> We check for incoming messages within those specific threads to determine if a recipient has responded.</li>
            <li><strong>User-Initiated Sending:</strong> We send follow-up emails only when you explicitly trigger the "Send" action within the app.</li>
          </ul>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">3. How We Use Your Information</h2>
          <p className="text-sm leading-relaxed">
            Your data is used solely to provide the core functionality of Sentinal AI: tracking your email outreach, detecting replies, and assisting you in sending follow-up messages. We do not use your data for advertising, user profiling, or any other commercial purposes.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">4. Data Sharing and Disclosure</h2>
          <p className="text-sm leading-relaxed">
            Sentinal AI does not sell, trade, or share your email data with third parties. We do not use third-party tracking pixels or behavioral analytics. We only share data if required by law to comply with legal processes or protect our rights.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">5. Data Storage and Retention</h2>
          <p className="text-sm leading-relaxed">
            To prioritize privacy, we store tracking data locally in your browser or minimally on our infrastructure only as required to operate the service. We do not maintain a permanent database of your full email history.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">6. Google API Policy Compliance</h2>
          <p className="text-sm leading-relaxed">
            Sentinal AI's use and transfer of information received from Google APIs to any other app will adhere to <a href="https://developers.google.com/terms/api-services-user-data-policy" target="_blank" className="text-blue-800 underline">Google API Services User Data Policy</a>, including the Limited Use requirements.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">7. User Control and Choices</h2>
          <p className="text-sm leading-relaxed">
            You may revoke Sentinal AI’s access to your Gmail account at any time through your Google Account security settings. You can also delete your local tracking data through the application interface.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">8. Contact Information</h2>
          <p className="text-sm leading-relaxed">
            If you have questions about this Privacy Policy, please contact us at: <span className="font-bold">support@sentinalai.com</span>
          </p>
        </section>

        <section className="mb-12 border-t border-gray-400 pt-6">
          <button onClick={onBack} className="win95-button font-bold px-8 py-2">Close Document</button>
        </section>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
