//btw if you are confused about report id vs marker title, they are basically the same thing
//marker only has one field that i can set as an id, which is called the "title" in the marker object. 


//grabs references in the html 
var mymap = L.map('mapid').setView([37.279518,-121.867905], 11);
var reports = [];
var markers = [];
var print = document.getElementById("print");
var refreshId = -1;
var cluster = L.markerClusterGroup({iconCreateFunction : function (cluster) {
              var children = cluster.getAllChildMarkers();
               for(var i = 0; i < children.length; i ++) {
                   if(children[i].options.icon.options.iconUrl == "images/blu-circle.png")
		      return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster' + ' marker-cluster-large', iconSize: new L.Point(40, 40) });
                      
                }
		      return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', className: 'marker-cluster' + ' marker-cluster-small', iconSize: new L.Point(40, 40) });
	}}  );

/*
cluster.on('clusterclick', function(a) {
   console.log(a);
            var targetPoint = mymap.project(a.latlng, 15).subtract([0, 175]);
            var newPoint = mymap.unproject(targetPoint, 15);
            //mymap.setView(newPoint, 15);
});*/
//cluster.on('animationend',function(a){a.target._featureGroup._layers[52].spiderfy();});
//map creation stuff
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'rosglue.0fng9eaj',
    accessToken: 'pk.eyJ1Ijoicm9zZ2x1ZSIsImEiOiJjaXBzbDkzdXcwM3c1ZmttMjhyNzR1bmVxIn0.g45wbGBB5SprrAES2ju06Q'
}).addTo(mymap);
	mymap.addLayer(cluster);

//custom icon
var LeafIcon = L.Icon.extend({
    options: {
     //   shadowUrl: 'images/leaf-shadow.png',
        iconSize:     [38, 38],
      //  shadowSize:   [50, 64],
        iconAnchor:   [22, 40],
        shadowAnchor: [4, 38],
        popupAnchor:  [-3, -38]
    }
});

var redIcon = new LeafIcon({iconUrl: 'images/red-circle.png'});
var blueIcon = new LeafIcon({iconUrl: 'images/blu-circle.png'});

//map callback stuff. this one centers the map on the marker popup when clicked on.
//this callback function is attached directly to the map, not the marke!
//should it be attached to the marker or the map???
/*
mymap.on('popupopen', function(centerMarker) {
       for(var i = 0; i < markers.length; i ++ ) {
           markers[i].setIcon(greenIcon);
        }
        centerMarker.popup.setIcon(orangeIcon);
console.log(centerMarker.popup);
   var targetPoint = mymap.project(centerMarker.popup._latlng, 15).subtract([0, 150]);
 var newPoint = mymap.unproject(targetPoint, 15);
       mymap.setView(newPoint, 15);
       // mymap.panTo(newPoint);
     //   mymap.setZoomAround(newPoint, 15);
    });
*/
//jquery calls for ui init
$("#filter1").datepicker();
$("#filter1").datepicker("option", "dateFormat", "yy-mm-dd").attr("disabled",true);
$("#filter2").datepicker();
$("#filter2").datepicker("option", "dateFormat", "yy-mm-dd").attr("disabled",true);
$("#all").checkboxradio();
$("#filter").checkboxradio();
$("#realtime").checkboxradio();
$("#realtime").checkboxradio("option","disabled",true);
$("#updateFilter").button();
$("#updateFilter").button("option","disabled",true);
   $("#report").accordion({collapsible:true,
         activate: function( event, ui ) {
           if(!$.isEmptyObject(ui.newHeader.offset())) {
                                $('#report').animate({ scrollTop: ui.newHeader.offset().top }, 'slow');
                        }
                          }});

//set onlick event handler for the ui stuff

//on "Show All" click, activate polling and disable filter boxes
$("#all").on("click",function() {
   clearLocalData();
   if(refreshId != -1) {
      window.clearInterval(refreshId);
      refreshId = window.setInterval(getAllReports, 2000);
   }
   else
      refreshId = window.setInterval(getAllReports, 2000);
   $("#filter1").attr("disabled",true); 
   $("#filter2").attr("disabled",true); 
   $("#realtime").checkboxradio("option","disabled",true); 
   $("#updateFilter").button("option","disabled",true);
});


