
//references to html tags
var table = document.getElementById("table");
var print = document.getElementById("print");
var text = document.getElementById("text");
var title = document.getElementById("title");
var fag = document.getElementById("fag");

//global var for picture
var file;

//saves a report- report consists of current gps locaiton, title, 
// name, text, and picture. ALL is required
// sends gps coords/text in first POST, which returns the mysql primary key
// that mysql primary key is then used for the picture name when its uploaded
//is that bad? no idea
//TODO: have the ability for pictures to not be required? unkown behavior if picture not used
//TODO: TEXT/PICTURE VALIDATION
function saveReport() {
   if (navigator.geolocation) 
      navigator.geolocation.getCurrentPosition(savePosition);
   else  
      print.innerHTML = "Geolocation is not supported by this browser.";
}

//gets called by saveReport() to send position and text data to server using ajax calls
//on success will recieve primary key from mysql database, which is used as the picture's name, which is then
//uploaded
function savePosition(position) {

   var report = [position.coords.latitude, position.coords.longitude, title.value, text.value, file.name.split(".")[1], fag.value];
   $.ajax({
      type: "POST",
      url: "src/new_gps.php",
      data:{ report : report }, 
      success: function(data) {
          upload(file, data);
      }  
   })
}

//sends a randomly located report to the server using ajax calls
//TODO: add picture random report too
function randomReport() {
   var la = Math.random() * (185 - 0) + 0;
   var lo = Math.random() * (185 - 0) + 0; 
   var report = [la, lo, "rando", "lel","kek","lmao"];
   $.ajax({
      type: "POST",
      url: "src/new_gps.php",
      data:{ report : report }, 
      success: function(data) {
         print.innerHTML = "Random report saved!";
      }  
   })
}

//Jquery function call that will listen for picture uploads.
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
      url : 'src/upload.php',
      type : 'POST',
      data : formData,
      processData: false,  // tell jQuery not to process the data
      contentType: false,  // tell jQuery not to set contentType
      success : function(data) {
         print.innerHTML("report saved");
      }
   });

}

