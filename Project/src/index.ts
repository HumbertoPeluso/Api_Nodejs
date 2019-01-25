import { createDbConnection } from "./db";
import express = require("express");
import bodyParser = require("body-parser");
import { getUserController } from "./backend/controllers/userController";
import { getLinksController } from "./backend/controllers/linksController";
import { getAuthController } from "./backend/controllers/authController";
import { getCommentsController } from "./backend/controllers/commentsController";


export async function createApp(){
    // Create db connection
  await createDbConnection();
  // Creates app
   const  app = express();

  // Server config to be able to send JSON
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Declare the main path
app.get("/", (req, res) => {
  res.send("This is the home page!");
  });

  // Declare controllers
const userController = getUserController();
const linksController = getLinksController();
const authController = getAuthController();
const commentsController = getCommentsController();
app.use("/api/v1/users",  userController);
app.use("/api/v1/links", linksController);
app.use("/auth", authController);
app.use("/api/v1/comments",commentsController);

  return app;
}