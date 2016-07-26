<?php
//creates mysqli connection object...   
/*
$mysqli = new mysqli("localhost", "root", "Applez255", "GPSCOORDS");

//if error kill urself
if($mysqli->connect_errno) {
   printf("Connect failed: %s\n", $mysqli->connect_error);
   exit;
}
   
   $user = "user";
   $password = "user";
   $hash = password_hash($password, PASSWORD_DEFAULT); 	

   $sql_q = "INSERT INTO GPSCOORDS_TB3 ".
       "(gps_user, gps_hash) ".
       "VALUES ".
       "('$user', '$hash')";
   $result = mysqli_query($mysqli,$sql_q);
   mysqli_free_result($result);
   */

   if( isset($_REQUEST['info'])) {
      $info = $_POST['info'];
      if($info[0] == "admin" && password_verify($info[1], "\$2y$10\$rDSqMcybyFuWHTuJVuWsj.mSLaubnhYrbcOZ17ujur6QdV8FiWooC")) {
         session_start();
         $_SESSION['user'] = 'admin';
         echo "admin";
      }
      else if($info[0] == "user" && password_verify($info[1], "\$2y\$10\$RH40VlE4siIA2fK1eyhkh.aYAi8pT8CEdaK6O0752h4YHr0Mn50Wa")) {
            
         session_start();
         $_SESSION['user'] = 'user';
         echo "user";
      }
   } 
