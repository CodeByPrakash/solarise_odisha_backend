import React, { useState } from 'react';
import { openWhatsAppChat, WHATSAPP_TEMPLATES, CONSUMER_FRIENDLY_STATUS } from '../utils/whatsappHelper';

export const WhatsAppShareButton = ({ consumerName, phone, projectCode, statusName, capacityKw, className = '' }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('STATUS');
  const [customMsg, setCustomMsg] = useState('');

  const statusInfo = CONSUMER_FRIENDLY_STATUS[statusName] || {
    label: (statusName || 'In Progress').replace(/_/g, ' ').toUpperCase(),
    detail: 'Project status update in progress.',
  };

  const defaultMsg = WHATSAPP_TEMPLATES.PROJECT_STATUS_UPDATE({
    consumerName: consumerName || 'Valued Consumer',
    projectCode: projectCode || 'PROJ',
    statusName: statusName || 'new_registration',
    capacityKw: capacityKw || 3,
  });

  const handleSend = () => {
    let msgToSend = defaultMsg;
    if (selectedTemplate === 'DELIVERY') {
      msgToSend = WHATSAPP_TEMPLATES.MATERIAL_DELIVERED({ consumerName, projectCode });
    } else if (selectedTemplate === 'NET_METER') {
      msgToSend = WHATSAPP_TEMPLATES.NET_METERING_COMPLETE({ consumerName, projectCode });
    } else if (selectedTemplate === 'CUSTOM' && customMsg.trim()) {
      msgToSend = customMsg;
    }

    openWhatsAppChat(phone, msgToSend);
    setShowModal(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className={`inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-2 rounded-xl shadow-md hover:shadow-lg transition-all focus:outline-none ${className}`}
        title="Send progress update on WhatsApp"
      >
        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
        <span>WhatsApp</span>
      </button>

      {/* Template Selection Modal */}
      {showModal && (
        <div className="fixed inset-0 z-999 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <div className="flex items-center space-x-2">
                <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                  <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm">Send WhatsApp Progress Update</h3>
                  <p className="text-[11px] text-slate-500 font-medium">To: {consumerName || 'Consumer'} ({phone})</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            {/* Template Options */}
            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Choose Consumer WhatsApp Message:</label>

              <div
                onClick={() => setSelectedTemplate('STATUS')}
                className={`p-3 rounded-xl border cursor-pointer transition ${selectedTemplate === 'STATUS' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="font-bold text-emerald-900">📊 {statusInfo.label}</div>
                <div className="text-[11px] text-slate-600 mt-1 leading-relaxed">{statusInfo.detail}</div>
              </div>

              <div
                onClick={() => setSelectedTemplate('DELIVERY')}
                className={`p-3 rounded-xl border cursor-pointer transition ${selectedTemplate === 'DELIVERY' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="font-bold text-emerald-800">📦 Material Delivery Notice</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Notifies consumer that panels/inverter materials arrived.</div>
              </div>

              <div
                onClick={() => setSelectedTemplate('NET_METER')}
                className={`p-3 rounded-xl border cursor-pointer transition ${selectedTemplate === 'NET_METER' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="font-bold text-emerald-800">🎉 Net Metering Commissioned</div>
                <div className="text-[11px] text-slate-600 mt-0.5">Celebratory message for DISCOM grid connection.</div>
              </div>

              <div
                onClick={() => setSelectedTemplate('CUSTOM')}
                className={`p-3 rounded-xl border cursor-pointer transition ${selectedTemplate === 'CUSTOM' ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}
              >
                <div className="font-bold text-emerald-800">✍️ Custom Message</div>
                {selectedTemplate === 'CUSTOM' && (
                  <textarea
                    rows={3}
                    value={customMsg}
                    onChange={(e) => setCustomMsg(e.target.value)}
                    placeholder="Type custom update for consumer..."
                    className="w-full mt-2 p-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-2 border-t">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md"
              >
                Open WhatsApp →
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