//on "Filter by Date" click, deactivate polling and reactivate filter boxes
$("#filter").on("click", function() {
   window.clearInterval(refreshId);
   refreshId = -1;
   $("#filter1").attr("disabled",false); 
   $("#filter2").attr("disabled",false); 
   $("#realtime").checkboxradio("option","disabled",false); 
   $("#updateFilter").button("option","disabled",false);
});


//on the "Realtime" click, disable the second filter field
$("#realtime").on("click", function() {
   if($("#filter2").attr("disabled"))
      $("#filter2").attr("disabled",false); 
   else
      $("#filter2").attr("disabled",true); 
});

//on the "update Filter" click, check to see if the fields are filled out correctly,
//and then call the getFilteredReport funtion.

$("#updateFilter").on("click", function() {
   if($("#filter1").datepicker("getDate")!=null) {
      if($("#realtime").prop("checked") == true) {
         if(refreshId != -1) {
            window.clearInterval(refreshId);
            clearLocalData();
           refreshId =  window.setInterval(getFilteredReports, 2000, '"'+$("#filter1").val()+ '"', "(CURRENT_DATE + INTERVAL 1 DAY - INTERVAL 1 SECOND)");

         }
         else {
            clearLocalData();
           refreshId =  window.setInterval(getFilteredReports, 2000, '"'+$("#filter1").val()+ '"', "(CURRENT_DATE + INTERVAL 1 DAY - INTERVAL 1 SECOND)");

         } 
         
     }
     else if($("filter2").datepicker("getDate")!=null) { 
         if(refreshId != -1) {
            window.clearInterval(refreshId);
            refreshId = -1;
         }
        clearLocalData();
        getFilteredReports('"'+$("#filter1").val()+'"', '"'+$("#filter2").val() + ' 23:59:59"');
     }  
 }

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
           //the call is here because ajax is asynchronous. this guarantees these functions are ONLy run after the ajax call ends
           showReports();
           createMarkers();
           print.innerHTML = "got reports from mysql";
       }  
       })

}

//helper function to clear out local report data
function clearLocalData() {
      console.log("clearing all local data");
      
      for(var i = 0; i < reports.length; i ++) {
         var id = reports[i].id;
      //   $("#"+id).remove();
         cluster.removeLayer(findMarker(id));

      }
      $("#report").empty();
      $("#report").accordion("refresh");
      reports.length = 0;
      markers.length = 0

}

//gets a subset of the reports indictated by left and right date
//TODO: give a better name, like getcertainreports or some shit
function getFilteredReports(leftDate, rightDate) {

  
   

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
           //if ur wondering why this is here, look at the comments for getAllReports()
           showReports();
           createMarkers();
           print.innerHTML = "got filtered reports from mysql";
       }  
       })
} 

//shows all reports in the global reports[] array by doing a jquery select element
//attaches callback functions to the created elements to zoom and delete
//TODO: the way the accordion sidebar is created is technically wrong- im basiclaly creating a new accordion for each section,
// when it should be one accordion with many sections. however this way each accordion is unique, so i can handle the accordion popup
// on marker click. There probably is a better way to do that(like setting a marker field when i create an accordion section for the 
// marker), but im lazy 
function showReports() {

   for(var i = 0; i < reports.length; i++) {
      if(hasMarker(reports[i].id))
         continue;
      var div = $("<div>").attr("id", reports[i].id.toString()).val(i);
      var section = $("<h3>").text("ID: "+ reports[i].id + " Timestamp:"+reports[i].timestamp).attr("id", 'a'+reports[i].id.toString())
      var id = $("<p></p>").text("ID: "+ reports[i].id + " Timestamp:"+reports[i].timestamp);
      var timestamp = $("<p></p>").text("Timestamp: " + reports[i].timestamp);
      var name = $("<p></p>").text("Name: "+ reports[i].name);
      var text = $("<p></p>").text("Text: "+ reports[i].text);
      var del = $("<button></button>").button({label:"Delete"});
      del.on("click", reports[i].id, function(e) {
        // deleteData(e.data);
        $("#dialog-confirm").dialog({
          modal : true,
          buttons : {
                      "Delete this Report" : function() {deleteData(e.data);
                                                  $(this).dialog("close");},
                      "Cancel" : function () { $(this).dialog("close");}}
          });
       });
      var zoom = $("<button></button>").button({label:"Zoom"});
      zoom.on("click", reports[i].id, function(e) { zoomOnMarker(findMarker(e.data));
                                                                     }); 
      div.append(name,timestamp,text,zoom,del);
      $("#report").append(section, div);
   }
   $("#report").accordion("refresh");

}
//zooms in on the marker and opens the attached popup bubble 
function zoomOnMarker(centerMarker) {
       for(var i = 0; i < markers.length; i ++ ) {
           markers[i].setIcon(redIcon);
        }
        centerMarker.setIcon(blueIcon);
        centerMarker.update();
        mymap.setView(centerMarker._latlng,13,{animate: true, 
                                                      pan: {duration : 0.25, easeLinearity : 0.25  }   });
        cluster.refreshClusters();
       // mymap.setZoom(15);
     //   mymap.panTo(centerMarker._latlng);
         //   centerMarker.openPopup();
}

