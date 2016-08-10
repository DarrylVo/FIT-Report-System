<?php

//how this works php script works- on ajax posts from either view.js/register.js it will do mysql queries

//creates mysqli connection object...   

$file = file_get_contents("../../mysqlpass");
$file = preg_replace('/\s+/', '', $file);
$mysqli = new mysqli("localhost", "root", $file, "GPSCOORDS");
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
else if(isset($_REQUEST['name'])){
   $text =filter_input(INPUT_POST,'text', FILTER_SANITIZE_STRING);
   $name = filter_input(INPUT_POST,'name', FILTER_SANITIZE_STRING);
   $ext = end(explode(".",$_FILES['pic']['name']));
   $date;
   $coords;
   $rotation;

   $timestamp_flag = true;
   $gps_flag = true;
   $stmt;
  // $coords = $_POST['coords'];

  //uses id3 library to get metadata about video/photos 
   $getID3 = new getID3;

   $metaData = $getID3->analyze($_FILES['pic']['tmp_name']);
   getid3_lib::CopyTagsToComments($metaData);
 
   //exec call to use exif tool since php read_exif_data() for iphone photos is broken...
   exec("exif ". $_FILES['pic']['tmp_name'] . ' | grep -e "Latitude" -e "Longitude"', $output);
   exec("exif ". $_FILES['pic']['tmp_name'] . ' | grep -e "North or" -e "East or"', $direction);

    //if the file has video gps metadata....
   if(isset($metaData['tags_html']['quicktime']['gps_latitude'])) {
      $gps_flag = false;
      $coords = array( 0 => $metaData['tags']['quicktime']['gps_latitude'][0], 1 => $metaData['tags']['quicktime']['gps_longitude'][0]);
   }
   //if its a (android)picture file with gps coords...
   else if(isset($metaData['jpg']['exif']['GPS']['computed'])) {
     // echo "found picture with gps coordinates";
      $gps_flag = false;
      $coords = array(0 => $metaData['jpg']['exif']['GPS']['computed']['latitude'], 
        1 => $metaData['jpg']['exif']['GPS']['computed']['longitude']);
   }
   //the getid3 library no longer works for geo tagged iphone pictures for recent versions of php, 
   //have to use exec call to "exif" to get the data out instead
   //this checks if the exec call got anything 
   else if(count($output) == 2) {
      $lat_dir = explode('|',$direction[0]);
      $lon_dir = explode('|',$direction[1]);
      $lat_temp = explode(',',explode('|',$output[0])[1]);
      $lat_temp[0] = floatval($lat_temp[0]);
      $lat_temp[1] = floatval($lat_temp[1]);
      $lat_temp[2] = floatval($lat_temp[2]);
      $lat =$lat_temp[0]+((($lat_temp[1]*60)+($lat_temp[2]))/floatval(3600)); 
      $lon_temp = explode(',',explode('|',$output[1])[1]);
      $lon_temp[0] = floatval($lon_temp[0]);
      $lon_temp[1] = floatval($lon_temp[1]);
      $lon_temp[2] = floatval($lon_temp[2]);
      $lon =$lon_temp[0]+((($lon_temp[1]*60)+($lon_temp[2]))/floatval(3600)); 
      if($lat_dir[1] == 'S')
         $lat = -$lat;
      if($lon_dir[1] == 'W')
         $lon = -$lon;
      $coords = [$lat, $lon];
      $gps_flag = false;
      $rotation = $metaData['jpg']['exif']['IFD0']['Orientation'];
   }

   //if it has no gps coordinates...
   else {
       //echo "couldnt find any gps coordinates";
      $coords = $_POST['coords'];
   }
      //TIMESTAMP CHECKING HERE
      //but it may still have an iphone timestamp
   if(isset($metaData['tags_html']['quicktime']['creationdate'])) {
      // $date = date('Y-m-d H:i:s', $metaData['tags_html']['quicktime']['creationdate']); 
      $exp = explode("T", $metaData['tags_html']['quicktime']['creationdate'][0]);
      $date = $exp[0] ." ". substr($exp[1],0,-5);
      $timestamp_flag = false;
   }

   //but it may still have an android video timestamp
   else if(isset($metaData['quicktime']['moov']['subatoms'][0]['creation_time_unix'])) {
      //echo "found android video timestamp";
      $date = date('Y-m-d H:i:s', $metaData['quicktime']['moov']['subatoms'][0]['creation_time_unix']); 
      $timestamp_flag = false;
   }
   //or a photo timestamp...
   else if(isset($metaData['jpg']['exif']['IFD0']['DateTime'])) {
      //echo "found photo timestamp";
      $date = $metaData['jpg']['exif']['IFD0']['DateTime'];
      $timestamp_flag = false;
   }
   //or absolutely nothing at all
   if($timestamp_flag == false) {
      $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
        "(gps_lat, gps_long, gps_text, gps_ext, gps_name, gps_timestamp, default_gps, default_timestamp) ".
        "VALUES ".
        "(?, ?, ?, ?, ?, ?, ?, ?)";
      $stmt = $mysqli->prepare($sql_q);
      $stmt->bind_param('ddssssii', $coords[0], $coords[1], $text, $ext, $name, $date, $gps_flag, $timestamp_flag);
   }
   else {
      $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
        "(gps_lat, gps_long, gps_text, gps_ext, gps_name, default_gps, default_timestamp) ".
        "VALUES ".
        "(?, ?, ?, ?, ?, ?, ?)";
      $stmt = $mysqli->prepare($sql_q);
      $stmt->bind_param('ddsssii', $coords[0], $coords[1], $text, $ext, $name, $gps_flag, $timestamp_flag);
   }
   
   if(!$stmt->execute()) {
      printf("report insert error\n");
      echo $stmt->error;
      exit;
   }



   $sql_q2 = "SELECT gps_id FROM GPSCOORDS_TB1
     ORDER BY gps_id DESC
      LIMIT 0,1";
   $stmt2 = $mysqli->prepare($sql_q2);
   $stmt2->bind_result($record);   
   
   if(!$stmt2->execute()) {
      printf("report select primary key error\n");
      exit;
   }
   $stmt2->fetch(); 

   $file = $_FILES['pic']; 
   $fileContent = file_get_contents($file['tmp_name']);

   if(isset($rotation)) {
       
      $fileContent = imagecreatefromstring($fileContent);
      switch($rotation) {
     
         case 8:
            $fileContent = imagerotate($fileContent,90,0);
            break;
         case 3:
            $fileContent = imagerotate($fileContent,180,0);
            break;
         case 6:
            $fileContent = imagerotate($fileContent,-90,0);
            break;
      }
      imagejpeg($fileContent,"../pic/".$record.".".$ext);
   }
   else {
      $test = fopen("../pic/".$record.".".$ext,"x");
      if(!$test) {
         echo "couldnt open";
         exit;
      }
      fwrite($test, $fileContent);
      fclose($test);
   }

   $stmt->free_result();
   $stmt->close();

   $stmt2->free_result();
   $stmt2->close();
   echo "Report Saved Succesfully";

}

