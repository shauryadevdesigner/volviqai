const fs = require('fs');

async function testFollowUp() {
  const url = 'http://localhost:3000/api/generate';
  const payload = {
    prompt: "Perfect now add one background image in the starting page , any image that look good",
    model: "deepseek-v4-flash",
    isFollowUp: true,
    currentCode: `
import React from 'react';
import { AbsoluteFill } from 'remotion';

export const Main = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
      <h1 style={{ color: '#fff' }}>Starting Page</h1>
    </AbsoluteFill>
  );
};
    `,
    conversationHistory: [
      { role: "user", content: "Create an Instagram reel for my startup with energetic text animations and brand colors" },
      { role: "assistant", content: "Generated your animation, any follow up edits?" }
    ]
  };

  console.log('Sending follow-up request to', url);

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    console.log('Status code:', response.status, response.statusText);
    const text = await response.text();
    console.log('Response body:', text);
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

setTimeout(testFollowUp, 2000);
