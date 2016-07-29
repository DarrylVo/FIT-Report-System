$("#submit").on('click', submit );

var auto = "auto";
$.ajax({
   type : "POST",
   data : {auto : auto},
   url : "src/login.php",
   success : function (data) {
      if($.trim(data) == "autologin") {
         window.location.href = "https://scvwdflood.org/view.html";
      }
   }});


function submit() {
   var info = [$('#username').val(), $('#password').val()];
   
   $.ajax({
      type: "POST",
      url: "src/login.php",
      data:{ info : info }, 
      success: function(data) {
         if($.trim(data) == "user" || $.trim(data) == "admin") {
//            document.cookie = "username="+data;
            window.location.href = "https://scvwdflood.org/view.html"; 
            //login succesful
         }
         else {
            //not succesful D:
            $("<div>").text("Wrong Login Credentials").dialog({title: "Error"});
         } 
      }  
   })
}
