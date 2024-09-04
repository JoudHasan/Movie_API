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
// Add login route
let auth = require("./auth")(app);

app.use(express.static("public"));

mongoose.connect(process.env.DB_URL);

/**
 * @module routes
 */

/**
 * GET: Returns welcome message for the main route
 * @name WelcomeMessage
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

/**
 * GET: Returns a list of all movies
 * @name GetMovies
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
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

/**
 * GET: Returns a specific movie by title
 * @name GetMovieByTitle
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
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

/**
 * GET: Returns a list of movies by genre
 * @name GetMoviesByGenre
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
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

/**
 * GET: Returns a list of all users
 * @name GetUsers
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
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

/**
 * GET: Returns data of a single user by username
 * @name GetUserByUsername
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.get(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({ Username: req.params.Username });
      if (!user) {
        return res
          .status(404)
          .send("Error: " + req.params.Username + " was not found");
      }
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * POST: Create a new user
 * @name CreateUser
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 */
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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    try {
      const user = await Users.findOne({ Username: req.body.Username });
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      }
      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday,
      });
      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * POST: Add a movie to a user's list of favorites
 * @name AddFavoriteMovie
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.post(
  "/users/:username/favorites/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.username },
        { $push: { FavoriteMovies: req.params.movieId } },
        { new: true }
      );
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * PUT: Update user information
 * @name UpdateUser
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send("Permission denied");
    }
    try {
      const { Username, Password, Email, Birthday, FavoriteMovies } = req.body;
      const hashedPassword = await Users.hashPassword(Password);
      const updateUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: Username,
            Password: hashedPassword,
            Email: Email,
            Birthday: Birthday,
            FavoriteMovies: FavoriteMovies,
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

/**
 * DELETE: Remove a movie from a user's list of favorites
 * @name RemoveFavoriteMovie
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.delete(
  "/users/:Username/movies/:MovieID",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { FavoriteMovies: req.params.MovieID } },
        { new: true }
      );
      if (!updatedUser) {
        return res.status(404).send("Error: User not found");
      }
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

/**
 * GET: Returns favorite movies for a user
 * @name GetUserFavoriteMovies
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.get(
  "/users/:Username/movies",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOne({
        Username: req.params.Username,
      }).populate("FavoriteMovies");
      if (!user) {
        return res.status(404).send("User not found");
      }
      res.status(200).json(user.FavoriteMovies);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * DELETE: Deletes a user by username
 * @name DeleteUser
 * @function
 * @memberof module:routes
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @requires passport
 */
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const user = await Users.findOneAndRemove({
        Username: req.params.Username,
      });
      if (!user) {
        return res.status(400).send(req.params.Username + " was not found");
      }
      res.status(200).send(req.params.Username + " was deleted.");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error: " + err);
    }
  }
);

/**
 * Error handler middleware
 * @name ErrorHandler
 * @function
 * @memberof module:routes
 * @param {object} err - Error object
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});

/**
 * @module server
 */

/**
 * Listener for HTTP requests
 * @name Listen
 * @function
 * @memberof module:server
 * @param {number} port - Port number
 */
const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () => {
  console.log("Listening on Port " + port);
});
