const express = require('express')
const app = express()
const hbs = require("express-handlebars");

app.listen(3000, () => console.log('Your app listening on port 3000'))

app.use(express.json());

app.set("view engine", "handlebars");

app.engine(
  "handlebars",
  hbs.engine({
    layoutsDir: `${__dirname}/views`,
    partialsDir:`${__dirname}/views/partials`,
  })
)



app.get("/", async (request, response) => {
    response.render("inicio", {
      layout: "inicio",    
      
    });
  });
  