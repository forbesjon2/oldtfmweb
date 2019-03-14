SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') LIMIT 10;


SELECT ts_headline('english',transcription, plainto_tsquery('liberal democrat')) FROM transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') LIMIT 10;


SELECT ts_headline('english',(coalesce(transcription, '') || ' . ' || coalesce(title, '') || ' . ' || coalesce(description)), plainto_tsquery('liberal democrat')) from transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') LIMIT 10;
SELECT  plainto_tsquery('liberal democrat')) from transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') LIMIT 10;
ts_headline('english',(coalesce(transcription, '') || ' . ' || coalesce(title, '') || ' . ' || coalesce(description))
EXPLAIN ANALYZE SELECT  ts_rank_cd(tsv, plainto_tsquery('liberal democrats')) AS rank FROM transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') ORDER BY rank DESC LIMIT 5;



-- this gets a ranked list of 10 id's that match the query
SELECT id FROM transcriptions WHERE tsv @@ plainto_tsquery('liberal democrat') ORDER BY ts_rank_cd(tsv, plainto_tsquery('liberal democrats')) DESC LIMIT 10;

-- This prints the array of values as a row
WITH arr(ids) AS (VALUES('["314", "78", "44", "339", "49", "373", "317", "210", "304", "159"]')) SELECT elem::int FROM arr, json_array_elements_text(ids::json) elem; 

-- This recieves an array of integers in JSON format as well as the query and returns highlighted results of the words listed in plainto_tsquery
WITH arr(ids) AS (VALUES('["314", "78", "44", "339", "49", "373", "317", "210", "304", "159"]')) SELECT ts_headline('english',(coalesce(transcription, '') || ' . ' || coalesce(title, '') || ' . ' || coalesce(description)), plainto_tsquery('liberal democrat')) FROM transcriptions WHERE id IN (SELECT elem::int FROM arr, json_array_elements_text(ids::json) elem);
SELECT ts_headline('english',(coalesce(transcription, '') || ' ... ' || coalesce(description)), plainto_tsquery('democrat'), 'MinWords=20, MaxWords=70'), id, title FROM transcriptions where id = 142;
SELECT ts_headline('english',(coalesce(transcription, '') || ' . ' || coalesce(title, '') || ' . ' || coalesce(description)), plainto_tsquery('democrat')), id, title FROM transcriptions where id = 142;


-- LIMIT X OFFSET Y; to get y number of results after the first page