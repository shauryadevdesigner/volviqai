const https = require('https');

// Test 1: Simple HTML (no iframe) to confirm API works
const data = JSON.stringify({
  resolution: "custom",
  width: 1080,
  height: 1920,
  quality: "high",
  scenes: [
    {
      "background-color": "#000000",
      duration: 3,
      elements: [
        {
          type: "html",
          html: "<div style='display:flex;align-items:center;justify-content:center;width:1080px;height:1920px;background:linear-gradient(135deg,#667eea,#764ba2);'><h1 style='color:white;font-size:80px;font-family:Arial;text-align:center;'>Volviq AI Test</h1></div>",
          width: 1080,
          height: 1920,
          x: 0,
          y: 0,
          duration: 3
        }
      ]
    }
  ]
});

const options = {
  hostname: 'api.json2video.com',
  port: 443,
  path: '/v2/movies',
  method: 'POST',
  headers: {
    'x-api-key': 'cZehYVmEjAje7GoNCndm1bhliwGFHecRA5dKd7cg',
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  console.log(`statusCode: ${res.statusCode}`);
  let body = '';
  res.on('data', d => body += d);
  res.on('end', () => {
    console.log('Response:', body);
    
    // Now poll for result
    const parsed = JSON.parse(body);
    if (parsed.project) {
      console.log('\nPolling for result in 10 seconds...');
      setTimeout(() => {
        const pollOptions = {
          hostname: 'api.json2video.com',
          port: 443,
          path: `/v2/movies?project=${parsed.project}`,
          method: 'GET',
          headers: {
            'x-api-key': 'cZehYVmEjAje7GoNCndm1bhliwGFHecRA5dKd7cg'
          }
        };
        const pollReq = https.request(pollOptions, pollRes => {
          let pollBody = '';
          pollRes.on('data', d => pollBody += d);
          pollRes.on('end', () => console.log('Poll result:', pollBody));
        });
        pollReq.end();
      }, 10000);
    }
  });
});

req.on('error', error => console.error(error));
req.write(data);
req.end();
