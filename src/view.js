
//grabs references in the html 
var mymap = L.map('mapid').setView([37.279518,-121.867905], 11);
var reports = [];
var markers = [];
var print = document.getElementById("print");
//map creation stuff
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'rosglue.0fng9eaj',
    accessToken: 'pk.eyJ1Ijoicm9zZ2x1ZSIsImEiOiJjaXBzbDkzdXcwM3c1ZmttMjhyNzR1bmVxIn0.g45wbGBB5SprrAES2ju06Q'
}).addTo(mymap);

//map callback stuff
mymap.on('popupopen', function(centerMarker) {
        var cM = mymap.project(centerMarker.popup._latlng);
        cM.y -= centerMarker.popup._container.clientHeight/2
        mymap.setView(centerMarker.popup._latlng,15, {animate: true, 
                                                      pan: {duration : 0.25, easeLinearity : 0.25  }   });
    });



// does ajax call/return to get the reports from the mysql db
// if the report already exists (by gps_id) it will not push it on the array
function getReports() {

        var getreports = "getreports";
	$.ajax({
        type: "POST",
        url: "src/report.php",
        data:{ getreports : getreports }, 
        success: function(data) {
          
           var coord_json = jQuery.parseJSON(data);
           for(var i = 0; i < coord_json.length; i ++) {
              var rep = {"id" : parseInt(coord_json[i].gps_id),
                         "lat" : parseFloat(coord_json[i].gps_lat), 
                         "long" : parseFloat(coord_json[i].gps_long),
                         "text" : coord_json[i].gps_text,  
                         "ext" : coord_json[i].gps_ext,
                         "name" : coord_json[i].gps_name,
                         "timestamp" : coord_json[i].gps_timestamp}; 
              if(!hasReport(rep.id))
                 reports.push(rep);  
           }
           print.innerHTML = "got reports from mysql";
       }  
       })

} 

//shows reports created from getReports() by doing a jquery insert element
function showReports() {

   for(var i = 0; i < reports.length; i++) {
      var name = $("<p></p>").text("Name:."+ reports[i].name);
      var text = $("<p></p>").text("Text:."+ reports[i].text);
      $(report).append(name);
      $(report).append(text);
    
   }


}

function removeReport() {
   $(report).children().eq(0).remove();
}

  
//create markers on the map from the report array
//keeps track of markers created using the mysql id in the markers array
//will not create already created markers
function createMarkers() {
   for(var i = 0; i < reports.length; i ++) {
      if(!hasMarker(reports[i].id)) {
         markers.push(reports[i].id);
         var marker = L.marker([reports[i].lat, reports[i].long],{title:reports[i].id }).addTo(mymap);
         markerBind(marker, reports[i]);
         markers.push(reports[i].id);
      }
   }

   print.innerHTML = "created map markers";

}

//binds popup containing report data to marker!
function markerBind(marker, report) {
   var src = '"pic/' + report.id + "." + report.ext + '"';
   marker.bindPopup("Latitude: " +report.lat +"<br>" 
                    + "Longitude: " + report.long +"<br>"
                    + "Timestamp: " + report.timestamp +"<br>"
                    + "Name: " + report.name + "<br>"
                    + "Text: " + report.text +"<br>"
                    +  '<a href = "pic/' + report.id + "." + report.ext + '" data-lightbox = "image1" >' +   ' <img width = "50" height = "50" src=' + src +  '></img><br>'    +   '</a>'
                     
                    );

}


//finds report in reports array by id
function findReport(id) {
   for(var i = 0; i < reports.length; i ++) {
      if(reports[i].id == id)
         return reports[i];

   }
   printf("COULDT FIND THE REPORT BRUH\n");
}

//checks whether report exists in report array
function hasReport(id) {
   for(var i = 0; i < reports.length; i ++) {
      if(reports[i].id == id)
         return true;
   }
   return false;
}

//checks whether marker exists in marker array
//aka check if marker is already on map
function hasMarker(id) {
   for(var i = 0; i < markers.length; i ++) {
      if(markers[i] == id)
         return true;
   }
   return false;
}
