<?php

//how this works php script works- on ajax posts from either view.js it will do mysql queries

//creates mysqli connection object...   

$file = file_get_contents("../../mysqlpass");
$file = preg_replace('/\s+/', '', $file);
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");
//starts the session for login stuff
session_start();

//if error kill urself
if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}

//check login status
else if (isset($_REQUEST['status'])) {
   if(isset ($_SESSION['user'])) {
      echo $_SESSION['user']; 
   }
}

//logout- reset session data & cookies
else if (isset($_REQUEST['logout']) && isset($_SESSION['user']) ) {
   $_SESSION = array();
   if (ini_get("session.use_cookies")) {
      $params = session_get_cookie_params();
      setcookie(session_name(), '', time() - 42000,
      $params["path"], $params["domain"],
      $params["secure"], $params["httponly"]
      );
   }
   session_destroy();
   echo "wooo";
}


//on this POST, gets all the reports out of the mysql db
else if(isset($_REQUEST['getreports'])&& isset($_SESSION['user'])){

   $arr = array();
   $sql_q = 'SELECT * FROM GPSCOORDS_TB1 ORDER BY gps_timestamp';
   $stmt = $mysqli->prepare($sql_q);

   if(!$stmt->execute() ) {
      printf("getreports error\n");
      echo $stmt->error;
      exit;
   }
   $result = $stmt->get_result();
   while($row = $result->fetch_array(MYSQL_ASSOC))  
      $arr[] = $row;

   echo json_encode($arr);
   $stmt->free_result();
   $stmt->close();
   $result->free;
   unset($arr);
}

//on this post, gets all the names out of the mysql db table 2!

else if(isset($_REQUEST['getnames'])&& isset($_SESSION['user'])){

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

//on this post, removes a mysql record with this id
//also removes the picture!
//god damnit do i really have to query out the extension.... Dx
//i should really call this delete_id so its more clear...
else if(isset($_REQUEST['id'])&& $_SESSION['user'] == 'admin' ){

   $id = filter_input(INPUT_POST,'id', FILTER_SANITIZE_STRING); 

   $sql_q = 'SELECT gps_ext
        FROM GPSCOORDS_TB1 WHERE gps_id = ?';
   $stmt = $mysqli->prepare($sql_q);
   $stmt->bind_param('i', $id);
   $stmt->bind_result($ext);
   if(! $stmt->execute() ) {
      printf("getext  error\n");
      echo $stmt->error;
      echo $id;
      exit;
   }
   $stmt->fetch();
   printf("ext:%s\n",$ext);
   $name ="../pic/" . $id . "." . $ext;
   if(!unlink($name))
      echo "failed to delete pic";
   $stmt->free_result();
   $stmt->close();

   $sql_q2 = 'DELETE FROM GPSCOORDS_TB1 WHERE gps_id = ?';
   $stmt2 = $mysqli->prepare($sql_q2);
   $stmt2->bind_param('i',$id);
   if(! $stmt2->execute()) {
      printf("single record delete error\n");
      exit;
   }
   else 
      echo "succ one record delete";

   $stmt2->free_result();
   $stmt2->close();
}

//On this POST, only get the records specified by the date range
else if(isset($_REQUEST['range'])&& isset($_SESSION['user'])){

   $range = $_POST['range'];
   
   $arr = array();
   $sql_q = 'SELECT * 
        FROM GPSCOORDS_TB1 WHERE gps_timestamp BETWEEN ? AND ? ORDER BY gps_timestamp';
   $stmt = $mysqli->prepare($sql_q);
   $stmt->bind_param('ss',$range[0], $range[1]);
   if(! $stmt->execute() ) {
      printf("get filtered reports  error\n");
      exit;
   }
   $result = $stmt->get_result();
   while($row = $result->fetch_array(MYSQL_ASSOC))  
      $arr[] = $row;

   echo json_encode($arr);
   $result->free();
   $stmt->free_result();
   $stmt->close();
   unset($arr);
}

//On this POST, update the record.... 
else if(isset($_REQUEST['report'])&& $_SESSION['user'] == 'admin') {

   $report = $_POST['report'];
   $name = $report['name'];
   $text = $report['text'];
   $timestamp = $report['timestamp'];
   $sql_q =  "UPDATE GPSCOORDS_TB1 SET gps_lat = ?, gps_long = ?, gps_text =?, gps_name =?, gps_timestamp = ?, default_gps = ?, default_timestamp = ? WHERE gps_id=?";
   $stmt = $mysqli->prepare($sql_q);
   $stmt->bind_param('ddsssiii',$report['lat'], $report['long'], $text, $name, $timestamp, $report['default_gps'], $report['default_timestamp'], $report['id'] );
   if(! $stmt->execute() ) {
      printf("edit report error  error\n");
      exit;
   }
   var_dump($report);
   echo 'succ';
   $stmt->free_result();
   $stmt->close();
}


mysqli_close($mysqli);
?>
