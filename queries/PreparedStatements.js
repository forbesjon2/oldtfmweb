/**
 * Because were not using very complex queries. Using prepared statments for
 * optimization purposes isn't really the point. This file stores prepared statements
 * to protect forom SQL injection in case malicious sequences are attempted 
 */
const validator = require('validator');
// ------------------query return fields
// command, rowCount, oid, rows, fields, _parsers, RowCtor, rowAsArray, _getTypeParser, addCommandComplete, _parseRowAsArray, parseRow, addRow, addFields

/**
 * This returns an array (as string) of index values that match the query provided
 * and returns false if something happened
 * 
 * @param {String} query The words you want to index
 * @param {Int} numResults The max number of results that you want to be listed 
 * @param {pg} pool The instance of postgres pool
 */
function indexRankQuery(query, numResults, pool){
    const preparedQuery =  {
        name: "index-query",
        text: "SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC LIMIT $2;",
        values: [query, numResults]
    };

    var resultStr = "[";


    let runQ = function(preparedQuery, resultStr){
        return new Promise(function(resolve, reject){
            pool.query(preparedQuery, (err, qr) =>{
                if(!err){
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "\"" + qr.rows[i].id + "\", ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    resolve(resultStr);
                }else{
                    reject("error in IRQ");
                }
            })
        })
    }
    
    runQ(preparedQuery, resultStr).then(function(resultStr){
        return resultStr;
    }).catch(function(error){
        console.log("fuck an error panement " + error);
    })
    
}



/**
 * Takes the array of id's from indexRankQuery  as well as the original
 * query and highlights the results. Returns false if something bad happened
 * 
 * @param {String} idArray array of id's 
 * @param {String} query the query text
 * @param {pg} pool postgres client pool
 * @param {res} res response
 */
function indexRankAndHighlightQuery(query, numResults, pool, res){
    const preparedRankQuery =  {
        name: "index-query",
        text: "SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery($1) ORDER BY ts_rank_cd(tsv, plainto_tsquery($1)) DESC LIMIT $2;",
        values: [query, numResults]
    };


    let runQ = function(preparedQuery, resultStr){
        return new Promise(function(resolve, reject){
            pool.query(preparedQuery, (err, qr) =>{
                if(!err){
                    for(var i = 0; i < qr.rows.length; ++i) resultStr += "\"" + qr.rows[i].id + "\", ";
                    resultStr = resultStr.slice(0, resultStr.length - 2) + "]";
                    resolve(resultStr);
                }else{
                    reject("error in IRQ");
                }
            })
        })}


    let runH = function(preparedHighlightQuery,){
        return new Promise(function(resolve, reject){
            pool.query(preparedHighlightQuery, (err, qr) => {
                if(!err){
                    for(var i = 0; i < qr.rows.length; ++i) {
                        highlightStr += "{\"" + qr.rows[i].ts_headline + "\", \"" + qr.rows[i].id + "\", \"" + qr.rows[i].title + "\", \"" + qr.rows[i].podcastname + "\"}, ";
                    }
                    resolve(highlightStr.slice(0, highlightStr.length - 2) + "]");
                }else{
                    console.log("somethgn f up");
                    reject("Error in runH");
                }
            });
        })}

    var resultStr = "[";
    var highlightStr = "[";

    runQ(preparedRankQuery, resultStr).then(function(idArray){
        const preparedHighlightQuery = {
            name: "highlight-query",
            text: "WITH arr(ids) AS (VALUES($1)) SELECT ts_headline('english',(coalesce(transcription, '') || ' ... '|| coalesce(description)), plainto_tsquery($2), 'MinWords=20, MaxWords=70'), id, title, podcastname FROM transcriptions WHERE id IN (SELECT elem::int FROM arr, json_array_elements_text(ids::json) elem);",
            values: [idArray, query]
        };
        return runH(preparedHighlightQuery);
    }).then(function(highlights){
        res.end(highlights);
    }).catch(function(error){
        res.end("An error happened with message " + error);
    })
}



module.exports = {indexRankQuery, indexRankAndHighlightQuery};

