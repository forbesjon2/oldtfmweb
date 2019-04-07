var fs = require("fs");
const {getPodcastDetails, getShowList, checkIfLoggedIn} = require("../queries/PreparedStatements");



class Routes{
    constructor(webServer, pool){
        this.webServer = webServer;
        this.pool = pool;
    }

    /**********************************************************************
     * This covers the majority of the primary and secondary GET routes.
     * This does not include API endpoints so all routes will involve
     * reading and sending the contents of a .html file.
     * 
     * Everything is listed according to the page it is used in each
     * separated by a hard to miss legend separating primary from
     * secondary routes (see below)
     * 
     * 
     * PRIMARY ROUTES: all items here have a url path of 1.
     * includes account, explore, contact, account & the homepage.
     * 
     * 
     * SECONDARY ROUTES: Everything else with a path greater than 2
     * navigations to this page usually happens when you interact with
     * a part of the website. These routes are usually documented unlike
     * the primary routes
     * 
     * Example: /Explore is a primary route, 
     * /explore/<something> is a secondary route
     **********************************************************************/
    attachGetRoutes(){
//______________________________________PRIMARY ROUTES_____________________________________________________
        this.webServer.get("/", (res,req) =>{
            res.onAborted(() =>{
                res.aborted = true;
            });
            console.log("SS",req.getHeader("cookie"));
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Home.html", {encoding: 'utf-8'}));
            }
        });

        this.webServer.get("/about", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/About.html", {encoding: 'utf-8'}));
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

        
        this.webServer.get("/contact", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Contact.html", {encoding: 'utf-8'}));
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




//______________________________________SECONDARY ROUTES_____________________________________________________

        /**********************************************************************
         * The search page of transcript.fm. Any query is technically valid
         * however its sanitized later on in the API. Note: the query is 
         * sent via a POST request on page load
         * 
         * This is for generic search (/query/page)
         **********************************************************************/
        this.webServer.get("/search/:ds/:ds1", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Search.html", {encoding: 'utf-8'}));
            }
        })

        /**********************************************************************
         * The search page of transcript.fm. Any query is technically valid
         * however its sanitized later on in the API. Note: the query is 
         * sent via a POST request on page load
         **********************************************************************/
        this.webServer.get("/show/:id", (res, req) =>{
            res.onAborted(() =>{
                res.onAborted = true;
            });
            if(!res.onAborted){
                res.end(fs.readFileSync("./mainPages/Show.html", {encoding: 'utf-8'}));
            }
        });

