
import React from 'react';
import { FollowUpItem } from '../types';

interface Props {
  items: FollowUpItem[];
  onAction: (item: FollowUpItem) => void;
}

const FollowUpInbox: React.FC<Props> = ({ items, onAction }) => {
  if (items.length === 0) {
    return (
      <div className="win95-inset bg-white p-24 text-center space-y-4">
         <div className="text-4xl">📭</div>
         <h2 className="text-lg font-bold">All caught up!</h2>
         <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
            Sentinal couldn't find any sent emails older than 24 hours that are still waiting for a reply.
         </p>
      </div>
    );
  }

  return (
    <div className="win95-inset bg-white min-h-[400px]">
      <div className="flex text-[11px] font-bold bg-[#dfdfdf] border-b border-gray-400 p-1 sticky top-0 z-10 shadow-sm">
        <div className="w-1/3 border-r border-gray-400 px-3 py-1">Contact Name</div>
        <div className="flex-1 border-r border-gray-400 px-3 py-1">Context / Subject</div>
        <div className="w-40 border-r border-gray-400 px-3 py-1">Time Elapsed</div>
        <div className="w-32 px-3 py-1 text-right">Command</div>
      </div>
      
      <div className="flex flex-col">
        {items.map(item => {
          const hoursAgo = Math.floor((Date.now() - item.sentAt) / (1000 * 60 * 60));
          const daysAgo = Math.floor(hoursAgo / 24);

          return (
            <div key={item.id} className="flex items-center p-2 border-b border-gray-100 hover:bg-[#000080] hover:text-white group cursor-default">
              <div className="w-1/3 px-2">
                <div className="font-bold text-[12px] flex items-center gap-2">
                   <i className="fas fa-user-circle text-gray-400 group-hover:text-white"></i>
                   {item.recipientName}
                </div>
                <div className="text-[10px] opacity-60 truncate pl-6">{item.recipientEmail}</div>
              </div>
              <div className="flex-1 px-2">
                <div className="text-[11px] truncate italic">"{item.subject}"</div>
              </div>
              <div className="w-40 px-2 text-[11px]">
                {daysAgo > 0 ? `${daysAgo} day${daysAgo > 1 ? 's' : ''} ago` : `${hoursAgo} hours ago`}
              </div>
              <div className="w-32 px-2 text-right">
                <button 
                  onClick={() => onAction(item)}
                  className="win95-button font-bold !text-[11px] group-hover:!text-black"
                >
                  Draft Follow-up
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FollowUpInbox;
