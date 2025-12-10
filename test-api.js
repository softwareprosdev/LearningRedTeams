const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API from frontend perspective...');
    const response = await fetch('http://localhost:3001/api/v1/courses');
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Data length:', data.length);
    console.log('First course title:', data[0]?.title);
    console.log('SUCCESS: API is working!');
  } catch (error) {
    console.error('ERROR:', error.message);
  }
}

testAPI();
