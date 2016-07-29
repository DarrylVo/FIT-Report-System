<?php
   session_start();
   if(isset ($_REQUEST['auto'])) {
      if( isset( $_SESSION['user'])) {
         echo "autologin";
      }
   }
   else if( isset($_REQUEST['info'])) {
      $info = $_POST['info'];
      if($info[0] == "admin" && password_verify($info[1], "\$2y$10\$rDSqMcybyFuWHTuJVuWsj.mSLaubnhYrbcOZ17ujur6QdV8FiWooC")) {
         //session_start();
         $_SESSION['user'] = 'admin';
         echo "admin";
      }
      else if($info[0] == "user" && password_verify($info[1], "\$2y\$10\$RH40VlE4siIA2fK1eyhkh.aYAi8pT8CEdaK6O0752h4YHr0Mn50Wa")) {
            
         //session_start();
         $_SESSION['user'] = 'user';
         echo "user";
      }
      else
         echo "failure";
   }
?> 
