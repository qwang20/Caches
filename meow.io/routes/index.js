var express = require('express');
var router = express.Router();
const redis = require('redis');
const db = require('../data/db');
const { exec } = require("child_process");
const fs = require('fs');
// Create client for redis at 127.0.0.1
let client = redis.createClient(6379, '127.0.0.1', {});
// The recent upload picture callback field
let upload = null;
// The cat facts callback field
let facts = null;

/* GET home page. */
// The get / page, which shows the 100 cats facts, caches the facts
router.get('/', async function(req, res, next) {
  // Get the facts from caches, if reply exists parse the reply, if null get null
  let facts = await new Promise((resolve) => {
	client.get("bestFacts", (error, reply) => {
	  resolve(reply ? JSON.parse(reply) : null);
	});
  })
  // If the facts returned from caches is null, get facts from database
  if (facts == null) {
	console.log("set caches")
	facts = await db.votes();
	// Set facts into caches
	client.set("bestFacts", JSON.stringify(facts), function(err, reply) {
	
  });
    // Set expire time to be 10 seconds
    client.expire("bestFacts", 10);
  }
  // Get 5 upload pictures from caches and save to upload variable
  upload = await new Promise((resolve) => {
	client.lrange("img", 1, 5, (error, reply) => {
      resolve(reply);
	});
  });
  // Render the uploaded pictures and cat facts
  res.render('index', { title: 'meow.io', recentUploads: upload, bestFacts: facts });
  // Set facts back to null to receive the next blocking data
  facts = null;
});

// Upload the picture for testing 
router.get('/upload', function (req, res) {
  // Upload the picture by curl command
  exec("./loadpic.sh", (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
		res.write('upload error');
		res.end();
    }
    if (stderr) {
        console.log(`stderr: ${stderr}`);
		res.write('upload successful');
		res.end();
    }
    console.log(`stdout: ${stdout}`);
  });
})


module.exports = router;


