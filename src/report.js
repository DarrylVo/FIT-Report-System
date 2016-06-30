

//global var for coordinates
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


//shows a thumbnail of the picture 
function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result);
};


//Jquery function call that will listen for picture uploads and then updates thumbnail
$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
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

//callback function for validation
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

//callback to save coordinates
function saveCoords(position) {
   coords[0] = position.coords.latitude;
   coords[1] = position.coords.longitude;
}

