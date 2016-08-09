//btw if you are confused about report id vs marker title, they are basically the same thing
//marker only has one field that i can set as an id, which is called the "title" in the marker object. 
checkLoginStatus();

//map stuff
var mymap = L.map('mapid').setView([37.279518,-121.867905], 11);
//global to store the current marker aka the most recently clicked marker
var currentMarker;

//stores reports from mysql and map markers
var reports = [];
var markers = [];
var refreshId = -1;

//intializes marker clusters from the leaflet library
var cluster = L.markerClusterGroup({iconCreateFunction : function (cluster) {
   var children = cluster.getAllChildMarkers();
   for(var i = 0; i < children.length; i ++) {
      if(children[i].options.icon.options.iconUrl == "images/blu-circle.png")
         return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + 
           '</span></div>', className: 'marker-cluster' + ' marker-cluster-large', iconSize: new L.Point(40, 40) });                   
   }
   return new L.DivIcon({ html: '<div><span>' + cluster.getChildCount() + '</span></div>', 
     className: 'marker-cluster' + ' marker-cluster-small', iconSize: new L.Point(40, 40) });
}} );

//map tile creation stuff
L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'rosglue.0fng9eaj',
    accessToken: 'pk.eyJ1Ijoicm9zZ2x1ZSIsImEiOiJjaXBzbDkzdXcwM3c1ZmttMjhyNzR1bmVxIn0.g45wbGBB5SprrAES2ju06Q'
}).addTo(mymap);
	
//add cluster marker object to map
mymap.addLayer(cluster);

//custom icon stuff
var LeafIcon = L.Icon.extend({
    options: {
        iconSize:     [38, 38],
        iconAnchor:   [22, 40],
        popupAnchor:  [-3, -38]
    }
});

var redIcon = new LeafIcon({iconUrl: 'images/red-circle.png'});
var blueIcon = new LeafIcon({iconUrl: 'images/blu-circle.png'});
var greenIcon = new LeafIcon({iconUrl: 'images/grn-circle.png'});

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

//initializes the sidebar accordion with callbacks
$("#report").accordion({collapsible:true, autoHeight : false,
   activate: function( event, ui ) {
      if(!$.isEmptyObject(ui.newHeader.offset())) {
         $(ui.newHeader).ScrollTo();
      }}});
//button with callback to logout
$("#logout").button().on("click", function() {
   $("<div>").text("Do you wish to logout?").dialog({
   title : "Logout",
   buttons : {
      "Logout" : logout,
      "Cancel" : function () { $(this).dialog("close");}
      } 
   });

});

//on "Show All" radiobox check, activate polling and disable filter boxes
$("#all").on("click",function() {
   clearLocalData();
   if(refreshId != -1) {
      window.clearInterval(refreshId);
      refreshId = window.setInterval(getAllReports, 3000);
   }
   else
      refreshId = window.setInterval(getAllReports, 3000);
   $("#filter1").attr("disabled",true); 
   $("#filter2").attr("disabled",true);
   $("#realtime").prop("checked",false);
   $("#realtime").checkboxradio('refresh');
   $("#realtime").checkboxradio("option","disabled",true);
   $("#updateFilter").button("option","disabled",true);
});


//on "Filter by Date" radiobox check, deactivate polling and reactivate filter boxes
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
           refreshId =  window.setInterval(getFilteredReports, 3000, '"'+$("#filter1").val()+ '"', "(CURRENT_DATE + INTERVAL 1 DAY - INTERVAL 1 SECOND)");
        }
        else {
           clearLocalData();
           refreshId =  window.setInterval(getFilteredReports, 3000, '"'+$("#filter1").val()+ '"', "(CURRENT_DATE + INTERVAL 1 DAY - INTERVAL 1 SECOND)");
        } 
     }
     else if($("#filter2").datepicker("getDate")!=null) { 
        if(refreshId != -1) {
           window.clearInterval(refreshId);
           refreshId = -1;
        }
        clearLocalData();
        getFilteredReports($("#filter1").val(), $("#filter2").val() + ' 23:59:59');
     }
     else
        $("<div>").dialog({title : "Error"}).append($("<p>").text("Filter options are improperly filled out"));
  }
  else
     $("<div>").dialog({title : "Error"}).append($("<p>").text("Filter options are improperly filled out"));
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
         storeReports(data); 
         showReports();
         createMarkers();
      }  
   });
}

