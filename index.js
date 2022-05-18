const express = require('express');
const app = express();
const hbs = require("express-handlebars");
const jwt = require('jsonwebtoken');
app.listen(3000, () => console.log('Your app listening on port 3000'));

app.use(express.json());

app.set("view engine", "handlebars");

app.use("/css", express.static(`${__dirname}`));

app.engine(
  "handlebars",
  hbs.engine({
    layoutsDir: `${__dirname}/views`,
    partialsDir:`${__dirname}/views/partials`,
  })
);

app.get("/", async (request, response) => {
    response.render("index", {
      layout: "index",          
    });
  });

app.get('/login', (req, res) => {
  res.render("login",{ layout: 'login'});
})

app.get('/registro', (req, res) => {
  res.render("registro",{ layout: 'registro'});
})