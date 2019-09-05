# Setting up postgres & starting the web app
Install postgresql.
<br>
<br>

trust connection by adding in pg_hba.conf file
**local all postgres trust**

<br>
<br>


upload by writing the following line <br>
psql -U postgres -d ditto -f ./db9.sql

<br>
<br>

if you dont have python 2.7 download it here <br>
sudo add-apt-repository ppa:deadsnakes/ppa <br>
sudo apt-get update	<br>
sudo apt-get install python2.7 <br>

<br>
<br>
