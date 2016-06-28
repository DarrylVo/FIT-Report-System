<?php

//TODO: I REALLY NEED MYSQL SANITATION

//creates mysqli connection object...   
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

//if error kill urself
if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}

//if POST is "report", insert report (only gps coords and text) into mysql
//returns the mysql primary key to use for picture upload by doing second mysql query, 
//since picture upload happens after the text/gps coordinates of the reports are uploaded.
//is this bad? idk
else if(isset($_REQUEST['report'])){
   $report = $_POST['report'];
   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_title, gps_text, gps_ext, gps_name) ".
       "VALUES ".
       "('$report[0]', '$report[1]','$report[2]','$report[3]','$report[4]', '$report[5]')";
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

   printf("%d",$record['gps_id']) ;

   mysqli_free_result($result);
   mysqli_free_result($result2);
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
