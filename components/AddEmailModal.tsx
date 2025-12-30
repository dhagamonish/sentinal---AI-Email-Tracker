
import React, { useState } from 'react';
import { EmailTracking } from '../types';

interface Props {
  onClose: () => void;
  onAdd: (email: EmailTracking) => void;
}

const AddEmailModal: React.FC<Props> = ({ onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    body: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.body) return;

    const newEntry: EmailTracking = {
      id: Math.random().toString(36).substr(2, 9),
      recipientName: formData.name,
      recipientEmail: formData.email,
      subject: formData.subject,
      lastActivityAt: Date.now(),
      status: 'WAITING',
      followUpCount: 0,
      history: [{
        id: Math.random().toString(36).substr(2, 9),
        type: 'initial',
        date: Date.now(),
        content: formData.body,
        subject: formData.subject
      }]
    };

    onAdd(newEntry);
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/30" onClick={onClose}></div>
      <div className="relative win95-outset w-full max-w-md">
        <div className="win95-titlebar">
          <div className="flex items-center gap-2">
            <i className="fas fa-plus-square text-[10px]"></i>
            <span>Add New Tracking Entry</span>
          </div>
          <button onClick={onClose} className="win95-close">x</button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold mb-1">Lead Name:</label>
              <input 
                required
                type="text" 
                value={formData.name}
                onChange={e => setFormData(p => ({...p, name: e.target.value}))}
                className="win95-inset w-full px-2 py-1 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">Email:</label>
              <input 
                required
                type="email" 
                value={formData.email}
                onChange={e => setFormData(p => ({...p, email: e.target.value}))}
                className="win95-inset w-full px-2 py-1 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">Subject:</label>
            <input 
              required
              type="text" 
              value={formData.subject}
              onChange={e => setFormData(p => ({...p, subject: e.target.value}))}
              className="win95-inset w-full px-2 py-1 text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold mb-1">Email Body:</label>
            <textarea 
              required
              value={formData.body}
              onChange={e => setFormData(p => ({...p, body: e.target.value}))}
              className="win95-inset w-full h-32 px-2 py-1 text-sm outline-none resize-none"
            ></textarea>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="win95-button w-24">Cancel</button>
            <button type="submit" className="win95-button font-bold w-24">OK</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmailModal;
