var fs = require("fs");
var validator = require("validator");

class Routes{
    constructor(webServer, pool){
        this.webServer = webServer;
        this.pool = pool;
    }

    /**
     * This covers the majority of GET routes. The order and quick summary of each is as follows...
     * "/" --> the homepage of transript.fm
     * "/search/:query" --> the search page of transcript.fm. Will redirect to home if an invalid search occurs
     * "/about": the 
     * 
     */
    attachGetRoutes(){
        /**
         * This is the homepage with the search bar in the middle and tabs "about, explore, contact, and account"
         * listed at the top.
         */
        this.webServer.get("/", (res,req) =>{
            // setHeaders(res);
            res.onAborted(() =>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/home.html", {encoding: 'utf-8'}));
            }
        });


        /**
         * The search page of transcript.fm. 
         */
        this.webServer.get("/search/:query", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Search.html", {encoding: 'utf-8'}));
            }
        })

        //This is to be used as an API route from /transcription/:id route
        this.webServer.get("/podcast/:id", (res,req) => {
            res.onAborted(() =>{
                res.aborted = true;
            });

            var id = req.getParameter("id");
            if(!validator.isNumeric(id) && !res.aborted){
                res.end("err");
            }else{
                this.pool.query("SELECT t.transcription, t.description, t.podcastname, t.title, p.imageuri, t.duration FROM transcriptions AS t JOIN podcasts AS p ON p.name = t.podcastname WHERE t.id = " + id + " LIMIT 1;", (err, queryResult) =>{
                    if(!err && !res.aborted) {
                        res.end(JSON.stringify(queryResult.rows));
                    }
                    else if(err && !res.aborted){
                        res.end("err" + err);
                    }
                });
            }
        })


        // This is the generic transcription route used by search. Its the nice view as opposed to /podcast/:id
        //which returns just the transcription text
        this.webServer.get("/transcription/:id", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Transcription.html", {encoding: 'utf-8'}));
            }
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



        this.webServer.get("/about", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/About.html", {encoding: 'utf-8'}));
            }
        });

        this.webServer.get("/account", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Account.html", {encoding: 'utf-8'}));
            }
        });

        this.webServer.get("/explore", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Explore.html", {encoding: 'utf-8'}));
            }
        });


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

