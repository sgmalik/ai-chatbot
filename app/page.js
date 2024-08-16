'use client';

import { useState } from "react";
import { Box, Stack, TextField, Button, FormControl, Select, MenuItem } from "@mui/material";

export default function Home() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    content: "Hi! I'm Headstarter AI Support. How can I help you today?",
  }]);

  const [message, setMessage] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const handleLanguageChange = (event) => {
    setSelectedLanguage(event.target.value);
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
      width="100vw" 
      height="100vh" 
      display="flex" 
      flexDirection="column" 
      justifyContent="center" 
      alignItems="center"
    >
      <Stack 
        direction="column" 
        width="600px" 
        height="700px" 
        border="1px solid black" 
        p={2} 
        spacing={2}
      >
        {/* Message Stack with scrollbar fix */}
        <Stack 
          direction="column" 
          spacing={2} 
          flexGrow={1} 
          sx={{
            overflowY: "auto",
            overflowX: "hidden",
            maxHeight: "100%",
            pr: 1,
            boxSizing: "border-box",
          }}
        >
          {messages.map((message, index) => (
            <Box 
              key={index} 
              display="flex" 
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
              width="100%"
            >
              <Box 
                bgcolor={message.role === 'assistant' ? 'primary.main' : 'secondary.main'} 
                color="white" 
                borderRadius={16} 
                p={3}
                display="flex"
                justifyContent="center"
                alignItems="center"
                sx={{
                  maxWidth: "75%",
                  wordWrap: "break-word",
                }}
              >
                {message.content}
              </Box>
            </Box>
          ))}
        </Stack>

        {/* Input area */}
        <Stack
          direction="row"
          spacing={2}
        >
          <TextField
            label="Message"
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}  // Add event listener for keydown
          />
          <Button
            variant="contained"
            onClick={sendMessage}  // Use sendMessage function on click
          >
            Send Message
          </Button>
          <FormControl sx={{ minWidth: 100 }}>
            <Select
              value={selectedLanguage}
              onChange={handleLanguageChange}
              displayEmpty
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Spanish</MenuItem>
              <MenuItem value="fr">French</MenuItem>
              <MenuItem value="de">German</MenuItem>
              <MenuItem value="zh">Chinese</MenuItem>
              {/* Add more languages here */}
            </Select>
          </FormControl>
        </Stack>
      </Stack>
    </Box>
  );
}
