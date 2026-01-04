
import React, { useState, useEffect } from 'react';
import { FollowUpItem, EmailTracking, DashboardStats, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import FollowUpWizard from './components/FollowUpWizard';
import ConnectModal from './components/ConnectModal';
import AddEmailModal from './components/AddEmailModal';
import { discoverSentLeads, getLatestReply, initGmailAuth } from './services/gmailService';
import { analyzeReplyContent } from './services/geminiService';

const CLIENT_ID = '911936835748-bpnpgp9u1hshhbrpqsn57blq1gt478ep.apps.googleusercontent.com';

const PROD_FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000;
const TEST_FOLLOW_UP_DELAY_MS = 2 * 60 * 1000;

const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailTracking[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(!localStorage.getItem('gmail_token'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<EmailTracking | null>(null);
  
  // Persistence for Test Mode
  const [isTestMode, setIsTestMode] = useState(() => {
    const saved = localStorage.getItem('sentinal_test_mode');
    if (saved !== null) return saved === 'true';
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1' || new URLSearchParams(window.location.search).get('test_mode') === 'true';
  });

  const FOLLOW_UP_DELAY_MS = isTestMode ? TEST_FOLLOW_UP_DELAY_MS : PROD_FOLLOW_UP_DELAY_MS;

  const stats: DashboardStats = {
    active: emails.filter(e => e.status === 'WAITING').length,
    followupsNeeded: emails.filter(e => e.status === 'NEEDS_FOLLOW_UP').length,
    replied: emails.filter(e => e.status === 'REPLIED').length,
    discarded: emails.filter(e => e.status === 'DISCARDED').length,
    pendingCount: 0
  };

  useEffect(() => {
    localStorage.setItem('sentinal_test_mode', String(isTestMode));
  }, [isTestMode]);

  useEffect(() => {
    if (token) scanInbox();
  }, [token]);

  const scanInbox = async () => {
    if (!token) return;
    setIsScanning(true);
    try {
      const sentLeads = await discoverSentLeads(token);
      const newEntries: EmailTracking[] = [];
      const now = Date.now();
      const thresholdTime = now - FOLLOW_UP_DELAY_MS;

      for (const lead of sentLeads) {
        const reply = await getLatestReply(token, lead.recipientEmail, lead.sentAt);
        let status: 'NEEDS_FOLLOW_UP' | 'WAITING' = lead.sentAt < thresholdTime ? 'NEEDS_FOLLOW_UP' : 'WAITING';
        
        let history: HistoryItem[] = [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'initial',
          date: lead.sentAt,
          content: lead.body || 'Auto-detected from Gmail sent items',
          subject: lead.subject
        }];

        if (reply) {
          const analysis = await analyzeReplyContent(reply.content);
          const finalStatus = analysis.category === 'UNSUBSCRIBE' ? 'DISCARDED' : 'REPLIED';
          
          history.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'reply',
            date: reply.date,
            content: reply.content,
            sentiment: analysis.category,
            summary: analysis.summary
          });

          newEntries.push({
            id: lead.recipientEmail,
            recipientName: lead.recipientName,
            recipientEmail: lead.recipientEmail,
            subject: lead.subject,
            lastActivityAt: reply.date,
            status: finalStatus as any,
            followUpCount: 0,
            history: history
          });
        } else {
          newEntries.push({
            id: lead.recipientEmail,
            recipientName: lead.recipientName,
            recipientEmail: lead.recipientEmail,
            subject: lead.subject,
            lastActivityAt: lead.sentAt,
            status: status as any,
            followUpCount: 0,
            history: history
          });
        }
      }
      setEmails(newEntries);
    } catch (e) {
      console.error("Scanning error:", e);
    } finally {
      setIsScanning(false);
    }
  };

  const handleConnect = () => {
    initGmailAuth(CLIENT_ID, (t) => {
      setToken(t);
      localStorage.setItem('gmail_token', t);
      setIsConnectModalOpen(false);
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#008080]">
      <div className="p-2 md:p-8 flex-grow overflow-auto pb-12">
        <div className="win95-outset w-full max-w-6xl mx-auto shadow-2xl overflow-hidden">
          <div className="win95-titlebar h-7 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <div className="w-3 h-3 bg-red-600 rounded-full border border-black/20"></div>
              <span className="truncate">Sentinal AI Email Assistant {isTestMode ? '[TEST MODE]' : ''}</span>
            </div>
            <div className="flex gap-1 h-full py-1">
               <button className="win95-close !w-4 !h-4">_</button>
               <button className="win95-close !w-4 !h-4">□</button>
               <button onClick={() => window.location.reload()} className="win95-close !w-4 !h-4">x</button>
            </div>
          </div>

          <div className="bg-[#c0c0c0] p-2 md:p-4 space-y-4">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="win95-button flex items-center gap-2 font-bold px-4"
              >
                <i className="fas fa-user-plus text-green-700"></i>
                <span>Add New Lead</span>
              </button>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold">Turbo Mode (2m):</span>
                <button 
                  onClick={() => {
                    setIsTestMode(!isTestMode);
                    // Trigger a re-scan immediately after toggling
                    setTimeout(scanInbox, 100);
                  }}
                  className={`win95-button !py-0 !px-2 text-[10px] font-bold ${isTestMode ? 'bg-[#000080] text-white' : ''}`}
                >
                  {isTestMode ? 'ENABLED' : 'DISABLED'}
                </button>
              </div>
            </div>

            <Dashboard stats={stats} total={emails.length} />

            <div className="space-y-2">
              <div className="flex flex-wrap justify-between items-center px-1 gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <i className="fas fa-folder-open text-[#d4a017]"></i>
                  <span>Inbox Monitoring</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsConnectModalOpen(true)}
                    className="win95-button !py-1 flex items-center gap-2 text-[11px]"
                  >
                    <i className={`fas fa-key ${token ? 'text-green-600' : 'text-gray-500'}`}></i>
                    {token ? 'Linked' : 'Gmail'}
                  </button>
                  <button 
                    disabled={!token || isScanning}
                    onClick={scanInbox}
                    className="win95-button !py-1 flex items-center gap-2 text-[11px] disabled:opacity-50"
                  >
                    <i className={`fas fa-sync-alt ${isScanning ? 'animate-spin' : ''}`}></i>
                    {isScanning ? '...' : 'Refresh'}
                  </button>
                </div>
              </div>

              <div className="h-[400px] md:h-[450px]">
                <EmailList 
                  emails={emails} 
                  onFollowUp={(e) => setActiveFollowUp(e)}
                  onReply={async () => {}} 
                  onDelete={(id) => setEmails(prev => prev.filter(e => e.id !== id))}
                  onSimulateTime={() => {}}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#c0c0c0] border-t border-gray-500 p-1 flex justify-between text-[11px] text-gray-700">
             <div className="win95-inset px-2 flex-1 h-5 flex items-center truncate">
               {isScanning ? 'Scanning...' : emails.length > 0 ? `${emails.length} items detected` : 'Ready'}
             </div>
             <div className="win95-inset px-2 w-48 flex items-center gap-2 justify-center font-bold">
               <span className={isTestMode ? 'text-blue-800' : 'text-gray-600'}>
                 Rule: {isTestMode ? '2-Minute Window' : '24-Hour Window'}
               </span>
             </div>
          </div>
        </div>
      </div>

      {isConnectModalOpen && (
        <ConnectModal onConnect={handleConnect} onClose={() => setIsConnectModalOpen(false)} />
      )}

      {isAddModalOpen && (
        <AddEmailModal onClose={() => setIsAddModalOpen(false)} onAdd={(e) => setEmails(p => [...p, e])} />
      )}

      {activeFollowUp && (
        <FollowUpWizard 
          item={{...activeFollowUp, sentAt: activeFollowUp.lastActivityAt, lastReplyAt: null, threadId: ''}} 
          onClose={() => setActiveFollowUp(null)}
          onComplete={() => {
            setEmails(prev => prev.map(e => e.id === activeFollowUp.id ? {...e, status: 'WAITING', lastActivityAt: Date.now()} : e));
            setActiveFollowUp(null);
          }}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-[300]">
        <button className="win95-button flex items-center gap-2 font-bold !px-3 !py-1 h-7">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Windows_logo_1992.vide.png" className="h-4" alt="Start" />
          <span>Start</span>
        </button>
        <div className="w-[2px] h-6 bg-gray-500 mx-1 border-r border-white"></div>
        <div className="win95-inset h-7 px-3 flex items-center text-[12px] bg-[#dfdfdf] font-bold truncate">
          Sentinal v1.4 {isTestMode ? '(Turbo Mode Active)' : ''}
        </div>
        <div className="flex-grow"></div>
        <div className="win95-inset h-7 px-3 flex items-center gap-2 text-[11px]">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default App;
