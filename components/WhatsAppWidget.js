// components/WhatsAppWidget.js - Custom Implementation
'use client';

import React, { useState } from 'react';

const WhatsAppWidget = ({
  phoneNumber = "1234567890", // Replace with your actual phone number
  companyName = "Support",
  message = "Hello! 👋🏼 \n\nWhat can we do for you?",
  replyTimeText = "Typically replies within a day",
  sendButtonText = "Send",
  inputPlaceHolder = "Type a message",
  open = false
}) => {
  const [isOpen, setIsOpen] = useState(open);
  const [userMessage, setUserMessage] = useState('');

  // WhatsApp icon component
  const WhatsAppIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382C17.352 14.322 16.806 14.049 16.688 14.007C16.57 13.965 16.487 13.944 16.404 14.064C16.321 14.184 16.124 14.438 16.058 14.521C15.992 14.604 15.926 14.613 15.806 14.553C15.686 14.493 15.297 14.36 14.836 13.944C14.478 13.615 14.241 13.211 14.175 13.091C14.109 12.971 14.169 12.907 14.229 12.847C14.283 12.793 14.349 12.709 14.409 12.643C14.469 12.577 14.49 12.529 14.532 12.446C14.574 12.363 14.553 12.297 14.523 12.237C14.493 12.177 14.241 11.631 14.141 11.391C14.043 11.16 13.944 11.188 13.87 11.184C13.8 11.18 13.717 11.18 13.634 11.18C13.551 11.18 13.413 11.209 13.295 11.329C13.177 11.449 12.886 11.722 12.886 12.268C12.886 12.814 13.313 13.342 13.373 13.425C13.433 13.508 14.241 14.821 15.554 15.286C15.914 15.431 16.194 15.518 16.412 15.577C16.772 15.685 17.102 15.668 17.362 15.634C17.652 15.595 18.086 15.355 18.186 15.089C18.286 14.823 18.286 14.595 18.256 14.553C18.226 14.511 18.143 14.481 18.023 14.421L17.472 14.382ZM12.012 21.633C10.315 21.633 8.655 21.142 7.228 20.221L6.906 20.034L3.678 20.888L4.547 17.764L4.34 17.428C3.336 15.958 2.8 14.226 2.8 12.435C2.8 6.858 7.321 2.337 12.898 2.337C15.595 2.337 18.139 3.382 20.034 5.278C21.929 7.173 22.975 9.717 22.975 12.414C22.975 17.991 18.454 22.512 12.877 22.512L12.012 21.633ZM20.556 3.841C18.341 1.626 15.414 0.4 12.335 0.4C5.684 0.4 0.267 5.817 0.267 12.468C0.267 14.567 0.832 16.615 1.898 18.398L0.133 23.6L5.484 21.878C7.199 22.857 9.157 23.376 11.153 23.376C17.804 23.376 23.221 17.959 23.221 11.308C23.221 8.229 21.995 5.302 19.78 3.087L20.556 3.841Z"/>
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

  const openWhatsApp = () => {
    const encodedMessage = encodeURIComponent(message + (userMessage ? `\n\n${userMessage}` : ''));
    
    // Try multiple WhatsApp URL options
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    let whatsappUrl;
    
    if (isMobile) {
      // For mobile devices, try the app first, then web
      whatsappUrl = `whatsapp://send?phone=${phoneNumber}&text=${encodedMessage}`;
      
      // Fallback to web version if app doesn't open
      setTimeout(() => {
        window.open(`https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`, '_blank');
      }, 2000);
    } else {
      // For desktop, use web WhatsApp directly
      whatsappUrl = `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;
    }
    
    try {
      window.open(whatsappUrl, '_blank');
    } catch (error) {
      // Fallback: copy number and message to clipboard
      navigator.clipboard.writeText(`WhatsApp: ${phoneNumber}\nMessage: ${message + (userMessage ? `\n\n${userMessage}` : '')}`);
      alert('WhatsApp link failed. Phone number and message copied to clipboard!');
    }
  };

  const handleSendMessage = () => {
    openWhatsApp();
    setUserMessage('');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <WhatsAppIcon />
              </div>
              <div>
                <h3 className="font-semibold text-sm">{companyName}</h3>
                <p className="text-xs opacity-90">{replyTimeText}</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
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
              {sendButtonText} to start chatting on WhatsApp
            </p>
          </div>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-[#25D366] text-white w-14 h-14 rounded-full shadow-lg hover:bg-[#128C7E] transition-all duration-300 hover:scale-110 flex items-center justify-center relative group"
      >
        <WhatsAppIcon />
        
        {/* Pulse animation */}
        <div className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></div>
        
        {/* Tooltip */}
        <div className="absolute left-full ml-3 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with us
        </div>
      </button>
    </div>
  );
};

export default WhatsAppWidget;