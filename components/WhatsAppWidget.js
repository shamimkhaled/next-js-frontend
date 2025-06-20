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

  // Official WhatsApp icon - exact replica
  const WhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2.546 20.2a.5.5 0 0 0 .656.656l3.032-.892A9.96 9.96 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2ZM8.588 7.58c.21-.22.635-.066.93.303l.806 1.016c.196.247.198.597-.035.85l-.348.377c-.15.164-.178.4-.068.596.682 1.21 1.69 2.218 2.9 2.9.196.11.432.082.596-.068l.377-.348c.253-.233.603-.23.85-.035l1.016.806c.37.295.524.72.303.93-.65.618-1.542.84-2.403.84-2.91 0-5.26-2.35-5.26-5.26 0-.86.222-1.753.84-2.403Z" fill="currentColor"/>
    </svg>
  );

  // Real WhatsApp logo with proper bubble design
  const WhatsAppBubbleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="#25D366"/>
      <circle cx="12" cy="12" r="10" fill="#25D366"/>
      <path d="M12.04 6.42c-2.78 0-5.04 2.26-5.04 5.04 0 .9.24 1.77.69 2.52L6.21 17.2l3.32-1.4c.72.4 1.53.62 2.38.62h.002c2.78 0 5.04-2.26 5.04-5.04s-2.26-5.04-5.04-5.04zm2.52 7.2c-.1.28-.6.52-.85.59-.23.06-.53.09-1.54-.32-1.09-.47-1.82-1.53-1.88-1.6-.06-.07-.45-.59-.45-1.13s.28-.8.38-.91c.1-.11.22-.14.29-.14s.15 0 .21.01c.07 0 .16-.03.25.19.09.21.3.74.33.79.03.05.05.12.01.19-.04.07-.06.11-.11.18-.05.06-.11.14-.16.19-.05.05-.11.11-.05.22.06.11.28.47.61.76.42.37.77.49.88.54.11.05.17.04.24-.02.06-.06.27-.32.35-.43.07-.11.15-.09.25-.05.1.04.64.3.75.35.11.05.18.08.21.13.03.04.03.26-.1.61z" fill="white"/>
    </svg>
  );

  // Alternative - even more accurate WhatsApp icon
  const RealWhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 175.216 175.552">
      <defs>
        <linearGradient id="whatsapp-gradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#61fd7d"/>
          <stop offset="100%" stopColor="#2bb826"/>
        </linearGradient>
      </defs>
      <path fill="url(#whatsapp-gradient)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.908 5.881 21.23 8.906 32.695 8.914h.042c33.733 0 61.177-27.426 61.178-61.135a60.75 60.75 0 0 0-17.89-43.251 60.98 60.98 0 0 0-43.285-17.929l-.568-.009z"/>
      <path fill="url(#whatsapp-gradient)" d="M87.184 25.227c-33.733 0-61.166 27.423-61.178 61.13a60.98 60.98 0 0 0 9.349 32.535l1.455 2.313-6.179 22.558 23.146-6.069 2.235 1.324c9.908 5.881 21.23 8.906 32.695 8.914h.042c33.733 0 61.177-27.426 61.178-61.135a60.75 60.75 0 0 0-17.89-43.251 60.98 60.98 0 0 0-43.285-17.929l-.568-.009z"/>
      <path fill="#fff" fillRule="evenodd" d="M68.772 55.603c-1.378-3.061-2.828-3.123-4.137-3.176l-3.524-.043c-1.226 0-3.218.46-4.902 2.3s-6.435 6.287-6.435 15.332 6.588 17.785 7.506 19.013 12.718 20.381 31.405 27.75c15.529 6.124 18.689 4.906 22.061 4.6s10.877-4.447 12.408-8.74 1.532-7.971 1.073-8.74-1.685-1.226-3.525-2.146-10.877-5.367-12.562-5.981-2.91-.919-4.137.921-4.746 5.979-5.819 7.206-2.144 1.381-3.984.462-7.76-2.861-14.784-9.124c-5.465-4.873-9.154-10.891-10.228-12.73s-.114-2.835.808-3.751c.825-.824 1.838-2.147 2.759-3.22s1.224-1.84 1.836-3.065.307-2.301-.153-3.22-4.032-10.011-5.666-13.647"/>
    </svg>
  );

  // Close icon
  const CloseIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12.854 3.146a.5.5 0 0 0-.708 0L8 7.293 3.854 3.146a.5.5 0 1 0-.708.708L7.293 8l-4.147 4.146a.5.5 0 0 0 .708.708L8 8.707l4.146 4.147a.5.5 0 0 0 .708-.708L8.707 8l4.147-4.146a.5.5 0 0 0 0-.708z"/>
    </svg>
  );

  // Send icon
  const SendIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M15.854.146a.5.5 0 0 1 .11.54L13.026 8.47a.5.5 0 0 1-.708.296L8.5 7.5l-.5 2-1.5-1.5L8.5 5.5l3.818-1.236a.5.5 0 0 1 .536.682z"/>
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
                <div className="w-5 h-5">
                  <RealWhatsAppIcon />
                </div>
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
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center p-1">
                <RealWhatsAppIcon />
              </div>
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

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white text-white w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-110 flex items-center justify-center relative group border-4 border-white"
      >
        <div className="w-14 h-14">
          <RealWhatsAppIcon />
        </div>
        
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