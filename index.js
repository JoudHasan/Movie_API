const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const { update } = require("lodash");

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
 res.status(200).send.json (movies);
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

// read
app.get("movie/:title"),(req.res) => {
  const {title} = req.params;
  const movie = movies.find((movie) => movie.title === title);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("Movie not found");
  }
};
//read
app.get("/movies/gerne/:gerneName", (req, res) => {
  const { gerneName } = req.params;
  const gerne = movies.find((gerne) => movie.gerneName === gerneName);
  if (gerne) {
    res.status(200).json(gerne);
  } else {
    res.status(400).send("gerne not found");
  }
});
//read
app.get("/movies/director/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.find(movies.director.name === directorName).director;
  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("director not found");
  }
});
let users = [
  {
    id: 1,
    name: "John",
    username: "john",
    password: "john123",
    favoriteMovies: ["Good Bye, Lenin", "The Lives of Others"],
  },
  {
    id: 2,
    name: "Jane",
    username: "jane",
    password: "jane123",
    favoriteMovies: ["The Lives of Others"],
  },
];
//create
app.post("/users", (req, res) => {
  const newUser = req.body;
if (newUser.name) {
  newUser.id = uuid.v4();
  users.push(newUser);
  res.status(201).json(newUser);
} else {
  res.status(400).send("User must have a name");
}
});
//update
app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  let users.find((user) => user.id === id);
  if (user) {
    user.name = update user.name;
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
});
//create
app.post ("/users,:id/:movieTitle"), (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id === id);
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
};
//delete
app.delete ("/users/:id/:movieTitle"), (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id === id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
};
//delete
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  users = users.find ((user) => user.id !== id);
if (user) {
  users = users.filter((user) => user.id !== id);
  res.status(200).send ("User deleted");
} else {
  res.status(400).send("User not found");
}
});

const port = 8080; // Choose a port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
