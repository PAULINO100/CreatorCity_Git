async function measure() {
  const start = Date.now();
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resp = await fetch(`${baseUrl}/city`);
    const end = Date.now();
    console.log(`--- PERFORMANCE REPORT ---`);
    console.log(`URL: /city`);
    console.log(`Status: ${resp.status}`);
    console.log(`Response Time: ${end - start}ms`);
    console.log(`Size: ${(await resp.text()).length} characters`);
  } catch (err) {
    console.error('Measurement failed:', err.message);
  }
}

measure();