        this.webServer.get("/explore/:ds", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/ExploreSecondary.html", {encoding: 'utf-8'}));
            }
        });

        //______________________________________TERTIARY ROUTES_____________________________________________________
        this.webServer.get("/explore/:ds/:ds2", (res,req) =>{
            res.onAborted(()=> {
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/ExploreTertiary.html", {encoding: 'utf-8'}));
            }
        });
        
        /**********************************************************************
         * This is the generic transcription route used by search. Its the nice
         * view as opposed to /podcast/:id which returns just the transcription
         * text
         **********************************************************************/ 
        this.webServer.get("/explore/:ds/:ds2/:ds3", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Transcription.html", {encoding: 'utf-8'}));
            }
        })

        /**********************************************************************
         * The search page of transcript.fm. Any query is technically valid
         * however its sanitized later on in the API. Note: the query is 
         * sent via a POST request on page load, the data is just stored in
         * the URL
         * 
         * This is for more specific search (/podcast/query/page)
         **********************************************************************/
        this.webServer.get("/search/:ds/:ds1/:ds2", (res, req) =>{
            res.onAborted(()=>{
                res.aborted = true;
            });
            if(!res.aborted){
                res.end(fs.readFileSync("./mainPages/Search.html", {encoding: 'utf-8'}));
            }
        })
        return this.webServer;
    }










    /*********************************************************************
     * This is where all of the GET API endpoints are located.
     * These dont return HTML but rather content mostly in JSON format.
     * 
     * Everything is listed according to the page it is used in each
     * separated by a hard to miss legend (see below)
     **********************************************************************/
    attachGetAPIRoutes(){
//______________________________________EXPLORE PAGE ENDPOINTS_____________________________________________________
        /**********************************************************************
         * This is to be used in explore/browse. Returns the number of 
         * transcriptions, the podcast name, the image url, the category, 
         * and the id (an array of comma separated integers)
         **********************************************************************/
        this.webServer.get("/api/Itunes%20top%20100%20podcasts", (res, req) => {
            res.onAborted(()=> {
                res.aborted = true;
            });
            this.pool.query("SELECT count(t.id), p.id, p.name, p.category, p.imageuri from podcasts AS p JOIN transcriptions AS t ON t.podcastname = p.name GROUP BY p.name, p.imageuri, p.category, p.id;", (err, qr) => {
                if(!err && !res.aborted){
                    var resultStr = "[";
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "{\"count\":\"" + qr.rows[i].count + "\", \"id\":\"" + qr.rows[i].id + "\", \"name\":\"" +  qr.rows[i].name + "\", \"category\":\"" + qr.rows[i].category + "\", \"imageuri\":\"" + qr.rows[i].imageuri + "\"}, ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    res.end(resultStr)
                }else{
                    res.end("err")
                }
            })
        })

        
        /**********************************************************************
         * This is to be used in explore/browse. Returns a list of valid
         * categories and its respective id. This is to be used with
         * the list of podcasts and their array of categories. 
         * 
         * Both this and the /api/podcasts route are called and parsed in the
         * explore page.
         **********************************************************************/
        this.webServer.get("/api/categories", (res, req) => {
            res.onAborted(()=> {
                res.aborted = true;
            });
            this.pool.query("SELECT id, category FROM categories;", (err, qr) => {
                if(!err && !res.aborted){
                    var resultStr = "[";
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "{\"id\":\"" + qr.rows[i].id + "\", \"category\":\""  + qr.rows[i].category + "\"}, ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    res.end(resultStr)
                }else{
                    res.end("err")
                }
            })
        })



        /**********************************************************************
         * This is to be used as an API route from /transcription/:id route
         **********************************************************************/
        this.webServer.get("/api/Itunes%20top%20100%20podcasts/:name", (res,req) => {
            var localPool = this.pool;
            res.onAborted(() =>{
                res.aborted = true;
            });
            getPodcastDetails(decodeURI(req.getParameter("name")), localPool).then(function(message){
                return getShowList(message[0], localPool, message[1]);
            }).then(function(result){
                if(!res.aborted) res.end(JSON.stringify([result[0], result[1]]));
            }).catch(function(err){
                if(!res.aborted) res.end(err);
            });
        })

        return this.webServer;
    }






    /*********************************************************************
     * This is where all of the Account related API routes are located
     **********************************************************************/
    attachAccountAPIRoutes(){

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









/**********************************************************************
 * IDEA GRAVEYARD:
 * routes that are good enough to not be thrown out are stored here
 * probably for future use
 **********************************************************************/

 
// // Figure out a better name for this. Basically we want to get everything you need to know to browse podcasts
// this.webServer.get("/podcastsummary/:id", (res, req) =>{
//     res.onAborted(()=> {
//         res.aborted = true;
//     });
//     var name = req.getParameter("name");
//     this.pool.query("SELECT id, title, description FROM transcriptions WHERE podcastname = (SELECT name FROM podcasts WHERE id = 2 LIMIT 1) ORDER BY date DESC LIMIT 10;", (err, qr) => {
//         if(!err && !res.aborted){
//             var resultStr = "[";
//             for(var i = 0; i < qr.rows.length; ++i) resultStr += "{\"" + qr.rows[i].id + "\", \"" + qr.rows[i].title + "\", \"" +  qr.rows[i].description + "\", \"" + qr.rows[i].imageuri + "\"}, ";
//             resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
//             res.end(resultStr)
//         }else{
//             res.end("err")
//         }
//     })
// })


/**
 * Given an id, get the number of podcasts, the category, the image url, and the name of the podcast
 */
// select p.category, p.imageuri, count(t.id), p.name from podcasts as p JOIN transcriptions as t ON p.name = t.podcastname WHERE p.category SIMILAR TO ('1,%|%,1,%') GROUP BY p.name, p.category, p.imageuri;

// get the number of transcriptions, the podcast name, the image url, and the category (an array of comma separated integers)
//select count(t.id), p.name, p.imageuri, p.category from podcasts as p JOIN transcriptions as t ON t.podcastname = p.name GROUP BY p.name, p.imageuri, p.category;