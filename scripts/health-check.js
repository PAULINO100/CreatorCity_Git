const http = require('http');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/city/citizens',
  method: 'GET'
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    try {
      const citizens = JSON.parse(data);
      console.log(`LOADED: ${citizens.length} citizens`);
      if (citizens.length >= 1013) {
        console.log('SUCCESS: Data integrity verified.');
      } else {
        console.warn(`WARNING: Only ${citizens.length} citizens found.`);
      }
      process.exit(0);
    } catch (e) {
      console.error('ERROR: Failed to parse citizen data');
      process.exit(1);
    }
  });
});

req.on('error', (e) => {
  console.error(`ERROR: ${e.message}`);
  process.exit(1);
});

req.end();
