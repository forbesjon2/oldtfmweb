const uWS = require("uWebSockets.js")
// const port = 3000;
var Get = require("./routes/Get");
var Post = require("./routes/Post");
const {Pool} = require("pg");

const pool = new Pool({
    user: 'postgres',
    host: '127.0.0.1',
    database: 'ditto',
    password: 'Noderink1',
    port: 5432,
})


var app = uWS.App();

app = new Get.Routes(app, pool).attachGetRoutes();
app = new Get.Routes(app, pool).attachGetAPIRoutes();
app = new Get.Routes(app, pool).attachAccountAPIRoutes();
app = new Post.Routes(app, pool).attachPostAccountRoutes();
app = new Post.Routes(app, pool).attachPostRoutes();



app.listen(3000, (token) => {
    if(token){
      console.log("listening on 3000");
    }else{
      console.log("idk ");
    }
  })
