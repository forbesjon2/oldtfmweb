const uWS = require('./node_modules/uWebSockets.js');

const port = 3000;
const fs = require("fs");


var content = fs.readFileSync("./mainPages/homepage.html", {encoding: 'utf-8'});

const app = uWS.App().get('/*', (res, req) =>{
    res.writeHeader("Content-Type","text/html; charset=utf-8");
    res.end(fs.readFileSync("./mainPages/homepage.html", {encoding: 'utf-8'}));
}).listen(port, (token) =>{
    if(token){
        console.log("Listening on port " + port);
    }else{
        console.log("something bad happened");
    }
})




// app.use(express.static(path.join(__dirname + './mainPages')));


// //homepage
// // app.set('views', "./mainPages");

// app.get("/", function(req, res){
//     res.render("homepage.html");
// });




// //initial connection
// var port = 3000;
// app.listen(port, function(err, connect){
//     if(err){
//         console.log(err);
//     }else{
//         console.log("Connected to port " + port);
//     }
// });