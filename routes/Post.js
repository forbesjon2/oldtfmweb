var validator = require("validator");
const {indexRankAndHighlightQuery} = require("../queries/PreparedStatements");



class Routes{
    constructor(webServer, pool){
        this.webServer = webServer;
        this.pool = pool;
    }
    attachPostRoutes(){
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

module.exports = {Routes}