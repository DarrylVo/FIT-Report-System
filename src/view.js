//btw if you are confused about report id vs marker title, they are basically the same thing
//marker only has one field that i can set as an id, which is called the "title" in the marker object. 


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

//map callback stuff. this one centers the map on the marker popup when clicked on.
//this callback function is attached directly to the map, not the marke!
mymap.on('popupopen', function(centerMarker) {
        var cM = mymap.project(centerMarker.popup._latlng);
        cM.y -= centerMarker.popup._container.clientHeight/2
        mymap.setView(centerMarker.popup._latlng,15, {animate: true, 
                                                      pan: {duration : 0.25, easeLinearity : 0.25  }   });
    });



// does ajax call/return to get the all reports from the mysql db
// if the report already exists (by gps_id) it will not push it on the array
function getAllReports() {

        var getreports = "getreports";
	$.ajax({
        type: "POST",
        url: "src/view.php",
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
              if(!hasReport(rep.id)) {
                 reports.push(rep);  
                 console.log(rep);
              }
           }
           print.innerHTML = "got reports from mysql";
       }  
       })

}

//clears out the reports array, marker array, and removes all current markers from the map and then gets only the records indicated by the input data range.
//DOES NOT touch anything in the mysql database. only deletes local data to do the filtering
//TODO: give a better name, like getcertainreports or some shit
function getFilteredReports() {

   for(var i = 0; i < reports.length; i ++) {
      var id = reports[i].id;
      $("#"+id).remove();
      mymap.removeLayer(findMarker(id));

   }
   reports.length = 0;
   markers.length = 0
//   reports = [];
//   markers = [];

var leftDate = $("#filter1").val();
var rightDate = $("#filter2").val();
var range = [ leftDate, rightDate];

	$.ajax({
        type: "POST",
        url: "src/view.php",
        data:{ range : range }, 
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
              if(!hasReport(rep.id)) {
                 reports.push(rep);  
                 console.log(rep);
              }
           }
           print.innerHTML = "got filtered reports from mysql";
       }  
       })
} 

//shows all reports in the global reports[] array by doing a jquery select element
//attaches callback functions to the created elements to zoom and delete
function showReports() {

   for(var i = 0; i < reports.length; i++) {

      var div = $("<div></div>").attr("id",reports[i].id.toString());
      var id = $("<p></p>").text("ID:."+ reports[i].id);
      var name = $("<p></p>").text("Name:."+ reports[i].name);
      var text = $("<p></p>").text("Text:"+ reports[i].text);
      var del = $("<a></a>").text("Delete");
      del.on("click", reports[i].id, function(e) {
                                                                  deleteData(e.data);
                                                                });
      var zoom = $("<a></a>").text("Zoom").on("click", reports[i].id, function(e) {

                                                                      zoomOnMarker(findMarker(e.data));
                                                                      });
      div.append(id);
      div.append(name);
      div.append(text);
      div.append(zoom);
      div.append(del);
      $("#report").append(div);
    
   }



}
//zooms in on the marker and opens the attached popup bubble 
function zoomOnMarker(centerMarker) {
        console.log(centerMarker);
        mymap.setView(centerMarker._latlng,15, {animate: true, 
                                                      pan: {duration : 0.25, easeLinearity : 0.25  }   });
            centerMarker.openPopup();
}

//deletes the report and marker with this id. removes it from the map too, marker and the sidebar.
//also does ajax call to make the server delete it from the mysql database
function deleteData(id) {
   console.log(id);
   $("#"+id).remove();
   mymap.removeLayer(findMarker(id));

   if(removeReport(id))
      console.log("succ");
   if(removeMarker(id)) 
      console.log("succccc");

	$.ajax({
        type: "POST",
        url: "src/view.php",
        data:{ id : id }, 
        success: function(data) {
           console.log(data);
        }
        });
}

  
//create markers on the map from the report array
//keeps track of markers created using the mysql id in the markers array
//will not create already created markers
function createMarkers() {
   for(var i = 0; i < reports.length; i ++) {
      if(!hasMarker(reports[i].id)) {
         var marker = L.marker([reports[i].lat, reports[i].long],{title:reports[i].id }).addTo(mymap);
         markerBind(marker, reports[i]);
         markers.push(marker);
         console.log(marker);
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
   alert("COULDT FIND THE REPORT BRUH\n");
}

//checks whether report exists in report array
function hasReport(id) {
   for(var i = 0; i < reports.length; i ++) {
      if(reports[i].id == id)
         return true;
   }
   return false;
}

//removes marker by ID
function removeReport(id) {
   for(var i = 0; i < reports.length; i ++) {
      if(reports[i].id == id) {
         reports.splice(i,1);
         return true;
      }
   }
   return false;
}

//finds report in reports array by marker "title", which is the same as a report id
function findMarker(id) {
   for(var i = 0; i < markers.length; i ++) {
      if(markers[i].options.title == id)
         return markers[i];

   }
   alert("COULDT FIND THE MARKER BRUH\n");
}
//checks whether marker exists in marker array
//aka check if marker is already on map
function hasMarker(id) {
   for(var i = 0; i < markers.length; i ++) {
      if(markers[i].options.title == id)
         return true;
   }
   return false;
}

//removes marker by id
function removeMarker(id) {
   for(var i = 0; i < markers.length; i ++) {
      if(markers[i].options.title == id) {
         markers.splice(i,1);
         return true;

      }
   }
   return false;

}
