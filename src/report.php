<?php
//TODO: I REALLY NEED MYSQL SANITATION

//how this works php script works- on ajax posts from either view.js/report.js/register.js it will do mysql queries

//creates mysqli connection object...   
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

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
//file extension is also saved in the mysql db so we can figure out the the the corresponding photo
// i.e. for mysql record with a primary key of "1" and an extension of "png" the corresponding file is "1.png"
//makes the pics simple to track

// DO i need further validation? *scratches head
// oh yeah, mysql sanitation kek
else if(isset($_REQUEST['name'])){
   $coords = $_POST['coords'];
   $text = $_POST['text'];
   $name = $_POST['name'];
   var_dump($name);
   $ext = end(explode(".",$_FILES['pic']['name']));
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

//on this POST, gets all the reports out of the mysql db
else if(isset($_REQUEST['getreports'])){

   $arr = array();
   $sql_q = 'SELECT gps_id, gps_lat, gps_long, gps_text, gps_ext, gps_name, gps_timestamp  
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
   unset($arr);
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

//on this post, removes a mysql record with this id
//also removes the picture!
//god damnit do i really have to query out the extension.... Dx
//i should really call this delete_id so its more clear...
else if(isset($_REQUEST['id'])){

   $id = $_POST['id']; 

   $sql_q = 'SELECT gps_ext
        FROM GPSCOORDS_TB1 WHERE gps_id =' . $id;
   $retval = mysqli_query( $mysqli, $sql_q);
   if(! $retval ) {
      printf("getext  error\n");
      exit;
   }
   $ext = mysqli_fetch_array($retval,MYSQL_ASSOC);
   $name ="../pic/" . $id . "." . $ext['gps_ext'];
   if(!unlink($name))
      echo "failed to delete pic";
   mysqli_free_result($retval);



   $sql_q2 = 'DELETE FROM GPSCOORDS_TB1 WHERE gps_id = '. $id ;
   $retval2 = mysqli_query( $mysqli, $sql_q2);
   if(! $retval2) {
      printf("single record delete error\n");
      exit;
   }
   else 
      echo "succ one record delete";

   mysqli_free_result($retval2); 
}

//On this POST, only get the records specified by the date range
else if(isset($_REQUEST['range'])){
   $range = $_POST['range'];
   
   $arr = array();
   $sql_q = 'SELECT * 
        FROM GPSCOORDS_TB1 WHERE gps_timestamp BETWEEN "' . $range[0] .'" AND "' .$range[1] . '"'  ;
   $retval = mysqli_query( $mysqli, $sql_q);
   if(! $retval ) {
      printf("get filtered reports  error\n");
      exit;
   }
   while($row = mysqli_fetch_array($retval, MYSQL_ASSOC))  
      $arr[] = $row;

   echo json_encode($arr);
   mysqli_free_result($retval); 
   unset($arr);
}

mysqli_close($mysqli);
?>
