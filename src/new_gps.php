<?php
   
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}


if(isset($_REQUEST['coords'])){
   $coords = $_POST['coords'];
   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_text) ".
       "VALUES ".
       "('$coords[0]', '$coords[1]','write report text here')";

   $result = mysqli_query($mysqli,$sql_q);
   if(!$result) {
      printf("insert error\n");
      exit;
   }
   else {
      printf("insert current gps loc succ\n");
   }
   mysqli_free_result($result);
}
else if(isset($_REQUEST['report'])){
   $report = $_POST['report'];
   $sql_q = "INSERT INTO GPSCOORDS_TB1 ".
       "(gps_lat, gps_long, gps_title, gps_text) ".
       "VALUES ".
       "('$report[0]', '$report[1]','$report[2]','$report[3]')";
   $result = mysqli_query($mysqli,$sql_q);
   if(!$result) {
      printf("report error\n");
      exit;
   }
   $sql_q2 = "SELECT * FROM GPSCOORDS_TB1
     ORDER BY gps_id DESC
      LIMIT 0,1";
   $result2 = mysqli_query($mysqli,$sql_q2);
   
   $record = mysqli_fetch_array($result2, MYSQL_ASSOC);

   printf("%d",$record['gps_id']) ;

   mysqli_free_result($result);
   mysqli_free_result($result2);
}

else if(isset($_REQUEST['clear'])){
  
   $sql_q = "DELETE FROM GPSCOORDS_TB1";
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

else if(isset($_REQUEST['show'])){
   printf("SHOW ME DA MONEY\n");
   $sql_q = 'SELECT gps_id, gps_lat, gps_long, gps_title, gps_text
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
         "--------------------------------<br>";
   }
   mysqli_free_result($result);
}
 
else if(isset($_REQUEST['getreports'])){

   $arr = array();
   $sql_q = 'SELECT gps_id, gps_lat, gps_long, gps_title, gps_text
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
