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

let movies = {
  "The Lives of Others": {
    Title: "The Lives of Others",
    Description:
      "In 1984, when an East German Stasi agent is ordered to spy on a writer, the more he discovers about the writer's disloyalty, the more his own faith in the Communist system is shaken.",
    Genre: {
      Name: "Drama",
      Description:
        "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    Director: {
      Name: "Florian Henckel",
    },
    ImageURL: "https://images.app.goo.gl/tukE2gj2t1MPqeL7A",
    Featured: false,
  },
  "Good Bye, Lenin!": {
    Title: "Good Bye, Lenin!",
    Description:
      "In 1990, to protect his fragile mother from a fatal shock after a long coma, a young man must keep her from learning that her beloved nation of East Germany as she knew it has disappeared",
    Genre: {
      Name: "Drama-Comedy",
      Description:
        "Comedy is a genre of dramatic performance having a light or humorous tone that depicts amusing incidents and in which the characters ultimately triumph over adversity.",
    },
    Director: {
      Name: "Wolfgang Becker",
    },
    ImageURL: "https://images.app.goo.gl/FQ9XLDjW5DRKriBv8",
    Featured: false,
  },
  "The Post": {
    Title: "The Post",
    Description:
      "The Post is a 2017 American semi-fiction historical political thriller film about The Washington Post and the publication of the Pentagon Papers.",
    Genre: {
      Name: "Historical drama",
      Description:
        "Historical drama (also period drama, period piece or just period) is a dramatic work set in a past time period, usually used in the context of film and television, which presents historical events and characters with varying degrees of fictional elements such as creative dialogue or fictional scenes which aim to compress separate events or illustrate a broader factual narrative.",
    },
    Director: {
      Name: "Steven Spielberg",
    },
    ImageURL: "https://images.app.goo.gl/xfzoLKC4hV4Z4nFL9",
    Featured: false,
  },
  Perfume: {
    Title: "Perfume",
    Description:
      "Set in 18th century Paris, the story of a man with an extraordinarily acute sense of smell takes a dark turn when his quest to create the ultimate fragrance leads to murder.",
    Genre: {
      Name: "Crime Fiction",
      Description:
        "Crime fiction, detective story, murder mystery, mystery novel, and police novel are terms used to describe narratives that centre on criminal acts and especially on the investigation, either by an amateur or a professional detective, of a crime, often a murder.",
    },
    Director: {
      Name: "Tom Tykwer",
    },
    ImageURL: "https://images.app.goo.gl/oVa5WGfFBjvKYoHV6",
    Featured: false,
  },
  "In the mood for love": {
    Title: "In the mood for love",
    Description:
      "Two neighbors form a strong bond after both suspect extramarital activities of their spouses. However, they agree to keep their bond platonic so as not to commit similar wrongs.",
    Genre: {
      Name: "Romance Drama",
      Description:
        "Romantic dramas usually revolve around an obstacle that prevents deep and true love between two people. Music is often employed to indicate the emotional mood, creating an atmosphere of greater insulation for the couple.",
    },
    Director: {
      Name: "Kar-Wai Wong",
    },
    ImageURL: "https://images.app.goo.gl/AX425njuFMxZ2csPA",
    Featured: false,
  },
  "The Truman Show": {
    Title: "The Truman Show",
    Description:
      "An insurance salesman is oblivious of the fact that his entire life is a TV show and his family members are mere actors. As he starts noticing things and uncovers the truth, he decides to escape.",
    Genre: {
      Name: "Comedy Drama",
      Description:
        "Comedy is a genre of dramatic performance having a light or humorous tone that depicts amusing incidents and in which the characters ultimately triumph over adversity.",
    },
    Director: {
      Name: "Peter Weir",
    },
    ImageURL: "https://images.app.goo.gl/imMok1n5QkTHcBfa6",
    Featured: false,
  },
  "Lost in Translation": {
    Title: "Lost in Translation",
    Description:
      "An American actor Bob, lands in Tokyo for an ad film and ends up meeting Charlotte, who's left behind by her photographer husband. Gradually, the two discover a friend within each other.",
    Genre: {
      Name: "Romance Comedy Drama",
      Description:
        "Comedy is a genre of dramatic performance having a light or humorous tone that depicts amusing incidents and in which the characters ultimately triumph over adversity.",
    },
    Director: {
      Name: "Sofia Coppola",
    },
    ImageURL: "https://images.app.goo.gl/7wYNsWxaNDGFxzpQ8",
    Featured: false,
  },
  Nostalgia: {
    Title: "Nostalgia",
    Description:
      "A renowned Russian poet and his translator embark on a journey to find out more about the life of a Russian composer. Along the way, they try to understand the composer's mysterious ways.",
    Genre: {
      Name: "Drama",
      Description:
        "In film and television, drama is a category or genre of narrative fiction (or semi-fiction) intended to be more serious than humorous in tone.",
    },
    Director: {
      Name: "Andrei Tarkovsky",
    },
    ImageURL: "https://images.app.goo.gl/eHxBKcUHJERx3WJ28",
    Featured: false,
  },
  "The Killing of a Sacred Deer": {
    Title: "The Killing of a Sacred Deer",
    Description:
      "A surgeon, takes an awkward teenage boy, Martin, under his wing. But things get worse for the Murphys when they find out that Martin has a sinister agenda of his own.",
    Genre: {
      Name: "Horror Thriller",
      Description:
        "Horror films often explore dark subject matter and may deal with transgressive topics or themes. Broad elements include monsters, apocalyptic events, and religious or folk beliefs.",
    },
    Director: {
      Name: "Yorgos Lanthimos",
    },
    ImageURL: "https://images.app.goo.gl/nVJnJTEpPgNaJ7QU7",
    Featured: false,
  },
};

app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

app.get("/", (req, res) => {
  res.send("Welcome to my movie app!");
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
  next();
});

// read
app.get("/movie/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.title === title);
  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("Movie not found");
  }
});

//read
app.get("/movies/genre/:genreName", (req, res) => {
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
  const director = movies.find(movies.director.Name === directorName).director;
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
  let user = users.find((user) => user.id === id);
  if (user) {
    user.name = name;
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
});

//create
app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id === id);
  if (user) {
    user.favoriteMovies.push(movieTitle);
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
});

//delete
app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;
  let user = users.find((user) => user.id === id);
  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(
      (title) => title !== movieTitle
    );
    res.status(200).json(user);
  } else {
    res.status(400).send("User not found");
  }
});

//delete
app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  users = users.filter((users) => user.id !== id);
  if (user) {
    users = users.filter((users) => user.id !== id);
    res.status(200).send("User deleted");
  } else {
    res.status(400).send("User not found");
  }
});

const port = 8080; // Choose a port number
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
