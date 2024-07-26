import React, { useState,useEffect, useRef } from 'react';
import axios from 'axios';
//import {LoadingSpinner} from './components/LoadingSpinner'
import './App.css';
// import Button from 'react-bootstrap/Button';
import userAvatar from './user-avatar.jpg'; // Remplacez par le chemin de votre image d'utilisateur
import botAvatar from './bot.jpg'; // Rempla

function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hallo! Wie kann ich Ihnen heute helfen?' }
  ]);
  const [fileContent, setFileContent] = useState('');
  const [file, setFile] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSendButtonDisabled, setIsSendButtonDisabled] = useState(true);
  const messagesEndRef = useRef(null);


  useEffect(() => {
    console.log('call me')
    if(fileContent === '') {

    } else {
      setMessages((messages) => [...messages, { sender: 'bot', text: `PDF Inhalt: ${fileContent}` }]);
    }
  }, [fileContent]);

  useEffect(() => {
    setIsSendButtonDisabled(input.trim() === '' && !file);
  }, [input, file]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };


  const handleFileChange = (file) => {
    setFile(file)
  }

  const handleSubmit = async() => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setFileContent((oldState) => response.data.botMessage);
      console.log("Value"+fileContent);
      setLoading(false)
    } catch (error) {
      console.error('Fehler beim Hochladen der Datei:', error);
      console.log(true);
    }
  }


  const handleSend = async () => {
    if (input.trim() === '' && !fileContent) return;

    const newMessages = [...messages, { sender: 'user', text: input }];
    if (fileContent) {
      newMessages.push({ sender: 'user', text: fileContent });
    }
    setMessages(newMessages);
    setInput('');
    setFileContent('');

    try {
      const response = await axios.post('http://localhost:5000/chat', {
        messages: newMessages.map((msg) => ({
          role: msg.sender === 'bot' ? 'assistant' : 'user',
          content: msg.text,
        }))
      });
      console.log(true);
      const botMessage = response.data.botMessage;
      setMessages([...newMessages, { sender: 'bot', text: botMessage }]);
    } catch (error) {
      console.log(false);
      console.error('Fehler beim Abrufen der Antwort von ChatGPT:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
      <div className="App">
        <div className="chat-window">
          <div className="messages">
            {messages.map((msg, index) => (
                <div key={index} className={`message ${msg.sender}`}>
                  <img
                      src={msg.sender === 'bot' ? botAvatar : userAvatar}
                      alt={`${msg.sender} avatar`}
                      className="avatar"
                  />
                  {msg.text}
                </div>
            ))}
          </div>
          <div className="input-container">
            <input
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Schreiben Sie Ihre Nachricht..."
            />
            <input
                type="file"
                onChange={(e) => handleFileChange(e.target.files[0])}
            />
            <button onClick={handleSubmit} disabled={loading || isSendButtonDisabled}>{
              loading ? 'Loading...' : 'Send'
            }</button>
          </div>
        </div>
      </div>
  );
}

export default App;