// on this POST, registers the name and team id in the mysql database table 2!
else if(isset($_REQUEST['namereg'])){
   $name = filter_input(INPUT_POST, 'namereg', FILTER_SANITIZE_STRING);

   $stmt1 = $mysqli->prepare("SELECT * FROM GPSCOORDS_TB2 WHERE
      gps_name = ? LIMIT 1");
   $stmt1->bind_param('s',$name);
   $stmt1->execute();
   $stmt1->store_result();
   

   if($stmt1->num_rows > 0) {
      echo "error";
      exit;
   }
   else {
      $stmt2 = $mysqli->prepare("INSERT INTO GPSCOORDS_TB2 (gps_name) VALUES (?)");
      $stmt2->bind_param('s',$name);
      
      if(!$stmt2->execute()) {
         echo "error in registering name n stuff";
         exit;
      }
      $stmt2->store_result();
      $stmt2->free_result();
      $stmt2->close();
   }
   $stmt1->free_result();
   $stmt1->close();
   echo "succ";
}
/*
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
}*/

//on this post, gets all the names out of the mysql db table 2!

else if(isset($_REQUEST['getnames'])){

   $arr = array();
   $sql_q = 'SELECT gps_name 
        FROM GPSCOORDS_TB2';
   $stmt = $mysqli->prepare($sql_q);
   $stmt->bind_result($name);

   if(!$stmt->execute()) {
      printf("genames error\n");
      exit;
   }
   $stmt->store_result();
   while($stmt->fetch())  
      $arr[] = $name;

   echo json_encode($arr);
   $stmt->free_result();
   $stmt->close(); 
   unset($arr);
}

mysqli_close($mysqli);




?>
