<?php
//TODO: I REALLY NEED MYSQL SANITATION

//how this works php script works- on ajax posts from either view.js/report.js/register.js it will do mysql queries

//creates mysqli connection object...   
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

//dependency for the getid3 library
require_once("getID3/getid3/getid3.php");

//if error kill urself
if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}


//NEW THING TO HANDLE REPORT SAVING TO MYSQL DATABASE AND PICTURE SAVING
//does the report text and the picture in one go!
//the trigger to this ajax POST response is only after validation!
//stores the text/coords into mysql, then gets the primary key of that new mysql to
//use as the name of the uploaded photo
//file extension is also saved in the mysql db so we can figure out the the the corresponding photo/video
// i.e. for mysql record with a primary key of "1" and an extension of "png" the corresponding file is "1.png"
//makes the files simple to track
//also by default gps coordinates will be attempted to be extracted from the meta data of the pictures/videos. 
//If none are present the gps coordinates from the report post will be stored. those "backup" gps coordinates are the location of the phone when the report was submitted.

// DO i need further validation? *scratches head
//TODO: oh yeah, mysql sanitation kek
else if(isset($_REQUEST['name'])){
   $text = $_POST['text'];
   $name = $_POST['name'];
   $ext = end(explode(".",$_FILES['pic']['name']));
  // $coords = $_POST['coords'];

   
   $getID3 = new getID3;

   // Analyze file and store returned data in $ThisFileInfo
   $metaData = $getID3->analyze($_FILES['pic']['tmp_name']);
   getid3_lib::CopyTagsToComments($metaData);
  // var_dump($metaData);
   if(isset($metaData['tags_html']['quicktime']['gps_latitude'])) {
      $coords = array( 0 => $metaData['tags']['quicktime']['gps_latitude'][0], 1 => $metaData['tags']['quicktime']['gps_longitude'][0]);
   }
   else if(isset($metaData['jpg']['exif']['GPS']['computed'])) {
      $coords = array(0 => $metaData['jpg']['exif']['GPS']['computed']['latitude'], 1 => $metaData['jpg']['exif']['GPS']['computed']['longitude']);
   }
   else {
      $coords = $_POST['coords'];
   }


   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_text, gps_ext, gps_name) ".
       "VALUES ".
       "('$coords[0]', '$coords[1]','$text','$ext','$name')";
   $result = mysqli_query($mysqli,$sql_q);
   if(!$result) {
      printf("report insert error\n");
      exit;
   }
   $sql_q2 = "SELECT * FROM GPSCOORDS_TB1
     ORDER BY gps_id DESC
      LIMIT 0,1";
   $result2 = mysqli_query($mysqli,$sql_q2);
   
   if(!$result2) {
      printf("report select primary key error\n");
      exit;
   }
   
   $record = mysqli_fetch_array($result2, MYSQL_ASSOC);

   mysqli_free_result($result);
   mysqli_free_result($result2);

   $file = $_FILES['pic']; 
   $fileContent = file_get_contents($file['tmp_name']);


   $test = fopen("../pic/".$record['gps_id'].".".$ext,"x");
   if(!$test)
      echo "couldnt open";
   else
      printf("writin file\n");
   fwrite($test, $fileContent);





   fclose($test);
        
}

// on this POST, registers the name and team id in the mysql database table 2!
else if(isset($_REQUEST['namereg'])){
   $teamid = $_POST['teamid'];
   $name = $_POST['namereg'];
   $sql_q = "INSERT INTO GPSCOORDS_TB2 ".
            "(gps_teamid, gps_name)".
            "VALUES".
            "('$teamid', '$name')";
   $result = mysqli_query($mysqli, $sql_q);
   if(!$result) {
      echo "error in registering name n stuff";
   }
   mysqli_free_result($result);

}

// on this POST, saves the random report
else if(isset($_REQUEST['rand'])){
   $rand = $_POST['rand'];
   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_text, gps_ext, gps_name) ".
       "VALUES ".
       "('$rand[0]', '$rand[1]','$rand[2]','$rand[3]','$rand[4]')";
   $result = mysqli_query($mysqli,$sql_q);
   if(!$result) {
      printf("report insert error\n");
      exit;
   }
   mysqli_free_result($result);


}


//on this post, gets all the names out of the mysql db table 2!

else if(isset($_REQUEST['getnames'])){

   $arr = array();
   $sql_q = 'SELECT gps_id, gps_name 
        FROM GPSCOORDS_TB2';
   $retval = mysqli_query( $mysqli, $sql_q);
   if(! $retval ) {
      printf("getcoords error\n");
      exit;
   }
   while($row = mysqli_fetch_array($retval, MYSQL_ASSOC))  
      $arr[] = $row;

   echo json_encode($arr);
   mysqli_free_result($retval); 
   unset($arr);
}


mysqli_close($mysqli);


//functions to get gps data from exif instead of the report
function getGps($exifCoord, $hemi) {

    $degrees = count($exifCoord) > 0 ? gps2Num($exifCoord[0]) : 0;
    $minutes = count($exifCoord) > 1 ? gps2Num($exifCoord[1]) : 0;
    $seconds = count($exifCoord) > 2 ? gps2Num($exifCoord[2]) : 0;

    $flip = ($hemi == 'W' or $hemi == 'S') ? -1 : 1;

    return $flip * ($degrees + $minutes / 60 + $seconds / 3600);

}

function gps2Num($coordPart) {

    $parts = explode('/', $coordPart);

    if (count($parts) <= 0)
        return 0;

    if (count($parts) == 1)
        return $parts[0];

    return floatval($parts[0]) / floatval($parts[1]);
}

?>
