
import React, { useState, useEffect, useCallback } from 'react';
import { EmailTracking, DashboardStats, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import FollowUpWizard from './components/FollowUpWizard';
import ConnectModal from './components/ConnectModal';
import AddEmailModal from './components/AddEmailModal';
import PrivacyPolicy from './components/PrivacyPolicy';
import TermsOfService from './components/TermsOfService';
import { discoverSentLeads, getLatestReply, initGmailAuth } from './services/gmailService';

const CLIENT_ID = '911936835748-bpnpgp9u1hshhbrpqsn57blq1gt478ep.apps.googleusercontent.com';

const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000;
const MAX_FOLLOW_UPS = 3;

const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailTracking[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(!localStorage.getItem('gmail_token'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<EmailTracking | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  
  // Simple Client-Side Path Routing
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    setIsStartMenuOpen(false);
    window.scrollTo(0, 0);
  };

  const stats: DashboardStats = {
    active: emails.filter(e => e.status === 'WAITING').length,
    followupsNeeded: emails.filter(e => e.status === 'NEEDS_FOLLOW_UP').length,
    replied: emails.filter(e => e.status === 'REPLIED').length,
    discarded: emails.filter(e => e.status === 'DISCARDED').length,
    pendingCount: 0
  };

  const scanInbox = useCallback(async () => {
    if (!token) return;
    setIsScanning(true);
    try {
      const sentLeads = await discoverSentLeads(token);
      const now = Date.now();
      
      const updatedEntries = await Promise.all(sentLeads.map(async (lead) => {
        const existing = emails.find(e => e.recipientEmail === lead.recipientEmail);
        const reply = await getLatestReply(token, lead.recipientEmail, lead.sentAt);
        
        const lastActivity = existing ? existing.lastActivityAt : lead.sentAt;
        const followUpCount = existing ? existing.followUpCount : 0;
        const timeSinceLastActivity = now - lastActivity;

        let status: 'WAITING' | 'NEEDS_FOLLOW_UP' | 'REPLIED' | 'DISCARDED' = 'WAITING';

        if (reply) {
          status = 'REPLIED';
        } else if (followUpCount >= MAX_FOLLOW_UPS) {
          status = 'DISCARDED';
        } else if (timeSinceLastActivity >= FOLLOW_UP_DELAY_MS) {
          status = 'NEEDS_FOLLOW_UP';
        }

        const history: HistoryItem[] = existing ? existing.history : [{
          id: Math.random().toString(36).substr(2, 9),
          type: 'initial',
          date: lead.sentAt,
          content: lead.body || 'Discovered in Gmail Sent items',
          subject: lead.subject
        }];

        if (reply && !history.find(h => h.date === reply.date)) {
          history.push({
            id: Math.random().toString(36).substr(2, 9),
            type: 'reply',
            date: reply.date,
            content: reply.content
          });
        }

        return {
          id: lead.recipientEmail,
          recipientName: lead.recipientName,
          recipientEmail: lead.recipientEmail,
          subject: lead.subject,
          lastActivityAt: reply ? reply.date : lastActivity,
          status: status,
          followUpCount: followUpCount,
          history: history,
          threadId: lead.threadId
        } as EmailTracking;
      }));

      setEmails(updatedEntries);
      setLastScanTime(new Date());
    } catch (e) {
      console.error("Scan error:", e);
    } finally {
      setIsScanning(false);
    }
  }, [token, emails]);

  useEffect(() => {
    if (token) scanInbox();
    const interval = setInterval(() => { if (token) scanInbox(); }, 3600000);
    return () => clearInterval(interval);
  }, [token]);

  const handleConnect = () => {
    initGmailAuth(CLIENT_ID, (t) => {
      setToken(t);
      localStorage.setItem('gmail_token', t);
      setIsConnectModalOpen(false);
    });
  };

  const StartMenu = () => (
    <div className="fixed bottom-10 left-0 w-64 win95-outset z-[500] flex animate-in slide-in-from-bottom-2 duration-100">
      <div className="w-8 bg-[#808080] flex items-end justify-center py-4 shrink-0 overflow-hidden">
        <span className="text-white font-bold text-lg tracking-[0.2em] whitespace-nowrap -rotate-90 origin-center mb-16 opacity-40 select-none uppercase">
          Sentinal
        </span>
      </div>
      <div className="flex-grow py-1 bg-[#c0c0c0] shadow-inner">
        <button onClick={() => navigate('/')} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-[#000080] hover:text-white text-[12px] group">
          <i className="fas fa-desktop text-blue-700 w-4 group-hover:text-white"></i>
          <span>Main Desktop</span>
        </button>
        <div className="h-[1px] bg-gray-500 my-1 mx-2"></div>
        <button onClick={() => navigate('/privacy')} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-[#000080] hover:text-white text-[12px] group">
          <i className="fas fa-user-shield text-green-700 w-4 group-hover:text-white"></i>
          <span>Privacy Policy</span>
        </button>
        <button onClick={() => navigate('/terms')} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-[#000080] hover:text-white text-[12px] group">
          <i className="fas fa-balance-scale text-orange-700 w-4 group-hover:text-white"></i>
          <span>Terms of Service</span>
        </button>
        <div className="h-[1px] bg-gray-400 my-1 mx-2"></div>
        <button onClick={() => window.location.reload()} className="w-full text-left px-4 py-2 flex items-center gap-3 hover:bg-[#000080] hover:text-white text-[12px] group">
          <i className="fas fa-power-off text-red-700 w-4 group-hover:text-white"></i>
          <span>Shut Down</span>
        </button>
      </div>
    </div>
  );

  // Router View Selection
  if (currentPath === '/privacy') {
    return <PrivacyPolicy onBack={() => navigate('/')} />;
  }
  if (currentPath === '/terms') {
    return <TermsOfService onBack={() => navigate('/')} />;
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-[#008080] overflow-hidden">
      <div className="p-2 md:p-8 flex-1 overflow-hidden flex items-start justify-center">
        {/* Main Application Window */}
        <div className="win95-outset w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in duration-300 h-full max-h-[calc(100vh-120px)] relative">
          <div className="win95-titlebar h-7 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <i className="fas fa-shield-alt text-[10px]"></i>
              <span className="truncate uppercase font-bold">Sentinal Email Assistant</span>
            </div>
            <div className="flex gap-1 h-full py-1">
               <button className="win95-close !w-4 !h-4">_</button>
               <button className="win95-close !w-4 !h-4">□</button>
               <button onClick={() => window.location.reload()} className="win95-close !w-4 !h-4">x</button>
            </div>
          </div>

          <div className="bg-[#c0c0c0] p-2 md:p-4 space-y-4 flex flex-col flex-grow overflow-hidden">
            <div className="flex flex-wrap gap-2 justify-between items-center shrink-0">
              <button onClick={() => setIsAddModalOpen(true)} className="win95-button flex items-center gap-2 font-bold px-4">
                <i className="fas fa-plus-circle text-green-700"></i>
                <span>Add New Lead</span>
              </button>
              
              <div className="win95-outset px-3 py-1 flex items-center gap-3">
                <span className="text-[10px] font-bold uppercase">Evaluation Window:</span>
                <div className="bg-[#dfdfdf] px-2 py-[2px] win95-inset text-[10px] font-bold text-blue-900">
                  24 HOURS (STRICT)
                </div>
              </div>
            </div>

            <div className="shrink-0">
              <Dashboard stats={stats} total={emails.length} />
            </div>

            <div className="space-y-2 flex flex-col flex-grow overflow-hidden">
              <div className="flex flex-wrap justify-between items-center px-1 gap-2 shrink-0">
                <div className="flex items-center gap-2 font-bold text-sm uppercase">
                  <i className="fas fa-folder-open text-[#d4a017]"></i>
                  <span>Outreach Tracking</span>
                  {lastScanTime && (
                    <span className="text-[10px] font-normal text-gray-600 ml-2 italic lowercase">
                      Updated: {lastScanTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setIsConnectModalOpen(true)} className="win95-button !py-1 flex items-center gap-2 text-[11px]">
                    <i className={`fas fa-key ${token ? 'text-green-600' : 'text-gray-500'}`}></i>
                    {token ? 'Active' : 'Login'}
                  </button>
                  <button disabled={!token || isScanning} onClick={scanInbox} className="win95-button !py-1 flex items-center gap-2 text-[11px] disabled:opacity-50 min-w-[100px]">
                    <i className={`fas fa-sync-alt ${isScanning ? 'animate-spin' : ''}`}></i>
                    {isScanning ? 'Syncing...' : 'Sync Gmail'}
                  </button>
                </div>
              </div>

              <div className="flex-grow min-h-0 flex flex-col bg-white win95-inset">
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

          {/* Persistent Legal Navigation Bar */}
          <div className="bg-[#c0c0c0] border-t border-gray-500 p-1 flex justify-between text-[11px] text-gray-700 shrink-0 select-none">
             <div className="win95-inset px-2 flex-1 h-5 flex items-center truncate text-[10px]">
               {isScanning ? 'Accessing Gmail secure protocols...' : `System tracking ${emails.filter(e => e.status !== 'DISCARDED').length} active records.`}
             </div>
             <div className="win95-inset px-2 flex items-center gap-3 text-[10px] font-bold">
               <button onClick={() => navigate('/privacy')} className="hover:text-blue-800 underline active:text-red-600">Privacy Policy</button>
               <div className="w-[1px] h-3 bg-gray-500"></div>
               <button onClick={() => navigate('/terms')} className="hover:text-blue-800 underline active:text-red-600">Terms of Use</button>
               <div className="w-[1px] h-3 bg-gray-500"></div>
               <span className="text-gray-500 font-normal">v1.5 FINAL</span>
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
          item={{
            id: activeFollowUp.id,
            recipientName: activeFollowUp.recipientName,
            recipientEmail: activeFollowUp.recipientEmail,
            subject: activeFollowUp.subject,
            sentAt: activeFollowUp.lastActivityAt,
            lastReplyAt: null,
            threadId: (activeFollowUp as any).threadId || ''
          }} 
          onClose={() => setActiveFollowUp(null)}
          onComplete={() => { scanInbox(); setActiveFollowUp(null); }}
        />
      )}

      {/* Taskbar */}
      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-[450] shrink-0 shadow-lg">
        <div className="relative">
          {isStartMenuOpen && <StartMenu />}
          <button 
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`win95-button flex items-center gap-2 font-bold !px-3 !py-1 h-8 ${isStartMenuOpen ? 'border-top-[#000] border-left-[#000] border-right-[#fff] border-bottom-[#fff]' : ''}`}
          >
            <img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Windows_logo_1992.vide.png" className="h-4" alt="Start" />
            <span className="text-[13px]">Start</span>
          </button>
        </div>
        <div className="w-[2px] h-7 bg-gray-500 mx-2 border-r border-white"></div>
        <button 
          onClick={() => { navigate('/'); }}
          className={`win95-inset h-8 px-4 flex items-center text-[11px] bg-[#dfdfdf] font-bold truncate transition-all ${currentPath === '/' ? 'bg-[#dfdfdf]' : 'bg-[#c0c0c0] win95-outset shadow-none'}`}
        >
          <i className="fas fa-envelope-open-text mr-2 text-blue-800"></i>
          Sentinal.exe
        </button>
        <div className="flex-grow"></div>
        <div className="win95-inset h-8 px-4 flex items-center gap-2 text-[11px] bg-[#c0c0c0]">
          <i className="fas fa-volume-up opacity-40"></i>
          <span className="font-mono">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      
      {isStartMenuOpen && <div className="fixed inset-0 z-[400]" onClick={() => setIsStartMenuOpen(false)} />}
    </div>
  );
};

export default App;