//helper function to store requested data from mysql database into objects
function storeReports(data) {
   var coord_json = jQuery.parseJSON(data);
   for(var i = 0; i < coord_json.length; i ++) {
      if(!hasReport(parseInt(coord_json[i].gps_id))) {
         var rep = { "id" : parseInt(coord_json[i].gps_id),
           "lat" : parseFloat(coord_json[i].gps_lat), 
           "long" : parseFloat(coord_json[i].gps_long),
           "text" : coord_json[i].gps_text,  
           "ext" : coord_json[i].gps_ext,
           "name" : coord_json[i].gps_name,
           "timestamp" : coord_json[i].gps_timestamp,
           "default_gps" : parseInt(coord_json[i].default_gps),
           "default_timestamp" : parseInt(coord_json[i].default_timestamp)}; 
         reports.push(rep);  
                 //console.log(rep);
      }
   }
   coord_json.length = 0;
}


//helper function to clear out local report data
function clearLocalData() {
   cluster.clearLayers(); 
   $("#report").empty();
   $("#report").accordion("refresh");
   reports.length = 0;
   markers.length = 0
}

//gets a subset of the reports indictated by left and right date
function getFilteredReports(leftDate, rightDate) {
   var range = [ leftDate, rightDate];
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ range : range }, 
      success: function(data) {
         console.log(data);
         storeReports(data);
         showReports();
         createMarkers();
       }  
       });
} 

