const multer = require('multer');
const fs = require('fs');

const db = require('../data/db');
const redis = require('redis');
const client = redis.createClient(6379, '127.0.0.1', {});

var express = require('express');
var router = express.Router();

/* GET users listing. */
const upload = multer({ dest: './uploads/' })

router.post('/', upload.single('image'), function (req, res) {
  console.log(req.body) // form fields
  console.log(req.file) // form files
  console.log("running upload.js");
  if (req.file.fieldname === 'image') {
    fs.readFile(req.file.path, async function (err, data) {
      if (err) throw err;
	  console.log("This is the uploading data", data);
      var img = new Buffer(data).toString('base64');
      // await db.cat(img);
	  // client.lpush("img", img);
	  client.lpush("img", img);
	  client.ltrim("img", 0, 4);
	  
      res.send('Ok');

    });
  }
});


module.exports = router;
