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


var app = uWS.SSLApp({
	key_file_name: '/etc/letsencrypt/live/ca2ie.net/privkey.pem',
	cert_file_name: '/etc/letsencrypt/live/ca2ie.net/cert.pem',
	passphrase:'1234'
});

app = new Get.Routes(app, pool).attachGetRoutes();
app = new Get.Routes(app, pool).attachGetAPIRoutes();
app = new Get.Routes(app, pool).attachAccountAPIRoutes();
app = new Post.Routes(app, pool).attachPostAccountRoutes();
app = new Post.Routes(app, pool).attachPostRoutes();


const PORT = 5000;
app.listen(PORT, (token) => {
    if(token){
      console.log("listening on port " + PORT);
    }else{
      console.log("idk ");
    }
  })
