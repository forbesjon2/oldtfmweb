# Setting up postgres & starting the web app
Install postgresql.
<br>
<br>

Trust the local connection by adding it in pg_hba.conf file.
**local all postgres trust**

<br>
<br>


Upload the SQL dump file by writing the following line: <br>
psql -U postgres -d ditto -f ./db9.sql

<br>
<br>

If you don't have python 2.7, download it by typign the following: <br>
sudo add-apt-repository ppa:deadsnakes/ppa <br>
sudo apt-get update	<br>
sudo apt-get install python2.7 <br>

<br>
<br>
