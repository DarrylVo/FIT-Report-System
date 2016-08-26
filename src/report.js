//global var for coordinates
var coords = new Array(2);
var globalForm;

//updates the name select box from the db
$( document ).ready(function() {
    updateNames($("#cname"));
});


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
function updateNames(selectbox) {
   var getnames = "getnames";
   $.ajax({
      type: "POST",
      url: "src/report.php",
      data:{ getnames : getnames }, 
      success: function(data) {
         var names_json = jQuery.parseJSON(data);
         for(var i = 0; i < names_json.length; i++) {
            $(selectbox).append($("<option></option>").attr("value", names_json[i]).text(names_json[i]));
         }
         var cookie = getCookie("name");
         if(cookie!=null) {
            $(selectbox).val(cookie);
         }
      }   
   });
}

//jquery call to do form validation for the register name form
$("#registerForm").validate({
     errorElement : "div",
     errorContainer : ".errorText",
     submitHandler : registerName,
     rules : {
          namereg : {
             required : true,
             minlength : 1
          }},
     messages: {
          namereg : "Enter a name"
          }
     });

//callback function for validation for the register name form
function registerName(form) {
   $(form).ajaxSubmit({
      url : 'src/report.php',
      type : 'POST',
      success : function(data) {
         if ( typeof ___test !== 'undefined') {
            console.log(data);
            ___test =  data;
         }     
         else if(JSON.parse(data) == "error name already exists")
            alert("Name Already exists! Pick something else.");
         else
            window.location = "http://scvwdflood.org/report.html";
        }
     });   
  
}



//another jquery call to do form validaiton for the main report form
//callback function to get gps coords, then send all report data to server/php
//TODO: i cant get it to only accept all video and all image mimetypes, ill just leave file validation severside
$("#commentForm").validate({
   errorElement : "p",
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
   document.cookie = "name=" + cname;
   globalForm = form;
   if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(saveCoords, function() { alert("ERROR: PLEASE ENABLE GEOLOCATION IN YOUR BROWSER SETTINGS TO SUBMIT REPORT, or you're using google chrome + not a https connection!");});
   } 
   else { 
      alert("geolocation not supported, will not save report gps coordinates");
   }
}

//callback to geolocation api save coordinates
//also submits it because the gps coordinates call is asychronous, so it must be done here.
//otherwise you'll run into problems where the gps call isn't done yet, but then the form submit happens
//so you send null cordinate data... man that took me a long time to figure out.
function saveCoords(position) {
   coords[0] = position.coords.latitude;
   coords[1] = position.coords.longitude;
   console.log(globalForm);
   $(globalForm).ajaxSubmit({
        url : 'src/report.php',
        type : 'POST',
        data : {coords : coords},
 //       processData: false,  // tell jQuery not to process the data
 //       contentType: false,  // tell jQuery not to set contentType
        success : function(data) {
           if ( typeof ___test === 'undefined') {
              alert(data);
              location.reload(true);
           }
           else {
              ___test = data;
           }
        },
        error : function(a, b, c) {
           alert(b + " BASICALLY, THERE WAS AN ERROR IN SUBMITING THIS REPORT. TRY AGAIN");
        }
     });   
}

//get cookie by name
function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    return unescape(dc.substring(begin + prefix.length, end));
} 



//loading animation stuff
$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading");    },
    ajaxStop: function() { $body.removeClass("loading"); }    
});
