const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const uuid = require("uuid");
const morgan = require("morgan");
const { update } = require("lodash");

app.use(morgan("combined"));

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

app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});
// Get all movies
app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get movie by title
app.get("/movies/title/:Title", (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      if (!movie) {
        return res
          .status(404)
          .send("Error: " + req.params.Title + " was not found");
      }
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get movies by genre name
app.get("/movies/genre/:Genre", (req, res) => {
  Movies.find({ "Genre.Name": req.params.Genre })
    .then((movies) => {
      if (movies.length == 0) {
        return res
          .status(404)
          .send(
            "Error: no movies found with the " +
              req.params.Genre +
              " genre type."
          );
      } else {
        res.status(200).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get movies by director name
app.get("/movies/directors/:Director", (req, res) => {
  Movies.find({ "Director.Name": req.params.Director })
    .then((movies) => {
      if (movies.length == 0) {
        return res
          .status(404)
          .send(
            "Error: no movies found with the director " +
              req.params.Director +
              " name"
          );
      } else {
        res.status(200).json(movies);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about a director by name
app.get("/movies/director_description/:Director", (req, res) => {
  Movies.findOne({ "Director.Name": req.params.Director })
    .then((movie) => {
      if (!movie) {
        return res
          .status(404)
          .send("Error: " + req.params.Director + " was not found");
      } else {
        res.status(200).json(movie.Director);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get data about a genre by genre name
app.get("/movies/genre_description/:Genre", (req, res) => {
  Movies.findOne({ "Genre.Name": req.params.Genre })
    .then((movie) => {
      if (!movie) {
        return res
          .status(404)
          .send("Error: " + req.params.Genre + " was not found");
      } else {
        res.status(200).json(movie.Genre.Description);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get all users
app.get("/users", (req, res) => {
  Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Get a user by username
app.get("/users/:Username", (req, res) => {
  Users.findOne({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        return res
          .status(404)
          .send("Error: " + req.params.Username + " was not found");
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});
// Create a new user
app.post("/users", (req, res) => {
  Users.findOne({ Username: req.body.Username })
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      } else {
        Users.create({
          Username: req.body.Username,
          Password: req.body.Password,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        })
          .then((user) => {
            res.status(201).json(user);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error: " + error);
          });
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Add a movie to a user's list of favorites
app.post("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $addToSet: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send("Error: User was not found");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Update a users data by username
app.put("/users/:Username", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $set: {
        Username: req.body.Username,
        Password: req.body.Password,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      },
    },
    { new: true }
  )
    .then((user) => {
      if (!user) {
        return res.status(404).send("Error: No user was found");
      } else {
        res.json(user);
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

// Remove a movie to a user's list of favorites
app.delete("/users/:Username/movies/:MovieID", (req, res) => {
  Users.findOneAndUpdate(
    { Username: req.params.Username },
    {
      $pull: { FavoriteMovies: req.params.MovieID },
    },
    { new: true }
  )
    .then((updatedUser) => {
      if (!updatedUser) {
        return res.status(404).send("Error: User not found");
      } else {
        res.json(updatedUser);
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send("Error: " + error);
    });
});

// Delete a user by username
app.delete("/users/:Username", (req, res) => {
  Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(404).send("User " + req.params.Username + " was not found");
      } else {
        res.status(200).send(req.params.Username + " was deleted.");
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

app.listen(8080, (req, res) => {
  console.log("App listening on port 8080");
});
