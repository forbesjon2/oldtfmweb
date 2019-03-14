const {indexRankQuery, indexRankAndHighlightQuery} = require("../queries/PreparedStatements")
const validator = require('validator');

async function checkID(pool){
    
    pool.query("select case when coalesce(transcription, '') != '' then TRUE else FALSE end as ts from transcriptions WHERE id = " + id + ";", (err, queryResult) =>{
        if(err){
            console.log(err.stack);
            return "err.stack";
        }else{
            console.log("in get async");
            return queryResult.rows[0];
        }
    });
}
async function checkID2(pool){
    try{
        pool.query("select id from transcriptions where id = 142;", (err, queryResult) =>{
            console.log(err, queryResult);
            return "ss";
        });
    }catch(Exception){
        return Exception.stack;
    }
}



class GetRoutes{
    constructor(webServer, pool){
        console.log("inside routes");
        this.webServer = webServer;
        this.pool = pool;
    }
    attachGetRoutes(){
        this.webServer.get("/", (res,req) =>{
            setHeaders(res);
            res.end("insiderotes");
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

        
        this.webServer.post("/search", (res, req) =>{
            var localPool = this.pool;
            res.onAborted(() =>{
                res.aborted = true;
            });
            
            // Get the Json and make sure its all letters or numbers
            let getPromiseJson = function(){
                return new Promise(function(resolve, reject){
                    readJson(res, (obj) => {
                        if(validator.isAlphanumeric(obj.query.replace(" ", ""))){
                            resolve(obj.query);
                        }else{
                            reject("Error, query is not alphanumeric");
                        }
                    }, () => {
                        reject("Error, invalid Json");
                    });
                });
            }
            getPromiseJson().then(function(query){
                indexRankAndHighlightQuery(query, 10, localPool, res);
            }).catch(function(err){
                res.end("Error ahppened " + err);
            })

        });

                


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
        return this.webServer;
    }
}


/* Helper function for reading a posted JSON body */
function readJson(res, cb, err) {
    let buffer;
    /* Register data cb */
    res.onData((ab, isLast) => {
      let chunk = Buffer.from(ab);
      if (isLast) {
        let json;
        if (buffer) {
          try {
            json = JSON.parse(Buffer.concat([buffer, chunk]));
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return;
          }
          cb(json);
        } else {
          try {
            json = JSON.parse(chunk);
          } catch (e) {
            /* res.close calls onAborted */
            res.close();
            return;
          }
          cb(json);
        }
      } else {
        if (buffer) {
          buffer = Buffer.concat([buffer, chunk]);
        } else {
          buffer = Buffer.concat([chunk]);
        }
      }
});
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

module.exports = {
    GetRoutes,
}


