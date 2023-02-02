const express = require('express');
const fs = require('fs');
const cors = require('cors');
const path = require('path')
const formidable = require('formidable');
const { Storage } = require('@google-cloud/storage');
const storage = new Storage({
    projectId: 'ai-lab-280706',
});
const bucket = storage.bucket('shelfchecking-integration-test-data')
   
const app = express();
app.use(cors());

   
app.post('/api/upload', (req, res, next) => {
    
    const form = new formidable.IncomingForm();
    form.parse(req, function(err, fields, files){
  
        var oldPath = files.profilePic.filepath;
        var newPath = path.join(__dirname, 'uploads')
                + '/'+files.profilePic.name
        var rawData = fs.readFileSync(oldPath)
      
        fs.writeFile(newPath, rawData, function(err){
        console.log('raw data', rawData)
        const blob = bucket.file(`inference/${Math.floor(Date.now() / 1000)}.jpg`)
        const blobStream = blob.createWriteStream({
            resumable: false
        })
        blobStream.on('finish', () => {
            res.send("Successfully uploaded")
        })
            .on('error', (err) => {
                res.send(`Unable to upload image, something went wrong ${err}`)
            })
            .end(rawData)
        })
  })
});

app.get('/', (req, res))
   
app.listen(3000, function(err){
    if(err) console.log(err)
    console.log('Server listening on Port 3000');
});

exports.app = app;