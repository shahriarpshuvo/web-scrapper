const fs = require('fs');
const { default: axios } = require('axios');

async function downloadFile(fileUrl, fileName) {
  const response = await axios({
    method: 'GET',
    url: fileUrl,
    responseType: 'stream'
  });

  const fileStream = fs.createWriteStream(fileName);
  response.data.pipe(fileStream);
  await new Promise((resolve, reject) => {
    fileStream.on('finish', resolve);
    fileStream.on('error', reject);
  });
  console.log(`Downloaded song: ${fileName}`);
}

exports.downloadFile = downloadFile;