//shows all reports in the global reports[] array on the sidebar by using jquery to create a crapton of html elements
//i basically populate a jquery-ui accordion: each section is made up of a header and a div containing all the elements.
//attaches callback functions to the created elements to zoom,delete, edit, and toggle unlock buttons
//NOTE: this is why I want to move from jquery to a good web framework for all this ui stuff. too much code!
function showReports() {
   var flag = 0;
   for(var i = 0; i < reports.length; i++) {
      if(hasMarker(reports[i].id))
         continue;
      var div = $("<div>").attr("id", reports[i].id.toString());
      var section = $("<h3>").text("ID: "+ reports[i].id + " Timestamp:"+reports[i].timestamp).attr("id", 'a'+reports[i].id.toString())
      var id = $("<p></p>").text("ID: "+ reports[i].id + " Timestamp:"+reports[i].timestamp);
      var timestamp = $("<p></p>").attr("id","sidebarTimestamp").text("Timestamp: " + reports[i].timestamp);
      var name = $("<p></p>").attr("id","sidebarName").text("Name: "+ reports[i].name);
      var text = $("<p></p>").attr("id","sidebarText").text("Text: "+ reports[i].text);
      var def_gps = $("<p>").attr("id","sidebarFGPS").text("Fallback GPS: " + (reports[i].default_gps == 1 ? 'Y' : 'N'));
      var def_timestamp = $("<p>").attr("id","sidebarFTimestamp").text("Fallback Timestamp: " + (reports[i].default_timestamp == 1 ? 'Y' : 'N'));

      //now for the buttons and their callbacks....
      var del = $("<button></button>").button({label:"Delete"});
      del.on("click", reports[i].id, function(e) {
         $("#dialog-confirm").dialog({
           modal : true,
           buttons : {
              "Delete this Report" : function() {deleteData(e.data);
                                                 $(this).dialog("close");},
              "Cancel" : function () { $(this).dialog("close");}}
          });
       });

      var zoom = $("<button></button>").button({label:"Zoom"});
      zoom.on("click", reports[i].id, function(e) { zoomOnMarker(findMarker(e.data));}); 
      
      var edit = $("<button>").button({label:"Edit"});
      edit.on("click", reports[i], function(e) {
        // deleteData(e.data);
        $("#dialog-edit").dialog({
          modal : true,
          title : "Edit This report",
          minWidth : 350,
          buttons : {
             "Edit" : function() { 
                 editReport(e.data, $("#name").val(), $("#timestamp").val(), $("#text").val(),
                   ($("#def_gps").prop('checked') == true ? 1 : 0), ($("#def_timestamp").prop('checked') == true ? 1 : 0));
                 $(this).dialog("close");},
                      
             "Cancel" : function () { $(this).dialog("close");}}
          });
          //$("#name").val(e.data.name);
        $('#timestamp').val(e.data.timestamp);
        $('#text').val(e.data.text);
        $('#def_gps').prop('checked', (e.data.default_gps ==1 ? true : false));
        $('#def_timestamp').prop('checked', (e.data.default_timestamp ==1 ? true : false));
        var getnames = "getnames";
	$.ajax({
           type: "POST",
           url: "src/view.php",
           data:{ getnames : getnames }, 
           success: function(data) {
              var names_json = jQuery.parseJSON(data);
              $("#name").empty();
              for(var i = 0; i < names_json.length; i++) {
                 $("#name").append($("<option></option>").attr("value", names_json[i]).text(names_json[i]));
              }
              $("#name").val(e.data.name);
           }   
       })
       });
     //END EDIT button STUFF, i know its long :x

      //toggle button that unlcoks/locks marker so you can drag it around
      //NOTE- i remove the marker from the cluster group when dragging it around because
      // with the clusters you have to readd stuff if you want to change the positions
      var toggle = $("<button>").button({label: "Unlock Marker"});
      toggle.on('click', reports[i], function (e) {
         var thisMarker = findMarker(e.data.id);
         //if dragging is enabled, disable dragging (lock marker position).,
         // and do cleanup/save the location
         if(thisMarker.dragging.enabled()) {
            mymap.removeLayer(thisMarker);
            cluster.addLayer(thisMarker);
            thisMarker.dragging.disable();
            thisMarker.off('popupopen');
            thisMarker.on('click',markerCallback);
            $(this).text("Unlock Marker");
            thisMarker.setIcon(redIcon);

            editLocation(e.data,thisMarker.getLatLng());     

            thisMarker.unbindPopup();
            markerBind(thisMarker, e.data); 
         }
         //if dragging is disabled, enable dragging (unlock marker position),
         // do things like update current marker, change color to green, etc...
         else {
            cluster.removeLayer(thisMarker);
            mymap.addLayer(thisMarker);
            mymap.fire("zoomend");
            currentMarker.setIcon(redIcon);
            currentMarker = thisMarker;
            thisMarker.setIcon(greenIcon);
            currentMarker = thisMarker;
            thisMarker.on('popupopen', function(){
               this.closePopup(); 
               if(currentMarker!=this) {
                  if(currentMarker.options.icon.options.iconUrl != "images/grn-circle.png")
                     currentMarker.setIcon(redIcon);
                  currentMarker = this;
                  $("#a"+this.options.title).trigger("click");
                  cluster.refreshClusters();
               } 
            });
            thisMarker.off('click',markerCallback);
            thisMarker.dragging.enable();
            $(this).text("Lock Marker");
            cluster.refreshClusters();
         }
      });
      //END OF TOGGLE LOCK/UNLOCK BUTTON STUFF

      //if user is not a admin, remove ability to edit reports.
      //dont worry, even if they somehow enable this the php code will verify the correct login info stuff too
      if(user == "user") {
         edit.button("disable");
         del.button("disable");
         toggle.button("disable");
      }
      //creates the div to add to accordion
      div.append(name,timestamp,text,def_gps,def_timestamp,zoom,del,edit,toggle);
      //adds the div and header to the accordion
      $("#report").append(section, div);
      flag = 1;
   }
   //finish loop to add everything to the sidebar accordion
   if(flag == 1)
      $("#report").accordion("refresh");

}

//edits the locally stored report, then changes it in the mysql db via ajax call to php
function editReport(report, name, timestamp, text, default_gps, default_timestamp) {
   $("#"+report.id).children("#sidebarName").text("Name: " + name); 
   report.name = name;
   $("#"+report.id).children("#sidebarText").text("Text: " + text); 
   report.text = text;
   $("#"+report.id).children("#sidebarTimestamp").text("Timestamp: " + timestamp); 

   $("#"+report.id).children("#sidebarFGPS").text("Fallback GPS: " + (default_gps == 1 ? 'Y' : 'N'));
   $("#"+report.id).children("#sidebarFTimestamp").text("Fallback Timestamp: " + (default_timestamp == 1 ? 'Y' : 'N'));
   report.timestamp = timestamp;
   report.default_gps =default_gps ;
   report.default_timestamp =default_timestamp ;

   var marker = findMarker(report.id);
   marker.unbindPopup();
   markerBind(marker,report);
   marker.update();
   marker.getPopup().update();
   marker.closePopup();
   marker.openPopup();
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ report : report }, 
      success: function(data) {
         //console.log(data);
    }});

}

