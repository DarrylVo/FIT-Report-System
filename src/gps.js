
//references to html tags
var x = document.getElementById("demo");
var table = document.getElementById("table");
var print = document.getElementById("print");
var text = document.getElementById("text");
var title = document.getElementById("title");
var fag = document.getElementById("fag");
var file;

//saves a report- report consists of current gps locaiton, title, 
// name, text, and picture. ALL is required
//to do: have the ability for pictures to not be required? unkown behavior if picture
//not used
function saveReport() {
   if (navigator.geolocation) 
      navigator.geolocation.getCurrentPosition(savePosition);
   else  
      x.innerHTML = "Geolocation is not supported by this browser.";
}

//gets called by save report to save posistion and do ajax calls to php
function savePosition(position) {
   x.innerHTML = "Latitude: " + position.coords.latitude + 
     "<br>Longitude: " + position.coords.longitude;
   alert(fag.value);

   var report = [position.coords.latitude, position.coords.longitude, title.value, text.value, file.name.split(".")[1], fag.value];
   $.ajax({
      type: "POST",
      url: "src/new_gps.php",
      data:{ report : report }, 
      success: function(data) {
          upload(file, data);
      }  
   })
   showTable();	
}

//saves a "random" report by doing ajax calls
function randomReport() {
   var la = Math.random() * (185 - 0) + 0;
   var lo = Math.random() * (185 - 0) + 0; 
   var report = [la, lo, "rando", "lel"];
   $.ajax({
      type: "POST",
      url: "src/new_gps.php",
      data:{ report : report }, 
      success: function(data) {
         print.innerHTML = data;
      }  
   })
}

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

function imageIsLoaded(e) {
    $('#myImg').attr('src', e.target.result);
};

function upload(file, filename) {

   var formData = new FormData();
   formData.append('file', file, filename + "." + file.name.split(".")[1] );
   $.ajax({
      url : 'src/upload.php',
      type : 'POST',
      data : formData,
      processData: false,  // tell jQuery not to process the data
      contentType: false,  // tell jQuery not to set contentType
      success : function(data) {
      }
   });

}

