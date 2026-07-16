const https = require('https');

const data = JSON.stringify({
  resolution: "full-hd",
  quality: "high",
  elements: [
    {
      type: "html",
      url: "https://remotion.dev",
      duration: 5
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

  res.on('data', d => {
    process.stdout.write(d);
  });
});

req.on('error', error => {
  console.error(error);
});

req.write(data);
req.end();
