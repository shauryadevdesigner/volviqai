const fs = require('fs');
const path = require('path');

// Manually parse .env
const envPath = path.resolve('c:/Users/Nandini pandey/Downloads/Volviq AI/volviq-motion-engine/.env');
console.log('Reading env from:', envPath);
let apiKey = '';
let baseUrl = 'https://openrouter.ai/api/v1';

try {
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n');
    for (const line of lines) {
      const match = line.match(/^\s*([^=#]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key === 'OPENROUTER_API_KEY') {
          apiKey = value;
        }
        if (key === 'OPENROUTER_BASE_URL') {
          baseUrl = value;
        }
      }
    }
  } else {
    console.log('.env file not found at', envPath);
  }
} catch (err) {
  console.error('Failed to parse .env:', err);
}

console.log('API Key present:', !!apiKey);
console.log('Base URL:', baseUrl);

if (!apiKey) {
  console.error('OPENROUTER_API_KEY is not configured.');
  process.exit(1);
}

async function testConnection() {
  try {
    console.log('Fetching available models from OpenRouter...');
    const response = await fetch(`${baseUrl}/models`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://volviq.ai',
        'X-Title': 'Volviq AI Test'
      }
    });

    console.log('Response status:', response.status, response.statusText);
    const text = await response.text();
    console.log('Raw response text (first 1000 chars):', text.slice(0, 1000));

    try {
      const data = JSON.parse(text);
      if (data.data) {
        console.log('Models found:', data.data.slice(0, 10).map(m => m.id));
      } else {
        console.log('Response JSON:', data);
      }
    } catch (e) {
      console.log('Failed to parse JSON response');
    }
  } catch (error) {
    console.error('Error during fetch:', error);
  }
}

testConnection();
