var ___test = -1;
QUnit.module("Mysql Connect & Clear Test");
QUnit.test( "Connect & Clear", function( assert ) {
   var done1 = assert.async();
   var ajax = $.ajax({
      type: "POST",
      url: "tests/js/clear.php",
      error : function() {assert.equal("false", "error");},
      success : function() {
         assert.equal(ajax.responseText, "succ");
         done1();
      }
   });
});
___test = -1;
QUnit.module("Report.js Tests");
QUnit.test( "Register One Name Test", function( assert ) {

   var done2 = assert.async();
   var nameForm = $("<form>");
   var name = $("<input>").attr("id","cname").attr("name","namereg").val("testName0");
   nameForm.append(name);
   registerName(nameForm);
   setTimeout(function() {
      assert.equal(JSON.parse(___test),"succ");
      done2();},500);
});

___test = -1;
QUnit.test( "Duplicate Name Check", function( assert ) {

   var done3 = assert.async();
   var nameForm = $("<form>");
   var name = $("<input>").attr("id","cname").attr("name","namereg").val("testName0");
   nameForm.append(name);
   registerName(nameForm);
   setTimeout(function() {
      assert.equal(JSON.parse(___test),"error");
      done3();},500);
});

___test = -1;
QUnit.test( "Register Two more Names Test", function( assert ) {

   var done4 = assert.async(2);
   var nameForm = $("<form>");
   var name = $("<input>").attr("id","cname").attr("name","namereg").val("testName1");
   nameForm.append(name);
   registerName(nameForm);
   setTimeout(function() {
      assert.equal(JSON.parse(___test),"succ");
      done4();},500);

   name.val("testName2");
   registerName(nameForm);
   setTimeout(function() {
      assert.equal(JSON.parse(___test),"succ");
      done4();},500);
});


___test = -1;
QUnit.test( "Populate Name Selectbox Test", function( assert ) {
   var done5 = assert.async(1);
   var select = $("<select>").attr("id","sel");
   updateNames(select);
   setTimeout(function() {
      assert.equal(3,$(select).children('option').length);
      done5();},500);
});
___test = -1;
QUnit.test( "Send Report (Form) Test *ONLY SENDS BLANK FORM", function( assert ) {
   var done6 = assert.async();
   globalForm = $("<form>");
   var input = $("<input>").attr("name","name").val("lul");
   var text = $("<input>").attr("name","text").val("lul");
   globalForm.append(input,text);
   var coords = {"coords" : { "latitude" : 0, "longitude" : 0}};
   saveCoords(coords);
   setTimeout(function() {
      assert.equal("Report Saved Succesfully",JSON.parse(___test));
      done6();},500);
});
