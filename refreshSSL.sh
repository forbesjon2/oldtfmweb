echo "renewing ssl"
certbot renew
echo "resetting key file stuff"
rm /etc/letsencrypt/live/transcript.fm/fullchain.pem
cat /etc/letsencrypt/live/transcript.fm/cert.pem /etc/letsencrypt/live/transcript.fm/privkey.pem \ | sudo tee /etc/letsencrypt/live/transcript.fm/keyCert.pem

echo "finished"
