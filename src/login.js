$("#submit").button().on('click', submit );

function submit() {
   var info = [$('#username').val(), $('#password').val()];
   
   $.ajax({
      type: "POST",
      url: "src/login.php",
      data:{ info : info }, 
      success: function(data) {
         if(data == "user" || data == "admin") {
            document.cookie = "username="+data;
            window.location.href = "https://scvwdflood.org/view.html"; 
            //login succesful
         }
         else {
            //not succesful D:
            alert(data);
         }
      }  
   })
}