//deletes the report and marker with this id. removes it from the map too, marker and the sidebar.
//also does ajax call to make the server delete it from the mysql database
function deleteData(id) {
   console.log(id);
   $("#"+id).remove();
   $("#a"+id).remove();
   $("#report").accordion("refresh");
   $("#report").accordion("option","active",false);
   cluster.removeLayer(findMarker(id));

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
   var flag = 0;
   for(var i = 0; i < reports.length; i ++) {
      if(!hasMarker(reports[i].id)) {
         var marker = L.marker([reports[i].lat, reports[i].long],{icon:redIcon, title:reports[i].id , autoPan : false, keepInView : false});
         marker.on('click',function(e) {
            for(var i = 0; i < markers.length; i ++) {
               markers[i].setIcon(redIcon);
            }
            e.target.setIcon(blueIcon);
            console.log(e.target);

           cluster.refreshClusters();
            var targetPoint = mymap.project(e.target._latlng, 15).subtract([0, 175]);
            var newPoint = mymap.unproject(targetPoint, 15);
            mymap.setView(newPoint, 15);
            var index = $('#' + e.target.options.title).val();
            console.log(index);
            $("#report").accordion("option", "active", parseInt(index)); 
                  
       // mymap.panTo(newPoint);
     //   mymap.setZoomAround(newPoint, 15);
         
         });
        // marker.addTo(mymap);
         markerBind(marker, reports[i]);
         markers.push(marker);
         console.log(marker);
        cluster.addLayer(marker);
      }
   }
//   mymap.addLayer(cluster);
   print.innerHTML = "created map markers";

}

//binds popup containing report data to marker!
function markerBind(marker, report) {
   var src = 'pic/' + report.id + "." + report.ext;
   var lat = $("<p></p>").text("Lat/Long: " + report.lat + ", " + report.long).css('line-height', '1em');
   var time = $("<p></p>").text("Timestamp: " + report.timestamp);
   var name = $("<p></p>").text("name: " + report.name);
   var text = $("<p></p>").text("Text: " + report.text);


   var div;
   var link;
   if((/(gif|jpg|jpeg|tiff|png)$/i).test(report.ext)) {
      link = $("<a></a>").attr("href",src).attr("data-lightbox","imag1");
      link.append($("<img></img>").attr("src",src).attr("width",50).attr("height",50));
   }
   else {
      link = $("<video controls></video>").attr("width",320).attr("height",240);
      link.append($("<source></source>").attr("src",src).attr("type","video/mp4")); 

   } 
   div = $("<div></div>").append(lat,time,name,text, link);
   marker.bindPopup(div.html());
/*
   marker.bindPopup("Latitude: " +report.lat +"<br>" 
                    + "Longitude: " + report.long +"<br>"
                    + "Timestamp: " + report.timestamp +"<br>"
                    + "Name: " + report.name + "<br>"
                    + "Text: " + report.text +"<br>"
                    +  '<a href = "pic/' + report.id + "." + report.ext + '" data-lightbox = "image1" >' +   ' <img width = "50" height = "50" src=' + src +  '></img><br>'    +   '</a>'
                     
                    );
*/
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




