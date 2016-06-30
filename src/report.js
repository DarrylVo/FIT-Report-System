

//global var for picture
var file;

var coords = new Array(2);


//sends a randomly located report to the server using ajax calls
//TODO: add picture random report too
function randomReport() {
   var la = Math.random() * (185 - 0) + 0;
   var lo = Math.random() * (185 - 0) + 0; 
   var report = [la, lo, "rando", "lel","kek","lmao"];
   $.ajax({
      type: "POST",
      url: "src/report.php",
      data:{ report : report }, 
      success: function(data) {
         print.innerHTML = "Random report saved!";
      }  
   })
}


//shows a thumbnail of the picture before sending it to the server
function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result);
};

//uploads picture to the server
//TODO: Picture validation!
function upload(file, filename) {

   var formData = new FormData();
   formData.append('file', file, filename + "." + file.name.split(".")[1] );
   $.ajax({
      url : 'src/report_upload.php',
      type : 'POST',
      data : formData,
      processData: false,  // tell jQuery not to process the data
      contentType: false,  // tell jQuery not to set contentType
      success : function(data) {
         print.innerHTML = "report saved";
      }
   });

}

//Jquery function call that will listen for picture uploads
//upates the global "file" to the uploaded file. also updates thumbnail
//DOES NOT actually send the picture to the server. upload() does that.
//TODO: picture validation. make sure only sends pictures!
$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
            file = this.files[0];
        }
    });
});

//another jquery call to do form validaiton
//in progress callback function to get gps coords, then send all report data to server/php
$("#commentForm").validate({
  rules: {
   pic: {
      required: true,
      accept: "image/*"
    }
  },
  submitHandler : sendForm
    
});


function sendForm(form) {

     if (navigator.geolocation) 
        navigator.geolocation.getCurrentPosition(saveCoords);
     else { 
        alert("no gps support. update yo browser");

      } 
    alert(coords[0]); 
   $(form).ajaxSubmit({
        url : 'src/report.php',
        type : 'POST',
        data : {coords : coords},
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        success : function(data) {
           alert(data);
          location.reload(true);
        }
     });   


}


function saveCoords(position) {
   coords[0] = position.coords.latitude;
   coords[1] = position.coords.longitude;
}

