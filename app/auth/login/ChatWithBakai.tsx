'use client';
import React, { useState } from 'react';
import { ClientMessage, getAnswer } from './actions';
import { nanoid } from 'ai';

const ChatWithBakaiForm: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ClientMessage[]>([]);

  const handleUserSubmission = async () => {
    setMessages(currentMessages => [
      ...currentMessages,
      {
        id: nanoid(),
        status: 'user.message.created',
        text: input,
      },
    ]);

    const response = await getAnswer(input);
    setMessages(currentMessages => [...currentMessages, response]);
    setInput('');
  };

  return (
    <div>
      <div>
        <input
          value={input}
          onChange={event => setInput(event.target.value)}
          placeholder="Ask a question"
          onKeyDown={event => {
            if (event.key === 'Enter') {
              handleUserSubmission();
            }
          }}
        />
        <button onClick={handleUserSubmission}>Send</button>
      </div>

      <div>
        {messages.map((message, idx) => (
          <div key={idx}>
            <div>{message.status}</div>
            <div>{message.text}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatWithBakaiForm;