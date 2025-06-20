// components/WhatsAppWidget.js - Fixed Version (No useEffect Issues)
'use client';

import React, { useState } from 'react';

const WhatsAppWidget = ({
  phoneNumber = "1234567890",
  companyName = "Support",
  message = "Hello! 👋🏼 \n\nWhat can we do for you?",
  replyTimeText = "Typically replies within a day",
  sendButtonText = "Send",
  inputPlaceHolder = "Type a message",
  open = false
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [userMessage, setUserMessage] = useState('');
  const [showInstructions, setShowInstructions] = useState(false);

  // Simple mobile detection function (called when needed, not in useEffect)
  const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    return /android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i.test(userAgent.toLowerCase());
  };

  // WHITE WhatsApp icon - exact same shape but white
  const WhiteWhatsAppIcon = ({ size = 60 }) => (
    <svg width={size} height={size} viewBox="0 0 256 256" fill="none">
      {/* White circle background */}
      <circle cx="128" cy="128" r="128" fill="white"/>
      {/* Green speech bubble + phone icon */}
      <path d="M128.014 42C78.103 42 37.754 82.351 37.754 132.261c0 16.188 4.267 31.366 11.727 44.504l-12.5 45.66 46.727-12.253c12.633 6.953 27.03 10.913 42.306 10.913 49.911 0 90.26-40.351 90.26-90.261S177.925 42 128.014 42zm50.984 127.914c-2.117 5.956-10.537 10.955-17.402 12.376-4.51 0.931-10.39 1.684-30.128-6.295-21.242-9.204-35.348-30.077-36.426-31.479-1.078-1.403-8.738-11.552-8.738-22.025 0-10.472 5.531-15.663 7.493-17.802 1.962-2.14 4.279-2.672 5.707-2.672s2.848 0.063 4.096 0.118c1.313 0.063 3.074-0.497 4.802 3.666 1.738 4.163 5.907 14.422 6.421 15.467 0.514 1.044 0.857 2.295 0.172 3.694-0.686 1.399-1.029 2.265-2.062 3.508-1.034 1.244-2.174 2.776-3.108 3.726-1.034 1.058-2.109 2.198-0.907 4.302 1.201 2.104 5.35 8.888 11.483 14.395 7.896 7.088 14.552 9.294 16.634 10.338 2.081 1.044 3.298 0.872 4.507-0.531 1.209-1.403 5.182-5.97 6.565-8.024 1.383-2.054 2.766-1.713 4.644-1.029 1.878 0.685 11.913 5.617 13.948 6.642 2.034 1.025 3.391 1.537 3.906 2.391 0.514 0.854 0.514 4.943-1.202 9.706z" fill="#25D366"/>
    </svg>
  );

  // Close icon
  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
    </svg>
  );

  // Better send icon - paper plane style
  const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
    </svg>
  );

  // Alternative send icon - arrow style
  const SendArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"></line>
      <polygon points="22,2 15,22 11,13 2,9 22,2"></polygon>
    </svg>
  );

  // Copy icon
  const CopyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
    </svg>
  );

  // Phone icon
  const PhoneIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122L9.98 10.63c-.142.062-.3.055-.438-.02L7.05 8.122a.678.678 0 0 1-.02-.438l.2-1.805a.678.678 0 0 0-.122-.58L5.314 3.014a.678.678 0 0 0-.66-.686z"/>
    </svg>
  );

  const formatPhoneNumber = (phone) => {
    if (phone.length >= 10) {
      const country = phone.substring(0, phone.length - 10);
      const area = phone.substring(phone.length - 10, phone.length - 7);
      const first = phone.substring(phone.length - 7, phone.length - 4);
      const last = phone.substring(phone.length - 4);
      return `+${country} ${area} ${first} ${last}`;
    }
    return phone;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Copied to clipboard!');
    }
  };

  const openWhatsApp = () => {
    const fullMessage = message + (userMessage ? `\n\n${userMessage}` : '');
    const encodedMessage = encodeURIComponent(fullMessage);
    const isMobile = isMobileDevice(); // Call function when needed
    
    if (isMobile) {
      // Mobile: Try app first, then web as fallback
      try {
        // Try to open WhatsApp app
        window.location.href = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
        
        // Fallback to web after short delay if app doesn't open
        setTimeout(() => {
          window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        }, 1500);
      } catch (error) {
        // Direct fallback to web
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
      }
    } else {
      // PC: Show instructions for WhatsApp Web
      setShowInstructions(true);
    }
  };

  const openWhatsAppWeb = () => {
    const fullMessage = message + (userMessage ? `\n\n${userMessage}` : '');
    const encodedMessage = encodeURIComponent(fullMessage);
    const webUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    window.open(webUrl, '_blank');
    setShowInstructions(false);
    setIsOpen(false);
    setUserMessage('');
  };

  const handleSendMessage = () => {
    openWhatsApp();
    const isMobile = isMobileDevice();
    if (isMobile) {
      setUserMessage('');
      setIsOpen(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setShowInstructions(false);
  };

  // Get device type for display purposes
  const isMobile = isMobileDevice();

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* PC Instructions Modal */}
      {showInstructions && (
        <div className="mb-4 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <h3 className="font-semibold text-sm">WhatsApp Options for PC</h3>
            <button onClick={() => setShowInstructions(false)} className="text-white/80 hover:text-white">
              <CloseIcon />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800 mb-2">
                <strong>Option 1: WhatsApp Web (Recommended)</strong>
              </p>
              <p className="text-xs text-blue-600 mb-3">
                Opens WhatsApp in your browser. You'll need to scan a QR code with your phone.
              </p>
              <button
                onClick={openWhatsAppWeb}
                className="w-full bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center space-x-2"
              >
                <WhiteWhatsAppIcon size={20} />
                <span>Open WhatsApp Web</span>
              </button>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <p className="text-sm text-gray-800 mb-2">
                <strong>Option 2: Copy Details</strong>
              </p>
              
              <button
                onClick={() => copyToClipboard(phoneNumber)}
                className="w-full p-2 bg-white border border-gray-300 rounded flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <PhoneIcon />
                  <span className="text-sm">{formatPhoneNumber(phoneNumber)}</span>
                </div>
                <CopyIcon />
              </button>
              
              <button
                onClick={() => copyToClipboard(message + (userMessage ? `\n\n${userMessage}` : ''))}
                className="w-full p-2 bg-white border border-gray-300 rounded flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-sm">Copy Message</span>
                </div>
                <CopyIcon />
              </button>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                💡 <strong>Tip:</strong> For best experience on PC, make sure WhatsApp is installed on your phone and connected to internet.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Chat Window */}
      {isOpen && !showInstructions && (
        <div className="mb-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <WhiteWhatsAppIcon size={40} />
              <div>
                <h3 className="font-semibold text-sm">{companyName}</h3>
                <p className="text-xs opacity-90">{replyTimeText}</p>
                {!isMobile && (
                  <p className="text-xs opacity-75">💻 PC detected</p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <CloseIcon />
            </button>
          </div>

          {/* Message Area */}
          <div className="p-4 bg-gray-50 border-b">
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <p className="text-sm text-gray-700 whitespace-pre-line">{message}</p>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={userMessage}
                onChange={(e) => setUserMessage(e.target.value)}
                placeholder={inputPlaceHolder}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                className="bg-[#25D366] text-white px-4 py-2 rounded-lg hover:bg-[#128C7E] transition-colors flex items-center justify-center min-w-[44px]"
              >
                <SendIcon />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isMobile ? 
                "Click send to open WhatsApp app" : 
                "Click send for WhatsApp options"
              }
            </p>
          </div>
        </div>
      )}

      {/* Floating Button - White WhatsApp Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center relative group"
      >
        <WhiteWhatsAppIcon size={64} />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {isMobile ? "Chat on WhatsApp" : "Contact us"}
        </div>
      </button>
    </div>
  );
};

export default WhatsAppWidget;