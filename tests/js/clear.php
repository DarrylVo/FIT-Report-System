<?php
$file = file_get_contents("../../../mysqlpass");
$file = preg_replace('/\s+/', '', $file);
$mysqli = new mysqli("localhost", "root", $file, "GPSCOORDS");

$mysqli->real_query("TRUNCATE GPSCOORDS_TB1");

$mysqli->real_query("TRUNCATE GPSCOORDS_TB2");
$files = glob('/var/www/html/pic/*'); // get all file names
foreach($files as $file){ // iterate files
  if(is_file($file))
    unlink($file); // delete file
}

echo "succ";
?>
