
import React from 'react';

interface Props {
  onBack: () => void;
}

const TermsOfService: React.FC<Props> = ({ onBack }) => {
  return (
    <div className="win95-outset max-w-2xl mx-auto my-8 p-0 overflow-hidden shadow-2xl">
      <div className="win95-titlebar">
        <span>Sentinal AI - Terms of Service</span>
        <button onClick={onBack} className="win95-close">x</button>
      </div>
      <div className="bg-[#c0c0c0] p-8 text-slate-800 h-[80vh] overflow-y-auto">
        <h1 className="text-2xl font-bold mb-6">Terms of Service</h1>
        
        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">1. Acceptance of Terms</h2>
          <p className="text-sm leading-relaxed">
            By accessing or using Sentinal AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the service.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">2. Description of Service</h2>
          <p className="text-sm leading-relaxed">
            Sentinal AI provides a Gmail-integrated assistant designed for cold email tracking and follow-up management. The service assists in identifying sent threads, detecting replies, and drafting follow-up messages.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">3. User Responsibilities</h2>
          <p className="text-sm leading-relaxed">
            You are solely responsible for the content of your emails and your compliance with anti-spam laws (including but not limited to the CAN-SPAM Act). You must provide accurate information and maintain the security of your Google account connection.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">4. Acceptable Use</h2>
          <p className="text-sm leading-relaxed">
            You agree not to use Sentinal AI for any illegal or unauthorized purpose, including the distribution of spam, malware, or unsolicited commercial communications that violate third-party rights or platform policies.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">5. Disclaimers</h2>
          <p className="text-sm leading-relaxed">
            Sentinal AI is provided "as is" and "as available." We do not guarantee that your emails will receive replies, that follow-up attempts will result in sales, or that the service will be error-free or uninterrupted at all times.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">6. Limitation of Liability</h2>
          <p className="text-sm leading-relaxed">
            To the maximum extent permitted by law, Sentinal AI shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the service, including loss of business reputation or revenue.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">7. Termination</h2>
          <p className="text-sm leading-relaxed">
            We reserve the right to suspend or terminate your access to Sentinal AI at our discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users or the service itself.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">8. Changes to Terms</h2>
          <p className="text-sm leading-relaxed">
            We may update these Terms from time to time. Your continued use of the service after such changes constitutes your acceptance of the new Terms.
          </p>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-bold mb-2">9. Governing Law</h2>
          <p className="text-sm leading-relaxed">
            These terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the service provider operates, without regard to its conflict of law provisions.
          </p>
        </section>

        <section className="mb-12 border-t border-gray-400 pt-6">
          <p className="text-[10px] text-gray-600 mb-4">
            For support or questions, contact: <span className="font-bold">support@sentinalai.com</span>
          </p>
          <button onClick={onBack} className="win95-button font-bold px-8 py-2">Close Document</button>
        </section>
      </div>
    </div>
  );
};

export default TermsOfService;