//mini version of editReport that only deals with the gps coordinate stuff
function editLocation(report, pos) {
   report.lat = pos.lat;
   report.long = pos.lng;
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ report : report }, 
      success: function(data) {
               //console.log(data);
   }});
}

//removes the php session data, and changes page
function logout() {
   var logout = "logout";
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ logout : logout }, 
      success: function(data) {
         //console.log(data);
         window.location.href = "https://scvwdflood.org/login.html";
    }});
}

//function that runs at page load. If not logged in (by checking php session data),
//goes back to the login screen
function checkLoginStatus() {
   var status = "status";
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ status : status }, 
      success: function(data) {
         console.log(data);
         if(data != "admin" && data != "user") {
            window.location.href = "https://scvwdflood.org/login.html"; 
         }
         else
            user = data;
    }});




}

//zooms in on the marker and opens the attached popup bubble 
function zoomOnMarker(centerMarker) {
   for (var i = 0; i < markers.length; i ++ ) {
      markers[i].setIcon(redIcon);
   }
   centerMarker.setIcon(blueIcon);
   centerMarker.update();
   mymap.setView(centerMarker._latlng,13,{animate: true, 
     pan: {duration : 0.25, easeLinearity : 0.25  }   });
   cluster.refreshClusters();
}

//deletes the report and marker with this id. removes it from the markers[] and reports[] arr,
//and removes them from the map and sidebar
//also does ajax call to make the server delete it from the mysql database
function deleteData(id) {
   //console.log(id);
   $("#report").children("#"+id).remove();
   $("#report").children("#a"+id).remove();
   $("#report").accordion("refresh");
   $("#report").accordion("option","active",false);
   cluster.removeLayer(findMarker(id));

   if(removeReport(id))
      //console.log("succ");
   if(removeMarker(id)) 
      //console.log("succccc");
   
   $.ajax({
      type: "POST",
      url: "src/view.php",
      data:{ id : id }, 
      success: function(data) {
         console.log(data);
    }});
}

  
//create markers on the map from the report array
//keeps track of markers created using the mysql id in the markers array
function createMarkers() {
   for(var i = 0; i < reports.length; i ++) {
      if(!hasMarker(reports[i].id)) {
         var marker = L.marker([reports[i].lat, reports[i].long],{icon:redIcon, title:reports[i].id , autoPan : false, keepInView : false});
         marker.on('click', markerCallback);
         markerBind(marker, reports[i]);
         markers.push(marker);
         //console.log(marker);
        cluster.addLayer(marker);
      }
   }

}

//marker callback attached to every marker
//d`oes things like changes the color of the marker on click, zoom in on marker on click, etc...
//e.target in this function is the marker object that got clicked on
//currentMarker is a global that holds the currently clicked on marker.
function markerCallback(e) {

   if(currentMarker != null && currentMarker != e.target && currentMarker.options.icon.options.iconUrl != "images/grn-circle.png")
      currentMarker.setIcon(redIcon);
   if(currentMarker != e.target )
      $('#a' + e.target.options.title).trigger("click");
   e.target.setIcon(blueIcon);
   currentMarker = e.target;
   cluster.refreshClusters();
   var targetPoint = mymap.project(e.target._latlng, 15).subtract([0, 175]);
   var newPoint = mymap.unproject(targetPoint, 15);
   if(mymap.getZoom()<15)
      mymap.setView(newPoint, 15);
}

//creates and binds popup containing report data to marker using jquery to create the elements!
function markerBind(marker, report) {
   var src = 'pic/' + report.id + "." + report.ext;
   var lat = $("<p></p>").text("Lat/Long: " + report.lat + ", " + report.long).css('line-height', '1em');
   var time = $("<p></p>").text("Timestamp: " + report.timestamp);
   var name = $("<p></p>").attr("id", "markerName").text("name: " + report.name);
   var text = $("<p></p>").text("Text: " + report.text);
   var def_gps = $("<p>").text("Fallback GPS: " + (report.default_gps == 1 ? 'Y' : 'N'));
   var def_timestamp = $("<p>").text("Fallback Timestamp: " + (report.default_timestamp == 1 ? 'Y' : 'N'));

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
   div = $("<div></div>").attr("id", "marker"+report.id).append(lat,name,time,text,def_gps,def_timestamp, link);
   marker.bindPopup(div.html());
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



