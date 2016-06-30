<?php
//TODO: I REALLY NEED MYSQL SANITATION

//creates mysqli connection object...   
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

//if error kill urself
if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}


//NEW THING TO HANDLE REPORT SAVING TO MYSQL DATABASE
//does the report text and the picture in one go!
//the trigger to this ajax response is only after validation!
//stores the text/coords into mysql, then gets the primary key of that new mysql
//record to use as the picturename. makes the pics simple to track

// DO i need further validation? *scratches head
// oh yeah, mysql sanitation kek
else if(isset($_REQUEST['name'])){
   $coords = $_POST['coords'];
   $title = $_POST['title'];
   $text = $_POST['text'];
   $name = $_POST['name'];
   $ext = end(explode(".",$_FILES['pic']['name']));
   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_title, gps_text, gps_ext, gps_name) ".
       "VALUES ".
       "('$coords[0]', '$coords[1]','$title','$text','$ext','$name')";
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
   $n = $file['name']; 
   $s = $file['size']; 
   $fileContent = file_get_contents($file['tmp_name']);
   $test = fopen("../pic/".$record['gps_id'].".".$ext,"x");
   if(!$test)
      echo "couldnt open";
   else
      printf("writin file\n");
   fwrite($test, $fileContent);
   fclose($test);
        
}



//on POST from js, clears the entire mysql db:w

else if(isset($_REQUEST['clear'])){
  
   $sql_q = "TRUNCATE TABLE GPSCOORDS_TB1";
   $result = mysqli_query($mysqli,$sql_q);
   if(!$result ) {
      printf("delete error\n");
      exit;
   }
   else {
      printf("clear table succ\n");
   }
   mysqli_free_result($result);
}


//on correct POST, shows result of mysql database
else if(isset($_REQUEST['show'])){
   printf("SHOW ME DA MONEY\n");
   $sql_q = 'SELECT gps_id, gps_lat, gps_long, gps_title, gps_text, gps_ext, gps_name
        FROM GPSCOORDS_TB1';
 //  mysql_select_db('GPSCOORDS');
   $retval = mysqli_query( $mysqli, $sql_q);
   if(! $retval ) {
      printf("retreieve error\n");
      exit;
   }
   
   while($row = mysqli_fetch_array($retval, MYSQL_ASSOC)) {
    echo "GPS ID :{$row['gps_id']}  <br> ".
         "GPS LAT: {$row ['gps_lat']} <br> ".
         "GPS LONG: {$row['gps_long']} <br> ".
         "GPS TITLE: {$row['gps_title']} <br> ".
         "GPS TEXT: {$row['gps_text']} <br> ".
         "GPS EXT: {$row['gps_ext']} <br> ".
         "GPS NAME: {$row['gps_name']} <br> ".
         "--------------------------------<br>";
   }
   mysqli_free_result($result);
}

//on this POST, gets all the reports out of the mysql db
else if(isset($_REQUEST['getreports'])){

   $arr = array();
   $sql_q = 'SELECT gps_id, gps_lat, gps_long, gps_title, gps_text, gps_ext, gps_name, gps_timestamp  
        FROM GPSCOORDS_TB1';
   $retval = mysqli_query( $mysqli, $sql_q);
   if(! $retval ) {
      printf("getcoords error\n");
      exit;
   }
   while($row = mysqli_fetch_array($retval, MYSQL_ASSOC))  
      $arr[] = $row;

   echo json_encode($arr);
   mysqli_free_result($retval); 
}

mysqli_close($mysqli);
?>
