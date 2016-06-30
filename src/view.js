
//grabs references in the html 
var mymap = L.map('mapid').setView([37.279518,-121.867905], 11);
var reports = [];
var markers = [];
var print = document.getElementById("print");
var markerId = document.getElementById("markerId");
var markerLat = document.getElementById("markerLat");
var markerLong = document.getElementById("markerLong");
var markerTitle = document.getElementById("markerTitle");
var markerText = document.getElementById("markerText");
var markerImg = document.getElementById("markerImg");
var markerTimeStamp = document.getElementById("markerTimeStamp");

//map stuff
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'rosglue.0fng9eaj',
    accessToken: 'pk.eyJ1Ijoicm9zZ2x1ZSIsImEiOiJjaXBzbDkzdXcwM3c1ZmttMjhyNzR1bmVxIn0.g45wbGBB5SprrAES2ju06Q'
}).addTo(mymap);

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
                         "title" : coord_json[i].gps_title,  
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
//create markers on the map from the report array
//keeps track of markers created using the mysql id in the markers array
//will not create already created markers
function createMarkers() {
   for(var i = 0; i < reports.length; i ++) {
      if(!hasMarker(reports[i].id)) {
         markers.push(reports[i].id);
         var marker = L.marker([reports[i].lat, reports[i].long],{title:reports[i].id }).addTo(mymap).on('click',markerClick);
         markers.push(reports[i].id);
   //probably going to get a better way to show metadata than a popup 
   //over the marker. 
   //   marker.bindPopup(reports[i].text).openPopup();

      }
   }
   print.innerHTML = "created map markers";

}

//displays marker data on marker click
function markerClick(e) {
   console.log("clicked on marker");
   var id = e.target.options.title;
   var report = findReport(id);
   markerId.innerHTML = id;
   markerLat.innerHTML = report.lat;
   markerLong.innerHTML = report.long;
   markerTitle.innerHTML = report.title;
   markerText.innerHTML = report.text;
   markerName.innerHTML = report.name;
   markerImg.src = "pic/" + id + "." + report.ext;
   markerTimeStamp.innerHTML = report.timestamp
   print.innerHTML = "marker clicked on!";
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
