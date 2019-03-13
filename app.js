const uWS = require("uWebSockets.js")
// const validator = require('validator');
// const port = 3000;
var routes = require("./routes/Routes");
const {Pool} = require("pg");

const pool = new Pool({
    user: 'postgres',
    host: '192.250.230.169',
    database: 'ditto',
    password: 'Noderink1',
    port: 5432,
})


var app = uWS.App();
app = new routes.GetRoutes(app, pool).attachGetRoutes();




app.listen(3000, (token) => {
    if(token){
      console.log("listening on 3000");
    }else{
      console.log("idk ");
    }
  })