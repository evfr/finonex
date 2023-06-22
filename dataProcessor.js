const fs = require('fs');

module.exports = async function process() {
  try {
    const usersMap = new Map();

    const fileData = fs.readFileSync('data.jsonl', 'utf8');
    const lines = fileData.split('\n');

    for (const line of lines) {
      if (line.trim() === '') {
        continue;
      }
      const parsedLine = JSON.parse(line);
      const userData = usersMap.get(parsedLine.userId);
      if (!userData) {
        usersMap.set(parsedLine.userId, 
          { userId: parsedLine.userId, revenue: parsedLine.name.includes('subtract') ? -parsedLine.value : parsedLine.value  });
      } else {
        userData.revenue += parsedLine.name.includes('subtract') ? -parsedLine.value : parsedLine.value;
        usersMap.set(parsedLine.userId, userData);
      }
    }

    fs.truncate('data.jsonl', 0, (error) => {
      if (error) {
        console.error('Error deleting file contents:', error);
      } else {
        console.log('File contents deleted successfully');
      }
    });

    console.log('Data processing completed.');
    return usersMap;
  } catch (error) {
    console.error(error);
    return null;
  }
};