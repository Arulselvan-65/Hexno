const express = require('express');
const fs = require('fs');
const app = express();
const cors = require('cors');
const axios = require('axios');
const port = 3002;

app.use(cors());
app.use(express.json());

app.post('/submit', async(req, res) => {


  let a = req.body;
  i1 = a.uri1;
  i2 = a.uri2;
  i3 = a.uri3;
  let gh = [];
  gh.push(i1);
  gh.push(i2);
  gh.push(i3);
  let img = []

  for(let i=0;i<3;i++){
    const url = `https://plum-neat-snake-634.mypinata.cloud/ipfs/${gh[i]}?pinataGatewayToken=2lJKUgK4Ex-LacR8LOhqVMVjJp70nVqVTLBH5CORj8N-PQANpTDxEvByuf0nIq2J`;
    const response = await axios.get(url);
    img.push(response.data.image);
  }

  const images = {img1: img[0],img2: img[1], img3: img[2]};

  if(JSON.parse(fs.readFileSync('Details.json'))){
   existingData = JSON.parse(fs.readFileSync('Details.json'));
  }
  const newSubmission = { key: existingData.length, data: {...req.body,...images} };
  existingData.push(newSubmission)

  fs.writeFileSync('Details.json', JSON.stringify(existingData,null,2) + "\n");

  res.json({ success: true });
});
app.get('/submissions', (req, res) => {
  const allSubmissions = JSON.parse(fs.readFileSync('Details.json', 'utf8'));
  res.json(allSubmissions);
});

app.listen(port, () => console.log(`Server is running on port ${port}`));
