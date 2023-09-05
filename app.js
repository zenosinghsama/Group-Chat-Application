const express = require("express");
const app = express();

const bodyParser = require(body-parser);
const sequelize = require("./util/database")

app.use(express.json());
app.use(bodyParser.json());

sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 4000);
  })
  .catch((err) => {
    console.log(err);
  });