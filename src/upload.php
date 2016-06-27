<?php


//print_r($_FILES);

$fileName = $_FILES['file']['name'];
$fileType = $_FILES['file']['type'];
$fileError = $_FILES['file']['error'];
$fileContent = file_get_contents($_FILES['file']['tmp_name']);

if($fileError == UPLOAD_ERR_OK){
   printf("FILE upload OKAY\n");
   $file = fopen("../pic/".$fileName, "x");
   if(!$file)
      printf("COULDNT OPEN LOCAL FILED D:\n");
   else
      printf("Filename:%s\n",$fileName);
   fwrite($file,$fileContent);
   fclose($file);
}
else {
   printf("ERROR ERROR ERRORn\n");
}   






?>

