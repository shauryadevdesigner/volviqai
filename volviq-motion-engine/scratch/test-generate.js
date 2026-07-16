const fs = require('fs');

async function testGenerate() {
  const url = 'http://localhost:3000/api/generate';
  const payload = {
    prompt: "Create an Instagram reel for my startup with energetic text animations and brand colors",
    model: "gemini-3-flash",
    isFollowUp: false,
    conversationHistory: []
  };

  console.log('Sending request to', url);
  console.log('Payload:', JSON.stringify(payload, null, 2));

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Mock authorization token if needed, or send without it
      },
      body: JSON.stringify(payload)
    });

    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    console.log('Status code:', response.status, response.statusText);

    if (!response.ok) {
      const text = await response.text();
      console.error('Request failed with error text:', text);
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    console.log('Reading stream events...');
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        console.log('Stream finished.');
        break;
      }

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          console.log('Stream chunk:', line);
        }
      }
    }
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

// Wait 3 seconds to make sure the dev server is fully up
setTimeout(testGenerate, 3000);
