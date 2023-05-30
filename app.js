const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at http://localhost3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertMovieDbObjectToResponseObject = (dbObject) => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  };
};

const convertDirectorDbObjectToResponseObject = (dbObject) => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  };
};

//Get All Movies List
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT
            movie_name 
        FROM 
            movie;`;
  const moviesList = await db.all(getMoviesQuery);
  response.send(
    moviesList.map((eachMovie) =>
      convertMovieDbObjectToResponseObject(eachMovie)
    )
  );
});

//Add Movie in the Movies List

app.post("/movies/", async (request, response) => {
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieDetailsQuery = `
    INSERT INTO
    movie (director_id, movie_name, lead_actor)
    VALUES 
        (
            ${directorId},
            '${movieName}',
            '${leadActor}'
        );`;
  const dbResponse = await db.run(addMovieDetailsQuery);
  response.send("Movie Successfully Added");
});

//Get Movie Details

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDetailsQuery = `
    SELECT 
        * 
    FROM 
        movie
    WHERE
        movie_id = ${movieId};`;
  const movieDetails = await db.get(getMovieDetailsQuery);
  response.send(convertMovieDbObjectToResponseObject(movieDetails));
});

//Update movie Details

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovieDetailsQuery = `
    UPDATE
    movie
    SET
        director_id = ${directorId},
        movie_name = '${movieName}',
        lead_actor = '${leadActor}'
    WHERE
        movie_id = ${movieId};`;
  await db.run(updateMovieDetailsQuery);
  response.send("Movie Details Updated");
});

//Delete Movie Details

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieDetailsQuery = `
    DELETE FROM 
    movie
    WHERE
    movie_id = ${movieId};`;
  await db.run(deleteMovieDetailsQuery);
  response.send("Movie Removed");
});

//Get All Directors Details

app.get("/directors/", async (request, response) => {
  const getAllDirectorDetailsQuery = `
    SELECT 
        *
    FROM 
        director
    ORDER BY
        director_id;`;
  const directorDetails = await db.all(getAllDirectorDetailsQuery);
  response.send(
    directorDetails.map((eachDirector) =>
      convertDirectorDbObjectToResponseObject(eachDirector)
    )
  );
});

//Get All Directors Movie Details

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorMovieDetailsQuery = `
    SELECT 
        movie_name
    FROM 
        movie
    WHERE
        director_id = ${directorId};`;
  const directorMovies = await db.all(getDirectorMovieDetailsQuery);
  response.send(
    directorMovies.map((eachMovie) =>
      convertMovieDbObjectToResponseObject(eachMovie)
    )
  );
});

module.exports = app;
