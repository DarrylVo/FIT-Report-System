

//global var for coordinates
var coords = new Array(2);
var globalForm;



//sends a randomly located report to the server using ajax calls
//TODO: make this thing generate a full on report, possibly with cat pics
function randomReport() {
   var la = Math.random() * (120 - 0) + 0;
   var lo = Math.random() * (120 - 0) + 0; 
   var rand = [la, lo, "rando", "lel","kek","lmao"];
   $.ajax({
      type: "POST",
      url: "src/report.php",
      data:{ rand : rand }, 
      success: function(data) {
         print.innerHTML = "Random report saved!";
      }  
   })
}

//updates the select drop down box with names from the mysql table 2
//does this by doing ajax call/return from php
function updateNames() {

        var getnames = "getnames";
	$.ajax({
           type: "POST",
           url: "src/report.php",
           data:{ getnames : getnames }, 
           success: function(data) {
              var names_json = jQuery.parseJSON(data);
              for(var i = 0; i < names_json.length; i++) {
                 $("#cname").append($("<option></option>").attr("value", names_json[i].gps_name).text(names_json[i].gps_name));

              }
           }   
       })

}



/*
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
*/


//jquery call to do form validation for the register name form
$("#registerForm").validate({
     submitHandler : registerName});

//callback function for validation for the register name form

function registerName(form) {

   $(form).ajaxSubmit({
        url : 'src/report.php',
        type : 'POST',
        success : function(data) {
           console.log(data);
           window.location = "http://scvwdflood.org/report.html";
        }
     });   


}



//another jquery call to do form validaiton for the main report form
//callback function to get gps coords, then send all report data to server/php
//TODO: i cant get it to only accept all video and all image mimetypes, ill just leave file validation severside
$("#commentForm").validate({
  rules: {
   pic: {
      required: true
    //not working  accept: "video/*, video/mp4, image/*",
    }
  },
  submitHandler : sendForm
    
});

//callback function for validation
//this function then uses the geolcation api to send gps coords along with the form to the server
function sendForm(form) {
var cname = $("#cname option:selected").text();
     globalForm = form;
     if (navigator.geolocation) 
        navigator.geolocation.getCurrentPosition(saveCoords);
     else { 
        alert("no gps support. update yo browser");

      }


}

//callback to geolocation api save coordinates
//also submits it because the gps coordinates call is asychronous, so it must be done here.
//otherwise you'll run into problems where the gps call isn't done yet, but then the form submit happens
//so you send null cordinate data... man that took me a long time to figure out.
function saveCoords(position) {
   coords[0] = position.coords.latitude;
   coords[1] = position.coords.longitude;
   $(globalForm).ajaxSubmit({
        url : 'src/report.php',
        type : 'POST',
        data : {coords : coords},
        processData: false,  // tell jQuery not to process the data
        contentType: false,  // tell jQuery not to set contentType
        success : function(data) {
           console.log(data);
           alert(data);
  //         location.reload(true);
        }
     });   
}

//loading animation stuff
$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading");    },
     ajaxStop: function() { $body.removeClass("loading"); }    
});
