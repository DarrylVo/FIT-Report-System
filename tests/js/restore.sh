aws s3 cp s3://fitreports/mysql/"$(aws s3 ls s3://fitreports/mysql/ |sort | tail -1| awk '{print $4}')" mysql_back
mysql -u root -pApplez255 GPSCOORDS < mysql_back
rm mysql_back

./clearPic
aws s3 cp s3://fitreports/pic/"$(aws s3 ls s3://fitreports/pic/ |sort | tail -1| awk '{print $2}')" ./pic --recursive 

