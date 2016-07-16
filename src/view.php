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
        FROM GPSCOORDS_TB1 WHERE gps_timestamp BETWEEN ' . $range[0] .' AND ' .$range[1]   ;
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
