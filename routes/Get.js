var fs = require("fs");


class Routes{
    constructor(webServer, pool){
        this.webServer = webServer;
        this.pool = pool;
    }
    attachGetRoutes(){
        this.webServer.get("/", (res,req) =>{
            // setHeaders(res);
            res.onAborted(() =>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/home.html", {encoding: 'utf-8'}));
            }
        });

        this.webServer.get("/woah/:id", async (res,req) => {
            res.onAborted(() =>{
                res.aborted = true;
            });
            console.log(req.getParameter("id"));
            let r = await checkID2(req.getParameter(pool));
            if(!res.aborted){
                res.end(r);
                console.log("yo " + r);
            }
        })

                
        this.webServer.get("/search/:query", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Search.html", {encoding: 'utf-8'}));
            }
        })

        this.webServer.get("/w/:id", (res,req) => {
            res.onAborted(() =>{
                res.aborted = true;
            });
            this.pool.query("select transcription from transcriptions where id = 142;", (err, queryResult) =>{
                if(!err && !res.aborted) {
                    console.log("s", queryResult.rows[0].id);
                    res.end('sup ' + queryResult.rows[0].transcription.toString());
                }
                else res.end("err");
            });
        })


        // This is to be used in explore/browse. Returns all of the podcast names 
        // followed by their respective categories
        this.webServer.get("/list", (res, req) => {
            res.onAborted(()=> {
                res.aborted = true;
            });
            this.pool.query("SELECT id, name, category, imageuri FROM podcasts;", (err, qr) => {
                if(!err && !res.aborted){
                    var resultStr = "[";
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "{\"" + qr.rows[i].id + "\", \"" + qr.rows[i].name + "\", \"" +  qr.rows[i].category + "\", \"" + qr.rows[i].imageuri + "\"}, ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    res.end(resultStr)
                }else{
                    res.end("err")
                }
            })
        })



        // Figure out a better name for this. Basically we want to get everything you need to know to browse podcasts
        // 
        this.webServer.get("/podcastsummary/:id", (res, req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            var name = req.getParameter("name");
            this.pool.query("SELECT id, title, description FROM transcriptions WHERE podcastname = (SELECT name FROM podcasts WHERE id = 2 LIMIT 1) ORDER BY date DESC LIMIT 10;", (err, qr) => {
                if(!err && !res.aborted){
                    var resultStr = "[";
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "{\"" + qr.rows[i].id + "\", \"" + qr.rows[i].title + "\", \"" +  qr.rows[i].description + "\", \"" + qr.rows[i].imageuri + "\"}, ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    res.end(resultStr)
                }else{
                    res.end("err")
                }
            })
        })




        return this.webServer;
    }
}





function setHeaders(res){
    //be careful with these, split them up
    res.writeHeader("X-Frame-Options", "deny");
    res.writeHeader("X-XSS-Protection", "1; mode=block");
    res.writeHeader("X-Content-Type-Options", "nosniff");
    res.writeHeader("Referrer-Policy", "same-origin");
    res.writeHeader("Strict-Transport-Security", "hsts");
    res.writeHeader("Content-Type", "text/html");
    return res;
}

module.exports = {Routes}

