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
            // Get the Json and make sure its all letters or numbers

            let readJ = function (res){
              return new Promise(function(resolve, reject){
                readJson(res, (obj) => {
                  var query = obj.query;
                  console.log("qu" +  obj.query);
                  if(validator.isAlphanumeric(query.replace(" ", ""))){
                    resolve(query);
                  }else{
                    reject("Not alphanumeric");
                  }
                  }, () => {
                    reject("Error, invalid Json");
                  });
                })
              }
              
              readJ(res).then(function(response){
                return indexRankAndHighlightQuery(response, 10, localPool, res);
              }).catch(function(err){
                res.end(err);
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
            try{
              res.close();
            }catch(e){}
            return;
          }
          cb(json);
        } else {
          try {
            json = JSON.parse(chunk);
          } catch (e) {
            /* res.close calls onAborted */
            try{
              res.close();
            }catch(e){}
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
/* Register error cb */
res.onAborted(err);
}

module.exports = {Routes}