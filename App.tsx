
import React, { useState, useEffect } from 'react';
import { FollowUpItem, EmailTracking, DashboardStats, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import FollowUpWizard from './components/FollowUpWizard';
import ConnectModal from './components/ConnectModal';
import AddEmailModal from './components/AddEmailModal';
import { discoverSentLeads, getLatestReply, initGmailAuth } from './services/gmailService';
import { analyzeReplyContent } from './services/geminiService';

// Updated Client ID from user's Google Cloud Console screenshot
const CLIENT_ID = '911936835748-bpnpgp9u1hshhbrpqsn57blq1gt478ep.apps.googleusercontent.com';

// Production: 24 hours | Testing: 2 minutes
const PROD_FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000;
const TEST_FOLLOW_UP_DELAY_MS = 2 * 60 * 1000;

// Enable test mode if ?test_mode=true is in the URL, allowing testing on Vercel or Localhost
const isTestMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('test_mode') === 'true';
const FOLLOW_UP_DELAY_MS = isTestMode ? TEST_FOLLOW_UP_DELAY_MS : PROD_FOLLOW_UP_DELAY_MS;

const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailTracking[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(!localStorage.getItem('gmail_token'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<EmailTracking | null>(null);

  const stats: DashboardStats = {
    active: emails.filter(e => e.status === 'WAITING').length,
    followupsNeeded: emails.filter(e => e.status === 'NEEDS_FOLLOW_UP').length,
    replied: emails.filter(e => e.status === 'REPLIED').length,
    discarded: emails.filter(e => e.status === 'DISCARDED').length,
    pendingCount: 0
  };

  useEffect(() => {
    if (token) scanInbox();
  }, [token]);

  const scanInbox = async () => {
    if (!token) return;
    setIsScanning(true);
    try {
      // Fetch most recent sent items
      const sentLeads = await discoverSentLeads(token);
      const newEntries: EmailTracking[] = [];
      
      // Threshold is determined by FOLLOW_UP_DELAY_MS (2m in test mode, 24h in prod)
      const thresholdTime = Date.now() - FOLLOW_UP_DELAY_MS;

      for (const lead of sentLeads) {
        // Check if there is a reply to this thread
        const reply = await getLatestReply(token, lead.recipientEmail, lead.sentAt);
        
        // Decide status based on timing threshold
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
          // Overwrite status if they actually replied
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
          // No reply found, use the timing-based status
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

  const handleManualAdd = (newEmail: EmailTracking) => {
    setEmails(prev => [...prev, newEmail]);
    setIsAddModalOpen(false);
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
                <span className="hidden sm:inline">Add New Lead</span>
                <span className="sm:hidden">Add</span>
              </button>
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
                    className="win95-button !py-1 flex items-center gap-2 text-[10px] sm:text-[11px]"
                  >
                    <i className={`fas fa-key ${token ? 'text-green-600' : 'text-gray-500'}`}></i>
                    {token ? 'Linked' : 'Gmail'}
                  </button>
                  <button 
                    disabled={!token || isScanning}
                    onClick={scanInbox}
                    className="win95-button !py-1 flex items-center gap-2 text-[10px] sm:text-[11px] disabled:opacity-50"
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
               {isScanning ? 'Scanning...' : emails.length > 0 ? `${emails.length} items` : '(empty)'}
             </div>
             <div className="win95-inset px-2 w-28 md:w-40 flex items-center gap-2 justify-center">
               <div className={`w-2 h-2 rounded-full ${token ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-gray-400'}`}></div>
               <span className="truncate">{token ? 'Online' : 'Offline'}</span>
             </div>
          </div>
        </div>
      </div>

      {isConnectModalOpen && (
        <ConnectModal 
          onConnect={handleConnect} 
          onClose={() => setIsConnectModalOpen(false)} 
        />
      )}

      {isAddModalOpen && (
        <AddEmailModal 
          onClose={() => setIsAddModalOpen(false)} 
          onAdd={handleManualAdd} 
        />
      )}

      {activeFollowUp && (
        <FollowUpWizard 
          item={{
            id: activeFollowUp.id,
            recipientName: activeFollowUp.recipientName,
            recipientEmail: activeFollowUp.recipientEmail,
            subject: activeFollowUp.subject,
            sentAt: activeFollowUp.lastActivityAt,
            lastReplyAt: null,
            threadId: ''
          }} 
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
          Sentinal v1.3 {isTestMode ? '(Test Mode)' : ''}
        </div>
        <div className="flex-grow"></div>
        <div className="win95-inset h-7 px-2 md:px-3 flex items-center gap-2 text-[11px]">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
};

export default App;
