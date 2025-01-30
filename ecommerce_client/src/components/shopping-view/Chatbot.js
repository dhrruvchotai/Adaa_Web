import React, { useState, useEffect, useRef } from 'react';
import useUserDetails from "../../pages/useUserDetails";
import { useNavigate } from 'react-router-dom';

const Chatbot = ({ setIsChatbotOpen }) => {
  const [messages, setMessages] = useState([]);
  const [options, setOptions] = useState([]);
  const [waitingForInput, setWaitingForInput] = useState(false);
  const { userData, isUserDataReady } = useUserDetails();
  const chatBoxRef = useRef(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (isUserDataReady) {
      sendMessage('Hi');
    }
  }, [isUserDataReady, userData]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (message) => {
    if (message.trim() === '') return;

    const newMessages = [...messages, { text: message, sender: 'user' }];
    setMessages(newMessages);
    setWaitingForInput(true);

    if (isUserDataReady) {
      try {
        const response = await fetch('https://adaa-web-backend.onrender.com/chat/message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userMessage: message,
            userEmail: userData.Email,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTimeout(() => {
          setMessages([
            ...newMessages,
            { text: data.botReply, sender: 'bot' },
          ]);
          if (data.botReply === 'Sure, let me take you to the Products page. 📃') {
            setTimeout(() => {
              navigate('/shopping/listing');
              setIsChatbotOpen(false);
            }, 1000);
          }
          if (data.botReply === "Alright, let's take a look at your cart! 🛒") {
            setTimeout(() => {
              navigate('/shopping/cart');
              setIsChatbotOpen(false);
            }, 1000);
          }
          if (data.botReply === "Here's your account! 📦") {
            setTimeout(() => {
              navigate('/shopping/account');
              setIsChatbotOpen(false);
            }, 1000);
          }
          if (data.botReply === "Okay, let me know if you need my help. Bye 🤗") {
            setTimeout(() => {
              setIsChatbotOpen(false);
            }, 1000);
          }
          setOptions(data.options);
          setWaitingForInput(false);
        }, 1000);
      }
      catch (error) {
        console.error('Error sending message:', error);
        setMessages([
          ...newMessages,
          { text: 'Something went wrong. Please try again.', sender: 'bot' },
        ]);
        setWaitingForInput(false);
      }
    }
  };

  const handleOptionClick = (option) => {
    sendMessage(option);
  };

  return (
    <div className="chatbot">
      <div className="chat-window">
        <div className="chat-box" ref={chatBoxRef} style={{ overflowY: 'auto', maxHeight: '400px' }}>
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              <small
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: msg.sender === 'user' ? '#007bff' : '#28a745',
                  marginBottom: '2px',
                }}
              >
                {msg.sender === 'user' ? 'You' : 'Bot'}
              </small>
              {msg.text}
            </div>
          ))}
        </div>
        <div className="input-box">
          {waitingForInput ? (
            <div className='px-3'>Bot is analyzing...</div>
          ) : (
            <div className="options-box">
              {options.length > 0 &&
                options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(option)}
                    className="option-button"
                  >
                    {option}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
