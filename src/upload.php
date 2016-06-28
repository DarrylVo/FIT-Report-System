<?php
//get the file/file metadata
$fileName = $_FILES['file']['name'];
$fileType = $_FILES['file']['type'];
$fileError = $_FILES['file']['error'];
$fileContent = file_get_contents($_FILES['file']['tmp_name']);

//if no error, upload to the server
//if file exists, will not overwrite
//it shouldnt exist because the filename uses the primary mysql key value,
// but the /pic folder might be leftover from using test random reports
if($fileError == UPLOAD_ERR_OK){
   printf("FILE upload OKAY\n");
   $file = fopen("../pic/".$fileName, "x");
   if(!$file)
      printf("COULDNT OPEN LOCAL FILED D:\n");
   else
      printf(" wrote file! Filename:%s\n",$fileName);
   fwrite($file,$fileContent);
   fclose($file);
}
else {
   printf("ERROR IN FILE UPLOAD\n");
}   






?>

