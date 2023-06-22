const authToken = 'secret';
const jsonlFile = 'data.jsonl';

async function sendLineData(line) {
  try {
    console.log('sending', line);
    const url = 'http://localhost:8000/liveEvent'; // Replace with your server URL
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: line,
    });

    console.log('Response:', response);
    } catch (error) {
      console.error('Error sending data:', error.message);
    }
  }
  
  async function processFile(file) {
    try {
      const response = await fetch(file);
      const fileContent = await response.text();
      const lines = fileContent.split('\n');
      for (const line of lines) {
        await sendLineData(line);
      }
  
      console.log('Data processing completed.');
    } catch (error) {
      console.error(error);
    }
  }
  
  document.getElementById('postButton').addEventListener('click', () => {
    console.log('sending');
    processFile(jsonlFile);
  });