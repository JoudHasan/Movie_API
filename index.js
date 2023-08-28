const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");

app.use(morgan("combined"));

// Use bodyParser middleware for URL-encoded and JSON data
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let myLogger = (req, res, next) => {
  console.log(req.url);
  next();
};
let requestTime = (req, res, next) => {
  req.requestTime = Date.now();
  next();
};
app.use(myLogger);
app.use(requestTime);

app.get("/movies", (req, res) => {
  // Return a JSON object with data about your top 10 movies
  const moviesData = [
    { title: "The Lives of Others", year: "2006", Director: "Florian Henckel" },
    { title: "Good Bye, Lenin!", year: "2003", Director: "Wolfgang Becker" },
    { title: "The Post", year: "2017", Director: "Steven Spielberg" },
    { title: "Perfume", year: "2006", Director: "Tom Tykwer" },
    { title: "In the mood for love", year: "2000", Director: "Wong Kar-wai" },
    { title: "The Truman Show", year: "1998", Director: "Peter Weir" },
    { title: "Lost in Translation", year: "2003", Director: "Sofia Coppola" },
    { title: "Nostalgia", year: "1983", Director: "Andrei Tarkovsk" },
    {
      title: "The Killing of a Sacred Deer",
      year: "2017",
      Director: "Yorgos Lanthimos",
    },
    { title: "A Separation", year: "2011", Director: "Asghar Farhadi" },
  ];

  res.json(moviesData);
});

app.get("/", (req, res) => {
  // Return a default textual response
  res.send("Welcome to my movie app!");
});
app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

const port = 8080; // Choose a port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
