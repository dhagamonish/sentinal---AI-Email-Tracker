
import React, { useState, useEffect, useMemo } from 'react';
import { EmailTracking, TrackingStatus, DashboardStats } from './types';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import AddEmailModal from './components/AddEmailModal';
import FollowUpGenerator from './components/FollowUpGenerator';
import { analyzeReply } from './services/geminiService';
import { initGmailAuth, fetchLatestReply } from './services/gmailService';

const DEFAULT_CLIENT_ID = '911936835748-9dpk13953gm2tm3urjbeckgi8gpe209ua.apps.googleusercontent.com';

const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailTracking[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedEmailForFollowUp, setSelectedEmailForFollowUp] = useState<EmailTracking | null>(null);
  const [gmailToken, setGmailToken] = useState<string | null>(null);
  const [googleClientId, setGoogleClientId] = useState<string>(DEFAULT_CLIENT_ID);
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('sentinal_emails');
    const savedToken = localStorage.getItem('sentinal_gmail_token');
    const savedId = localStorage.getItem('sentinal_google_client_id');
    const savedGeminiKey = localStorage.getItem('sentinal_gemini_api_key');

    if (saved) setEmails(JSON.parse(saved));
    if (savedToken) setGmailToken(savedToken);
    if (savedGeminiKey) setGeminiApiKey(savedGeminiKey);

    // Only set if it looks valid, otherwise fallback to default to avoid corrupted storage
    if (savedId && savedId.length > 10) {
      setGoogleClientId(savedId.trim());
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sentinal_emails', JSON.stringify(emails));
  }, [emails]);

  const handleApplySettings = () => {
    const cleanedId = googleClientId.trim();
    const cleanedGemini = geminiApiKey.trim();
    localStorage.setItem('sentinal_google_client_id', cleanedId);
    localStorage.setItem('sentinal_gemini_api_key', cleanedGemini);
    setGoogleClientId(cleanedId);
    setGeminiApiKey(cleanedGemini);
    setIsSettingsOpen(false);
  };

  const handleFullReset = () => {
    if (confirm("This will clear ALL leads and reset the Client ID. Continue?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleConnectGmail = () => {
    const cleanId = googleClientId.trim();
    if (!cleanId) {
      alert("Missing Client ID. Please check Settings.");
      setIsSettingsOpen(true);
      return;
    }

    try {
      initGmailAuth(cleanId, (token) => {
        setGmailToken(token);
        localStorage.setItem('sentinal_gmail_token', token);
        alert("Success! Gmail is now linked.");
      });
    } catch (e: any) {
      alert(e.message);
    }
  };

  const syncWithGmail = async () => {
    if (!gmailToken) {
      handleConnectGmail();
      return;
    }

    setIsSyncing(true);
    let foundNewReplies = 0;

    try {
      for (const email of emails) {
        if (email.status === 'WAITING' || email.status === 'NEEDS_FOLLOW_UP') {
          const reply = await fetchLatestReply(gmailToken, email.recipientEmail);

          if (reply && parseInt(reply.date) > email.lastActivityAt) {
            await handleManualReply(email.id, reply.snippet);
            foundNewReplies++;
          }
        }
      }
      alert(foundNewReplies > 0 ? `Sync complete! Found ${foundNewReplies} new replies.` : "No new replies found in your inbox.");
    } catch (err) {
      alert("Session expired or invalid. Please click 'Authorize Gmail' again.");
      setGmailToken(null);
    } finally {
      setIsSyncing(false);
    }
  };

  const addEmail = (newEmail: EmailTracking) => {
    setEmails(prev => [newEmail, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleManualReply = async (id: string, replyContent: string) => {
    const analysis = await analyzeReply(replyContent);
    setEmails(prev => prev.map(email => {
      if (email.id === id) {
        return {
          ...email,
          status: 'REPLIED',
          lastActivityAt: Date.now(),
          history: [...email.history, {
            id: Math.random().toString(36).substr(2, 9),
            type: 'reply',
            date: Date.now(),
            content: replyContent,
            sentiment: analysis.sentiment,
            summary: analysis.summary
          }]
        };
      }
      return email;
    }));
  };

  const recordFollowUp = (id: string, content: string) => {
    setEmails(prev => prev.map(email => {
      if (email.id === id) {
        const newCount = email.followUpCount + 1;
        const newStatus: TrackingStatus = newCount >= 3 ? 'DISCARDED' : 'WAITING';
        return {
          ...email,
          followUpCount: newCount,
          status: newStatus,
          lastActivityAt: Date.now(),
          history: [...email.history, {
            id: Math.random().toString(36).substr(2, 9),
            type: 'followup',
            date: Date.now(),
            content: content
          }]
        };
      }
      return email;
    }));
    setSelectedEmailForFollowUp(null);
  };

  const deleteEmail = (id: string) => {
    if (window.confirm("Delete tracker?")) {
      setEmails(prev => prev.filter(e => e.id !== id));
    }
  };

  const simulateTimePassage = (id: string) => {
    setEmails(prev => prev.map(email => {
      if (email.id === id) {
        return {
          ...email,
          lastActivityAt: Date.now() - (25 * 60 * 60 * 1000),
          status: 'NEEDS_FOLLOW_UP'
        };
      }
      return email;
    }));
  };

  const stats: DashboardStats = useMemo(() => {
    return {
      active: emails.filter(e => e.status === 'WAITING').length,
      replied: emails.filter(e => e.status === 'REPLIED').length,
      followupsNeeded: emails.filter(e => e.status === 'NEEDS_FOLLOW_UP').length,
      discarded: emails.filter(e => e.status === 'DISCARDED').length,
    };
  }, [emails]);

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <div className="win95-outset overflow-hidden">
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <i className="fas fa-paper-plane text-[10px]"></i>
            <span>Sentinal v1.2 [GMAIL-PRO]</span>
          </div>
          <div className="flex gap-1">
            <button className="win95-close">_</button>
            <button className="win95-close">□</button>
            <button onClick={() => window.location.reload()} className="win95-close">x</button>
          </div>
        </div>

        <div className="flex bg-[#c0c0c0] border-b border-gray-500 text-[12px] px-2 py-1 gap-4">
          <button className="hover:bg-[#000080] hover:text-white px-2">File</button>
          <button className="hover:bg-[#000080] hover:text-white px-2" onClick={syncWithGmail}>Sync Now...</button>
          <button className="hover:bg-[#000080] hover:text-white px-2" onClick={() => setIsAddModalOpen(true)}>New Lead...</button>
          <button className="hover:bg-[#000080] hover:text-white px-2" onClick={() => setIsSettingsOpen(true)}>Settings</button>
        </div>

        <div className="p-4 bg-[#c0c0c0]">
          <Dashboard stats={stats} total={emails.length} />

          <div className="mt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <i className="fas fa-folder-open text-amber-600"></i>
                <h2 className="text-[14px] font-bold">Inbox Tracking</h2>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleConnectGmail}
                  className="win95-button flex items-center gap-2 font-bold !text-[11px]"
                >
                  <i className={`fas fa-key ${gmailToken ? 'text-green-600' : 'text-gray-400'}`}></i>
                  {gmailToken ? 'Token Active' : 'Authorize Gmail'}
                </button>
                <button
                  onClick={syncWithGmail}
                  disabled={isSyncing}
                  className="win95-button flex items-center gap-2 !text-[11px]"
                >
                  <i className={`fas fa-sync ${isSyncing ? 'animate-spin' : ''}`}></i>
                  {isSyncing ? 'Syncing...' : 'Sync Inbox'}
                </button>
              </div>
            </div>

            <div className="win95-inset bg-white min-h-[400px]">
              <EmailList
                emails={emails}
                onFollowUp={(email) => setSelectedEmailForFollowUp(email)}
                onReply={handleManualReply}
                onDelete={deleteEmail}
                onSimulateTime={simulateTimePassage}
              />
            </div>
          </div>
        </div>

        <div className="bg-[#c0c0c0] border-t border-gray-500 p-1 flex justify-between text-[11px] text-gray-700">
          <div className="win95-inset px-2 flex-1">{isSyncing ? 'Accessing Google API...' : 'Ready'}</div>
          <div className="win95-inset px-2 w-48 truncate">Status: {gmailToken ? 'Authenticated' : 'Offline'}</div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-[#c0c0c0] border-t-2 border-white p-1 flex items-center gap-2 z-[100] h-10">
        <button className="win95-button flex items-center gap-2 font-bold !px-3 !py-1">
          <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/30/Windows_95_logo.svg/2000px-Windows_95_logo.svg.png" className="w-4 h-4" alt="start" />
          Start
        </button>
        <div className="win95-inset flex items-center px-2 py-0.5 text-xs h-8 bg-[#c0c0c0]">
          Sentinal v1.2
        </div>
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setIsSettingsOpen(false)}></div>
          <div className="relative win95-outset w-full max-w-md">
            <div className="win95-titlebar">
              <span>OAuth Settings</span>
              <button onClick={() => setIsSettingsOpen(false)} className="win95-close">x</button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-[11px] font-bold mb-1">Google OAuth Client ID:</label>
                <textarea
                  rows={3}
                  value={googleClientId}
                  onChange={(e) => setGoogleClientId(e.target.value)}
                  className="win95-inset w-full px-2 py-1 text-[11px] font-mono outline-none resize-none"
                  placeholder="Paste Client ID here..."
                />
                <div className="flex justify-between mt-2">
                  <button onClick={handleFullReset} className="win95-button !text-[10px] text-red-700">Clear All Cache</button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold mb-1">Gemini AI API Key:</label>
                <input
                  type="password"
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  className="win95-inset w-full px-2 py-1 text-[11px] font-mono outline-none"
                  placeholder="Paste Gemini Key here..."
                />
                <p className="text-[9px] text-gray-600 mt-1">Required for Follow-up Wizard and Sentiment Analysis.</p>
              </div>

              <div className="win95-inset bg-[#dfdfdf] p-2 text-[10px] space-y-1">
                <p className="font-bold border-b border-gray-400 pb-1">Connection Check:</p>
                <p>• Client ID length: {googleClientId.trim().length} chars</p>
                <p>• Origins required: <code>{window.location.origin}</code></p>
                <p className="text-red-700 font-bold mt-1">IMPORTANT: Ensure the URL above is listed in your Google Cloud Console's "Authorized JavaScript Origins".</p>
              </div>

              <div className="flex justify-end gap-2">
                <button onClick={() => setIsSettingsOpen(false)} className="win95-button w-24">Cancel</button>
                <button onClick={handleApplySettings} className="win95-button font-bold w-24">Apply</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddEmailModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={addEmail}
        />
      )}

      {selectedEmailForFollowUp && (
        <FollowUpGenerator
          email={selectedEmailForFollowUp}
          onClose={() => setSelectedEmailForFollowUp(null)}
          onSend={recordFollowUp}
        />
      )}
    </div>
  );
};

export default App;
