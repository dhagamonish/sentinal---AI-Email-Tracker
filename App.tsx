
import React, { useState, useEffect, useCallback } from 'react';
import { EmailTracking, DashboardStats, HistoryItem } from './types';
import Dashboard from './components/Dashboard';
import EmailList from './components/EmailList';
import FollowUpWizard from './components/FollowUpWizard';
import ConnectModal from './components/ConnectModal';
import AddEmailModal from './components/AddEmailModal';
import { discoverSentLeads, getLatestReply, initGmailAuth } from './services/gmailService';

const CLIENT_ID = '911936835748-bpnpgp9u1hshhbrpqsn57blq1gt478ep.apps.googleusercontent.com';

// PRODUCTION CONSTANTS
const FOLLOW_UP_DELAY_MS = 24 * 60 * 60 * 1000; // 24 Hours
const MAX_FOLLOW_UPS = 3; // Stop tracking after 3 follow-ups

const App: React.FC = () => {
  const [emails, setEmails] = useState<EmailTracking[]>([]);
  const [token, setToken] = useState<string | null>(localStorage.getItem('gmail_token'));
  const [isScanning, setIsScanning] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(!localStorage.getItem('gmail_token'));
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeFollowUp, setActiveFollowUp] = useState<EmailTracking | null>(null);
  const [lastScanTime, setLastScanTime] = useState<Date | null>(null);

  const stats: DashboardStats = {
    active: emails.filter(e => e.status === 'WAITING').length,
    followupsNeeded: emails.filter(e => e.status === 'NEEDS_FOLLOW_UP').length,
    replied: emails.filter(e => e.status === 'REPLIED').length,
    discarded: emails.filter(e => e.status === 'DISCARDED').length,
    pendingCount: 0
  };

  /**
   * Production Scanning Logic:
   * 1. Discover recent sent emails.
   * 2. Check for replies.
   * 3. Evaluate age against the 24h window.
   * 4. Apply anti-spam limit (MAX_FOLLOW_UPS).
   */
  const scanInbox = useCallback(async () => {
    if (!token) return;
    setIsScanning(true);
    try {
      const sentLeads = await discoverSentLeads(token);
      const now = Date.now();
      
      // Merge discovered leads with existing state to preserve followUpCount
      const updatedEntries = await Promise.all(sentLeads.map(async (lead) => {
        const existing = emails.find(e => e.recipientEmail === lead.recipientEmail);
        const reply = await getLatestReply(token, lead.recipientEmail, lead.sentAt);
        
        // Base timestamps
        const lastActivity = existing ? existing.lastActivityAt : lead.sentAt;
        const followUpCount = existing ? existing.followUpCount : 0;
        const timeSinceLastActivity = now - lastActivity;

        // Determine Status
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
    // Re-run scan every hour to update "Needs Follow Up" status automatically
    const interval = setInterval(() => {
        if (token) scanInbox();
    }, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  const handleConnect = () => {
    initGmailAuth(CLIENT_ID, (t) => {
      setToken(t);
      localStorage.setItem('gmail_token', t);
      setIsConnectModalOpen(false);
    });
  };

  const handleFollowUpComplete = () => {
    if (!activeFollowUp) return;
    
    // Update local state immediately after sending follow-up
    setEmails(prev => prev.map(e => {
      if (e.id === activeFollowUp.id) {
        return {
          ...e,
          status: 'WAITING',
          lastActivityAt: Date.now(),
          followUpCount: e.followUpCount + 1,
          history: [...e.history, {
            id: Math.random().toString(36).substr(2, 9),
            type: 'followup',
            date: Date.now(),
            content: `Follow-up #${e.followUpCount + 1} sent via Sentinal.`
          }]
        };
      }
      return e;
    }));
    
    setActiveFollowUp(null);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#008080]">
      <div className="p-2 md:p-8 flex-grow overflow-auto pb-12">
        <div className="win95-outset w-full max-w-6xl mx-auto shadow-2xl overflow-hidden flex flex-col">
          <div className="win95-titlebar h-7 shrink-0">
            <div className="flex items-center gap-2 truncate">
              <div className="w-3 h-3 bg-red-600 rounded-full border border-black/20"></div>
              <span className="truncate">Sentinal Email Assistant</span>
            </div>
            <div className="flex gap-1 h-full py-1">
               <button className="win95-close !w-4 !h-4">_</button>
               <button className="win95-close !w-4 !h-4">□</button>
               <button onClick={() => window.location.reload()} className="win95-close !w-4 !h-4">x</button>
            </div>
          </div>

          <div className="bg-[#c0c0c0] p-2 md:p-4 space-y-4 flex-grow">
            <div className="flex flex-wrap gap-2 justify-between items-center">
              <button 
                onClick={() => setIsAddModalOpen(true)}
                className="win95-button flex items-center gap-2 font-bold px-4"
              >
                <i className="fas fa-user-plus text-green-700"></i>
                <span>Add New Lead</span>
              </button>
              
              <div className="win95-outset px-3 py-1 flex items-center gap-3">
                <span className="text-[10px] font-bold">Evaluation Window:</span>
                <div className="bg-[#dfdfdf] px-2 py-[2px] win95-inset text-[10px] font-bold text-blue-900">
                  24 HOURS (STRICT)
                </div>
              </div>
            </div>

            <Dashboard stats={stats} total={emails.length} />

            <div className="space-y-2 flex flex-col">
              <div className="flex flex-wrap justify-between items-center px-1 gap-2">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <i className="fas fa-folder-open text-[#d4a017]"></i>
                  <span>Outreach Tracking</span>
                  {lastScanTime && (
                    <span className="text-[10px] font-normal text-gray-600 ml-2">
                      Synced: {lastScanTime.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsConnectModalOpen(true)}
                    className="win95-button !py-1 flex items-center gap-2 text-[11px]"
                  >
                    <i className={`fas fa-key ${token ? 'text-green-600' : 'text-gray-500'}`}></i>
                    {token ? 'Active' : 'Gmail'}
                  </button>
                  <button 
                    disabled={!token || isScanning}
                    onClick={scanInbox}
                    className="win95-button !py-1 flex items-center gap-2 text-[11px] disabled:opacity-50 min-w-[80px]"
                  >
                    <i className={`fas fa-sync-alt ${isScanning ? 'animate-spin' : ''}`}></i>
                    {isScanning ? 'Syncing...' : 'Sync Now'}
                  </button>
                </div>
              </div>

              <div className="h-[450px]">
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
               {isScanning ? 'Scanning Gmail for replies...' : `Tracking ${emails.filter(e => e.status !== 'DISCARDED').length} active leads`}
             </div>
             <div className="win95-inset px-2 w-56 flex items-center gap-2 justify-center font-bold">
               <span className="text-gray-600 uppercase tracking-tighter">
                 Production Mode (v1.5)
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
          onComplete={handleFollowUpComplete}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 h-10 bg-[#c0c0c0] border-t-2 border-white flex items-center px-1 z-[300]">
        <button className="win95-button flex items-center gap-2 font-bold !px-3 !py-1 h-7">
          <img src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Windows_logo_1992.vide.png" className="h-4" alt="Start" />
          <span>Start</span>
        </button>
        <div className="w-[2px] h-6 bg-gray-500 mx-1 border-r border-white"></div>
        <div className="win95-inset h-7 px-3 flex items-center text-[12px] bg-[#dfdfdf] font-bold truncate">
          Sentinal.exe
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
