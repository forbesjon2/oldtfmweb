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



UPDATE podcasts SET category = '1,' WHERE category = 'Society & Culture';
UPDATE podcasts SET category = '2,' WHERE category = 'News & Politics';
UPDATE podcasts SET category = '3,' WHERE category = 'Comedy';
UPDATE podcasts SET category = '4,' WHERE category = 'Business';
UPDATE podcasts SET category = '6,' WHERE category = 'Technology';
UPDATE podcasts SET category = '9,' WHERE category = 'History';
UPDATE podcasts SET category = '12,' WHERE category = 'Literature';
UPDATE podcasts SET category = '13,' WHERE category = 'Natural Sciences';
UPDATE podcasts SET category = '15,' WHERE category = 'Performing Arts';
UPDATE podcasts SET category = '17,' WHERE category = 'Science & Medicine';
UPDATE podcasts SET category = '19,' WHERE category = 'TV & Film';
UPDATE podcasts SET category = '22,' WHERE category = 'Health';
UPDATE podcasts SET category = '23,' WHERE category = 'Other Games';
UPDATE podcasts SET category = '24,' WHERE category = 'Games & Hobbies';
UPDATE podcasts SET category = '26,' WHERE category = 'Personal Journals';
UPDATE podcasts SET category = '27,' WHERE category = 'Social Sciences';
UPDATE podcasts SET category = '29,' WHERE category = 'Arts';
UPDATE podcasts SET category = '29,' WHERE category = 'Music';
UPDATE podcasts SET category = '29,' WHERE category = 'Education';
UPDATE podcasts SET category = '29,' WHERE category = 'Government & Organizations';


UPDATE podcasts SET category = '1,' WHERE category = 'Society & Culture';UPDATE podcasts SET category = '2,' WHERE category = 'News & Politics';UPDATE podcasts SET category = '3,' WHERE category = 'Comedy';UPDATE podcasts SET category = '4,' WHERE category = 'Business';UPDATE podcasts SET category = '6,' WHERE category = 'Technology';UPDATE podcasts SET category = '9,' WHERE category = 'History';UPDATE podcasts SET category = '12,' WHERE category = 'Literature';UPDATE podcasts SET category = '13,' WHERE category = 'Natural Sciences';UPDATE podcasts SET category = '15,' WHERE category = 'Performing Arts';UPDATE podcasts SET category = '17,' WHERE category = 'Science & Medicine';UPDATE podcasts SET category = '19,' WHERE category = 'TV & Film';UPDATE podcasts SET category = '22,' WHERE category = 'Health';UPDATE podcasts SET category = '23,' WHERE category = 'Other Games';UPDATE podcasts SET category = '24,' WHERE category = 'Games & Hobbies';UPDATE podcasts SET category = '26,' WHERE category = 'Personal Journals';UPDATE podcasts SET category = '27,' WHERE category = 'Social Sciences';UPDATE podcasts SET category = '29,' WHERE category = 'Arts';UPDATE podcasts SET category = '29,' WHERE category = 'Music';UPDATE podcasts SET category = '29,' WHERE category = 'Education';UPDATE podcasts SET category = '29,' WHERE category = 'Government & Organizations';


CREATE TABLE users(username varchar(125) UNIQUE NOT NULL, hash text NOT NULL);