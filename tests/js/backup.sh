mysqldump -u root -pApplez255 GPSCOORDS > mysql_back
aws s3 cp pic s3://fitreports/pic/"$(date +'%F_%T')" --recursive
aws s3 cp mysql_back s3://fitreports/mysql/"$(date +'%F_%T')"
rm mysql_back
