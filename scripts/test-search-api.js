async function test() {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000') + '/api/search/users';
  
  const tests = [
    { name: 'EXACT_USERNAME_SEARCH (vinta)', query: 'vinta' },
    { name: 'PARTIAL_SEARCH (vint)', query: 'vint' },
    { name: 'DISTRICT_FILTER (district:tech)', query: 'district:tech' },
    { name: 'SCORE_FILTER (stars:>200000)', query: 'stars:>200000' },
    { name: 'CASE_INSENSITIVE (VINTA)', query: 'VINTA' },
    { name: 'EMPTY_STATE (nonexistent)', query: 'usuarioinexistente123' },
    { name: 'COMBINED_FILTER (district:tech stars:>200000)', query: 'district:tech stars:>200000' }
  ];

  for (const t of tests) {
    const start = Date.now();
    try {
      const resp = await fetch(`${baseUrl}?q=${encodeURIComponent(t.query)}`);
      const end = Date.now();
      const data = await resp.json();
      console.log(`--- ${t.name} ---`);
      console.log(`Time: ${end - start}ms`);
      console.log(`Status: ${resp.status}`);
      if (data.pagination) {
        console.log(`Total Results: ${data.pagination.total}`);
        if (data.users && data.users.length > 0) {
          console.log(`First Result: ${data.users[0].name} (Score: ${data.users[0].dis_score})`);
        } else {
          console.log('No results found.');
        }
      } else {
        console.log('Old JSON format detected or Error:', JSON.stringify(data).substring(0, 100));
      }
    } catch (err) {
      console.log(`--- ${t.name} FAILED ---`);
      console.log(`Error: ${err.message}`);
    }
  }
}

test();
