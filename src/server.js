// use the express library
const express = require('express');

// create a new server application
const app = express();
const fetch = require('node-fetch');

// Define the port we will listen on
// (it will attempt to read an environment global
// first, that is for when this is used on the real
// world wide web).
const port = process.env.PORT || 3000;


// The main page of our website
//app.get('/', (req, res) => {
//  res.send('Hello World!')
//});
app.use(express.static('public'));
const cookieParser = require('cookie-parser');
app.set('view engine', 'ejs');

/*const {encode} = require('html-entities');
app.get('/', (req, res) => {
const name = req.query.name || "World";
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>An Example Title</title>
        <link rel="stylesheet" href="app.css">
      </head>
      <body>
         <h1>Hello, ${encode(name)}!</h1>
        <p>HTML is so much better than a plain string!</p>
      </body>
    </html>
  `);
});
*/
app.use(cookieParser());
let nextVisitorId = 1;
let visitormsg = ""
app.get('/', (req, res) => {
  let lasttimevisit = req.cookies.visited;
  if (lasttimevisit == undefined) {
     visitormsg = "You have never visited before."
  }
  else{
    lasttimevisit = Math.floor((Date.now() - req.cookies.visited) / 1000);
      visitormsg = `It has been ${lasttimevisit} seconds since your last visit`;
  }

  if (req.cookies['visitorId']) {
      res.cookie('visitorId', nextVisitorId);
  } else {
      res.cookie('visitorId',nextVisitorId++);
  }
  res.cookie('visited', Date.now());
  res.render('welcome', {
      name: req.query.name || "World",
      visitorId: nextVisitorId,
      visitormsg: visitormsg
    });
    console.log(req.cookies);
  });

app.get("/trivia", async(req, res) => {
    // fetch the data
    const response = await fetch("https://opentdb.com/api.php?amount=1&type=multiple");

    // fail if bad response
    if (!response.ok) {
        res.status(500);
        res.send(`Open Trivia Database failed with HTTP code ${response.status}`);
        return;
    }

    // interpret the body as json
    const content = await response.json();

    // fail if db failed
    if (content.response_code !== 0) {
        res.status(500);
        res.send(`Open Trivia Database failed with internal response code ${content.response_code}`);
        return;
    }

    // respond to the browser
    correctAnswer = content.results[0]['correct_answer']
    answers = content.results[0]['incorrect_answers']
    answers.push(correctAnswer)
    let s_ans = answers.sort(function() {
        return Math.random() - 0.5;
    });
    const answerLinks = s_ans.map(answer => {
        return `<a style='color:white' href="javascript:alert('${
          answer === correctAnswer ? 'Correct!' : 'Incorrect, Please Try Again!'
          }')">${answer}</a>`
    })
    res.render('trivia', {
        question: content.results[0]['question'],
        category: content.results[0]['category'],
        difficulty: content.results[0]['difficulty'],
        answers: answerLinks
    })
});

// Start listening for network connections
app.listen(port);

// Printout for readability
console.log("Server Started!");
