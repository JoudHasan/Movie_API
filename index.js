require("dotenv").config();
const mongoose = require("mongoose");
const Models = require("./models.js");
const Movies = Models.Movie;
const Users = Models.User;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const { check, validationResult } = require("express-validator");

require("./passport");
app.use(bodyParser.json());
const cors = require("cors");
app.use(cors());

app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: true }));

const passport = require("passport");
let auth = require("./auth")(app);
app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

app.use(express.static("public"));

mongoose.connect(process.env.DB_URL);

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find();
      res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  }
);

app.get(
  "/movies/title/:Title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({ Title: req.params.Title });
      if (!movie) {
        return res.status(404).send(`Error: ${req.params.Title} was not found`);
      }
      res.status(200).json(movie);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  }
);

app.get(
  "/movies/genre/:Genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movies = await Movies.find({ "Genre.Name": req.params.Genre });
      if (movies.length === 0) {
        return res
          .status(404)
          .send(`Error: no movies found with ${req.params.Genre} genre`);
      }
      res.status(200).json(movies);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  }
);

app.get(
  "/users",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const users = await Users.find();
      res.status(200).json(users);
    } catch (err) {
      console.error(err);
      res
        .status(500)
        .json({ error: "Internal Server Error", details: err.message });
    }
  }
);

// Get a user by username
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

//creat user
app.post(
  "/users",

  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username }) // Search to see if a user with the requested username already exists
      .then((user) => {
        if (user) {
          //If the user is found, send a response that it already exists
          return res.status(400).send(req.body.Username + " already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
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
  }
);
// Add a movie to a user's list of favorites
app.post(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { Username: req.params.username },
      {
        $push: { FavoriteMovies: req.params.movieId },
      },
      { new: true }
    )
      .then((updatedUser) => {
        res.status(200).json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Update user information
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    //handle errors of validation
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      //status code 422 - unprocessable content
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    try {
      const { Username, Password, Email, Birthday } = req.body;
      const saltRounds = 10;
      const hashedPassword = await Users.hashPassword(Password, saltRounds);
      const updateUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: Username,
            Password: hashedPassword,
            Email: Email,
            Birthday: Birthday,
          },
        },
        { new: true }
      );
      res.status(200).json(updateUser);
    } catch (err) {
      console.error(err);
      res.status(500).send(`Error updating user information: ${err}`);
    }
  }
);

// Remove a movie to a user's list of favorites
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
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
  }
);

// Delete a user by username
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    await Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(req.params.Username + " was not found");
        } else {
          res.status(200).send(req.params.Username + " was deleted.");
        }
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send("Error: " + err);
      });
  }
);

// Login route
// app.post(
//   "/login",
//   passport.authenticate("local", { session: false }),
//   (req, res) => {
//     //If authentication is successful, respond with a token or relevant information
//     res.json({ message: "Login successful", user: req.user });
//   }
// );

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
