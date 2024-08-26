'use client';

import { useState } from "react";
import { Box, Stack, TextField, Button, FormControl, Select, MenuItem, Typography } from "@mui/material";

export default function Home() {

  const translations = {
    en: "Hi! I'm Surya's resume bot. How can I help you today?",
    es: "¡Hola! Soy el bot de currículum de Surya. ¿Cómo puedo ayudarte hoy?",
    fr: "Salut! Je suis le bot de CV de Surya. Comment puis-je vous aider aujourd'hui?",
    de: "Hallo! Ich bin Surya's Lebenslauf-Bot. Wie kann ich Ihnen heute helfen?",
    zh: "你好！我是苏瑞亚的简历机器人。我今天能帮您什么？",
  };

  const [selectedLanguage, setSelectedLanguage] = useState("en"); // default language is English

  const [messages, setMessages] = useState([{
    role: "assistant",
    content: translations[selectedLanguage],
  }]);

  const [message, setMessage] = useState("");

  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);

    // Update the initial assistant message to the selected language translation
    setMessages((prevMessages) => {
      const updatedMessages = [...prevMessages];
      
      // Assuming the initial assistant message is always the first one
      if (updatedMessages.length > 0 && updatedMessages[0].role === "assistant") {
        updatedMessages[0] = { ...updatedMessages[0], content: translations[newLanguage] };
      }
      
      return updatedMessages;
    });
  };

  const sendMessage = async () => {
    if (!message.trim()) return;  // Prevent sending empty messages

    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' }
    ]);

    setMessage('');

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ messages: [...messages, { role: 'user', content: message }], language: selectedLanguage }),
    });

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    let result = '';
    reader.read().then(function processText({ done, value }) {
      if (done) {
        return result;
      }

      const text = decoder.decode(value || new Int8Array(), { stream: true });
      setMessages((messages) => {
        let lastMessage = messages[messages.length - 1];
        let otherMessages = messages.slice(0, messages.length - 1);
        return [...otherMessages, { ...lastMessage, content: lastMessage.content + text }];
      });

      return reader.read().then(processText);
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();  // Prevent default Enter behavior
      sendMessage();  // Trigger the sendMessage function when Enter is pressed
    }
  };

  return (
    <Box 
      sx={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px',
        borderRadius: '10px',
        overflow: 'hidden',
        backgroundColor: '#f9f9f9',
        boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
        fontFamily: 'Arial, sans-serif',
      }}
    >
      <Box sx={{ border: '1px solid black', padding: '10px', backgroundColor: '#007bff', color: 'white', textAlign: 'center', borderRadius: '10px 10px 0 0' }}>
        <Typography variant="h6">Resume Bot</Typography>
      </Box>
      <Box
        sx={{
          flexGrow: 1,
          padding: '20px',
          overflowY: 'auto',
          backgroundColor: '#fff',
          border: '1px solid black',
        }}
      >
        {/* Message Stack with scrollbar fix */}
        <Stack 
          spacing={2} 
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              sx={{
                display: 'flex',
                justifyContent: message.role === 'assistant' ? 'flex-start' : 'flex-end',
              }}
            >
              <Box 
                sx={{
                  padding: '10px 15px',
                  borderRadius: '18px',
                  backgroundColor: message.role === 'assistant' ? '#007bff' : '#5c16c5',
                  color: 'white',
                  maxWidth: '70%',
                  wordWrap: 'break-word',
                  animation: 'fadeIn 0.3s ease-in-out',
                  boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.15)',
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Input area */}
      <Box
        sx={{
          padding: '10px',
          display: 'flex',
          alignItems: 'center',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f9f9f9',
          border: '1px solid black',
        }}
      >
        <TextField
          variant="outlined"
          placeholder="Type your message..."
          fullWidth
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          sx={{
            backgroundColor: '#fff',
            borderRadius: '20px',
            marginRight: '10px',
          }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 80, marginRight: '10px' }}>
          <Select
            value={selectedLanguage}
            onChange={handleLanguageChange}
            sx={{
              borderRadius: '20px',
              backgroundColor: '#fff',
            }}
          >
            <MenuItem value="en">EN</MenuItem>
            <MenuItem value="es">ES</MenuItem>
            <MenuItem value="fr">FR</MenuItem>
            <MenuItem value="de">DE</MenuItem>
            <MenuItem value="zh">ZH</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          onClick={sendMessage}
          sx={{
            padding: '10px 20px',
            borderRadius: '20px',
            backgroundColor: '#007bff',
            '&:hover': {
              backgroundColor: '#0056b3',
            },
          }}
        >
        Send
        </Button>
      </Box>
    </Box>
  );
}
