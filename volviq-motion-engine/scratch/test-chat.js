const fs = require('fs');
const path = require('path');

const envPath = path.resolve('c:/Users/Nandini pandey/Downloads/Volviq AI/volviq-motion-engine/.env');
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
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (key === 'OPENROUTER_API_KEY') apiKey = value;
        if (key === 'OPENROUTER_BASE_URL') baseUrl = value;
      }
    }
  }
} catch (err) {
  console.error(err);
}

async function testModel(modelName) {
  console.log(`Testing model: ${modelName}...`);
  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://volviq.ai',
        'X-Title': 'Volviq AI Test'
      },
      body: JSON.stringify({
        model: modelName,
        messages: [{ role: 'user', content: 'Say hello' }],
        max_tokens: 10
      })
    });
    console.log(`Status for ${modelName}:`, response.status, response.statusText);
    const json = await response.json();
    console.log(`Response for ${modelName}:`, JSON.stringify(json, null, 2));
  } catch (err) {
    console.error(`Error for ${modelName}:`, err.message);
  }
}

async function run() {
  await testModel('google/gemini-2.5-flash');
  await testModel('deepseek/deepseek-chat');
  await testModel('qwen/qwen-2.5-coder-32b-instruct');
}

run();
