var map, cmp, admin ;
var identifyTask,identifyParams ;
var initExtent;
var visible = [];
var locator ;

//make console.log work in IE
//Remove before production
if (typeof window.console == "undefined") window.console = {log: function () {}};

					
function openTab(tabnum){
$("#dialog").dialog('open');
$("#tabs").tabs('select', tabnum);
}
			
function openTab2(tabnum){
$("#dialog2").dialog('open');
$("#tabs2").tabs('select', tabnum);
}
			
function toggleLayers() {
var inputs = dojo.query(".list_item"), input;
//in this application layer 2 is always on.
 visible = [99];
   for (var i=0, il=inputs.length; i<il; i++) {
    if (inputs[i].checked) {
        visible.push(inputs[i].id);
      }
      }
   admin.setVisibleLayers(visible);
    } 
	
function zoom(l1, l2){
  var delta = 10;
  var lng = l2;
 var lat = l1;
 var S8 =  new esri.geometry.Extent(lat-delta, lng-delta, lat+delta, lng+delta, new esri.SpatialReference({wkid:102100}));
 map.setExtent(S8.getExtent().expand(200));
}

				
$(document).ready(function(){

$("#slider").slider({
value:80,
min:0,
max:100,
step:5,	
slide : function(evt, ui){
admin.setOpacity(parseFloat(ui.value/100));
}
 });
			 
 $('.openinfoD1').click(function(event) {
event.preventDefault()
  $("#infoD1").dialog('open');
  });
      $("#infoD1").dialog({
  	autoOpen: false,
    modal:true,
    dialogClass : 'infoD1'
    });
	
   $('.openinfoDX').click(function(event) {
event.preventDefault()
  $("#infoDX").dialog('open');
  });
      $("#infoDX").dialog({
  	autoOpen: false,
    modal:true,
    dialogClass : 'infoDX'
    });
	
	   $('.openinfoI2').click(function(event) {
event.preventDefault()
  $("#infoI2").dialog('open');
  });
      $("#infoI2").dialog({
  	autoOpen: false,
    modal:true,
    dialogClass : 'infoI2'
    });

 $('.openinfoIX').click(function(event) {
event.preventDefault()
  $("#infoIX").dialog('open');
  });
      $("#infoIX").dialog({
  	autoOpen: false,
    modal:true,
    dialogClass : 'infoIX'
    });
	
 			 $("#dialog").dialog({
  			autoOpen: false,
    		modal:true,
    		dialogClass : 'dialog',
    		open : function(event, ui){
      		$("#tabs").tabs();
   			 }
  			});
			
			 $("#dialog2").dialog({
  			autoOpen: false,
    		modal:true,
    		dialogClass : 'dialog2',
    		open : function(event, ui){
      		$("#tabs2").tabs();
   			 }
  			});
			
           $('#checkallpa').click(function () {
		   $(this).parents('fieldset:eq(0)').find(':checkbox').attr('checked', this.checked);
		   updateDynLayerVisibility();
		   map.infoWindow.hide();
		   });
		   
		 $('#checkallbase').click(function () {
		   $(this).parents('fieldset:eq(0)').find(':checkbox').attr('checked', this.checked);
		   toggleLayers();
		   map.infoWindow.hide();
		   });

	       $(function () {
   		 	 if ($.browser.msie) {
       	     $('input:checkbox').click(function () {
       	     this.blur();
       	     this.focus();
       	 		});
    		 }
			});
			
			$('#typeFilter').bind('change', function() {
				if ($(this).val().indexOf(',') > 0) {
					var latlng = $(this).val().split(',');
					zoom(latlng[0], latlng[1]);
				}
				else {
					zoomRegion();
				}
			});
  
  });
			
  function init() {
			esri.config.defaults.map.slider = { left:"13px", top:"45px", width:null, height:"160px" };
			initExtent = new esri.geometry.Extent({"xmin":-8388547.58,"ymin":4861225.92,"xmax":-8330302.56,"ymax":4907164.57,"spatialReference": {"wkid": 102100}});
         // initExtent = new esri.geometry.Extent({"xmin":-8385213.07,"ymin":4864719.79,"xmax":-8342007.43,"ymax":4903887.27,"spatialReference": {"wkid": 102100}});  
			  var popup = new esri.dijit.Popup({marginTop:40,
              fillSymbol: new esri.symbol.SimpleFillSymbol(esri.symbol.SimpleFillSymbol.STYLE_SOLID, new esri.symbol.SimpleLineSymbol(esri.symbol.SimpleLineSymbol.STYLE_SOLID, new dojo.Color([255,0,0]), 2), new dojo.Color([255,255,0,0.25]))
              }, dojo.create("div"));
		
              map = new esri.Map("map", {
			    infoWindow:popup,
                extent: initExtent
              });
			  
			 dojo.connect(map,'onLoad',mapReady);	
		     createBasemapGallery();
			 
			 	admin = new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.dvrpc.org/ArcGIS/rest/services/Wayfinding/MapServer",{id:"admin", visible:true,"opacity":0.80});
        map.addLayer(admin);
		admin.setVisibleLayers([5,6,7,8]);	
		
			 //Use the ImageParameters to set the visible layers in the map service during ArcGISDynamicMapServiceLayer construction.  
			var imageParameters = new esri.layers.ImageParameters();
                imageParameters.layerIds = [0,1,2,3];
                imageParameters.layerOption = esri.layers.ImageParameters.LAYER_OPTION_SHOW;
	            cmp = new esri.layers.ArcGISDynamicMapServiceLayer("http://gis.dvrpc.org/ArcGIS/rest/services/Wayfinding/MapServer",{
	            "imageParameters": imageParameters,
			    opacity:1.0
			    });
                map.addLayer(cmp);	
				
		        var resizeTimer;
                dojo.connect(dijit.byId('map'), 'resize', function() { //resize the map if the div is resized
                  clearTimeout(resizeTimer);
                  resizeTimer = setTimeout(function() {
                    map.resize();
                    map.reposition();
                  }, 500);
                });
				
	     locator = new esri.tasks.Locator("http://tasks.arcgisonline.com/ArcGIS/rest/services/Locators/TA_Address_NA_10/GeocodeServer");
         dojo.connect(locator, "onAddressToLocationsComplete", showResults);		
	   
            }
	   
            function createBasemapGallery() {
              //manually create basemaps to add to basemap gallery
              var basemaps = [];
			
			//  Original code without reference
			//   basemaps.push(new esri.dijit.Basemap({
           //     layers: [new esri.dijit.BasemapLayer({
           //       type: 'GoogleMapsRoad'
           //     })],
           //     title: "Google Maps",
           //     thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/googleroad.png")
           //   }));
			  
			   basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  type: 'GoogleMapsHybrid'
				  }), new esri.dijit.BasemapLayer({
                  url: "http://gis.dvrpc.org/ArcGIS/rest/services/DVRPC_Tilegrid/MapServer",visibleLayers: ([5])
			      , isReference:true
                  })],
                title: "Google Hybrid",
                id:'GoogleHybrid',
               thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/ghybrid.png")
              }));
			  
			   basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  type: 'GoogleMapsSatellite'
				 // added next three line for County/MCD Boundary
				  }), new esri.dijit.BasemapLayer({
                  url: "http://gis.dvrpc.org/ArcGIS/rest/services/DVRPC_Tilegrid/MapServer",visibleLayers: ([5])
			      , isReference:true
                })],
                title: "Google Satellite",
                thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/gsatellite.png")
              }));
		
              basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  type: 'GoogleMapsRoad'
				    }), new esri.dijit.BasemapLayer({
                  url: "http://gis.dvrpc.org/ArcGIS/rest/services/DVRPC_Popforecast/MapServer",visibleLayers: ([0])
			      , isReference:true
                })],
                title: "Google Maps",
                thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/groad.png")
              }));
  
			    basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer"
                 }), new esri.dijit.BasemapLayer({
                  url: "http://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer"
				  ,isReference:true
                 })],
                title: "Esri Grey with Label",
			    thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/grey.png")
              }));
			  
			   basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer"
				    }), new esri.dijit.BasemapLayer({
                  url: "http://gis.dvrpc.org/ArcGIS/rest/services/DVRPC_Popforecast/MapServer",visibleLayers: ([0])
			      , isReference:true
                })],
                title: "Esri Street",
				id:"esristreet",
	           thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/streets.jpg")
              }));
			  
              basemaps.push(new esri.dijit.Basemap({
                layers: [new esri.dijit.BasemapLayer({
                  url: "http://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer"
				    }), new esri.dijit.BasemapLayer({
                  url: "http://gis.dvrpc.org/ArcGIS/rest/services/DVRPC_Popforecast/MapServer",visibleLayers: ([0])
			      , isReference:true
                })],
                title: "Esri Topo",
				thumbnailUrl: dojo.moduleUrl("agsjs.dijit", "images/topographic.jpg")
              }));
			              
              var basemapGallery = new esri.dijit.BasemapGallery({
                showArcGISBasemaps: false,
                toggleReference:false,
                basemaps: basemaps,
                googleMapsApi: {  
				 v: 3.6
                },
                map: map
              }, "basemapGallery");
              basemapGallery.startup();
              basemapGallery.select('GoogleHybrid');
              
              dojo.connect(basemapGallery, "onError", function(error) {
                if (console) console.log(error)
              });
            }
			
	     function zoomRegion() {
 		map.setExtent(initExtent);
  } 		
			
	// Start Identify			
	  function mapReady(map){
      dojo.connect(map,"onClick",executeIdentifyTask); 
	  
	  var checkBoxes = dojo.query('input[type=checkbox]');
                       dojo.forEach(checkBoxes, function(cb) {
                       dojo.connect(cb, 'onclick', updateDynLayerVisibility);
                });	
	  
       //create identify tasks and setup parameters 
       identifyTask = new esri.tasks.IdentifyTask("http://gis.dvrpc.org/ArcGIS/rest/services/Wayfinding/MapServer");    
       identifyParams = new esri.tasks.IdentifyParameters();
       identifyParams.tolerance = 8;
       identifyParams.returnGeometry = true;
    //   identifyParams.layerIds = cmp.visibleLayers ;
	   identifyParams.layerIds = [0,1,2,3,4,5,6];
       identifyParams.layerOption = esri.tasks.IdentifyParameters.LAYER_OPTION_VISIBLE;
       identifyParams.width  = map.width;
       identifyParams.height = map.height;  
      }
	 
	  function updateDynLayerVisibility() {
                var inputs = dojo.query(".dyn_item");
                visible = [];
                for (var i = 0, il = inputs.length; i < il; i++) {
                    if (inputs[i].checked) {
                        visible.push(inputs[i].id);
                    }
                }
                // If no layers are visible set the array value to = -1
                // and disconnect the identify task
                if (visible.length === 0) {
                    visible = [-1];
                    map.infoWindow.hide();
                }
                // Update Identifys layers
                identifyParams.layerIds = visible;
                // Update layer visiblity
                cmp.setVisibleLayers(visible);
            }			
	    
	  function executeIdentifyTask(evt) {
	    var mp = esri.geometry.webMercatorToGeographic(evt.mapPoint); 
       if (visible.length === 1 && visible[0] == -1){
                    map.infoWindow.clearFeatures();
                    map.infoWindow.show(evt.mapPoint);
                } else {
                    identifyParams.geometry = evt.mapPoint;
                    identifyParams.mapExtent = map.extent;
    
        var deferred = identifyTask.execute(identifyParams);

        deferred.addCallback(function(response) {     
          // response is an array of identify result objects    
          // Let's return an array of features.
          return dojo.map(response, function(result) {
            var feature = result.feature;
            feature.attributes.layerName = result.layerName;    
		    if(result.layerName === 'D1'){
			   var template = new esri.InfoTemplate();   
			   	var attr = feature.attributes; 	
			   content = "<FONT color=#678E1B><B>D1 Sign</B></FONT><br>"
			     +"<B>Description:</B> ${SIGNTYPE}<br>"
			     +"<B>DVRPC Sign ID:</B> ${Id}<br>"
			     +"<B>Municipality:</B> ${Muni}<br>"
				 +"<B>Highway Orientation:</B> ${HwyOrient}<br>"
				 +"<B>Position:</B> ${Position}<br>"
				 +"<B>Facing Direction:</B> ${FacingDir}<br>"
				 +"<B>Size:</B> ${SIZE}<br>"
				 +"<B>Low:</B> $${LOW:NumberFormat(thousands}"
				 +"	<B>High:</B> $${HIGH:NumberFormat(thousands}<br><br>"
				 +"<B>District Name (Arrow Direction)</B><br>"
				 +"<hr>"
				 + compare(attr.sname1 + "<br>")
				 + compare(attr.sname2 + "<br>")
				 + compare(attr.sname3 + "<br>")
				 +"<br><a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+mp.y+","+mp.x+"&cbp=12,0,0,0,0'>Launch Google Streetview</a>";
			     template.setContent(content);	
			  feature.setInfoTemplate(template);
            }	
			else if (result.layerName ==='DX'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		          content = "<FONT color=#9F7E2D><B>DX Sign</B></FONT><br>"
				 +"<B>Description:</B> ${SIGNTYPE}<br>"
			     +"<B>DVRPC Sign ID:</B> ${Id}<br>"
			     +"<B>Municipality:</B> ${Muni}<br>"
				 +"<B>Highway Orientation:</B> ${HwyOrient}<br>"
				 +"<B>Position:</B> ${Position}<br>"
				 +"<B>Facing Direction:</B> ${FacingDir}<br>"
				 +"<B>Size:</B> ${SIZE}<br>"
				 +"<B>Low:</B> $${LOW:NumberFormat(thousands}"
				 +"	<B>High:</B> $${HIGH:NumberFormat(thousands}<br>"
				 +"<br><a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+mp.y+","+mp.x+"&cbp=12,0,0,0,0'>Launch Google Streetview</a>";
			     template.setContent(content);	
                 feature.setInfoTemplate(template);
            }		
			else if (result.layerName ==='I-2'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		         content = "<FONT color=#7C9ECA><B>I-2 Sign</B></FONT><br>"
				 +"<B>Description:</B> ${SIGNTYPE}<br>"
			     +"<B>DVRPC Sign ID:</B> ${Id}<br>"
			     +"<B>Municipality:</B> ${Muni}<br>"
				 +"<B>Highway Orientation:</B> ${HwyOrient}<br>"
				 +"<B>Position:</B> ${Position}<br>"
				 +"<B>Facing Direction:</B> ${FacingDir}<br>"
				 +"<B>Size:</B> ${SIZE}<br>"
				 +"<B>Low:</B> $${LOW:NumberFormat(thousands}"
				 +"	<B>High:</B> $${HIGH:NumberFormat(thousands}<br>"
				 +"<br><a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+mp.y+","+mp.x+"&cbp=12,0,0,0,0'>Launch Google Streetview</a>";
			     template.setContent(content);	
                 feature.setInfoTemplate(template);
            }				
			else if (result.layerName ==='I-X'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		          content = "<FONT color=#FF8800><B>IX Sign</B></FONT><br>"
				 +"<B>Description:</B> ${SIGNTYPE}<br>"
			     +"<B>DVRPC Sign ID:</B> ${Id}<br>"
			     +"<B>Municipality:</B> ${Muni}<br>"
				 +"<B>Highway Orientation:</B> ${HwyOrient}<br>"
				 +"<B>Position:</B> ${Position}<br>"
				 +"<B>Facing Direction:</B> ${FacingDir}<br>"
				 +"<B>Size:</B> ${SIZE}<br>"
				 +"<B>Low:</B> $${LOW:NumberFormat(thousands}"
				 +"	<B>High:</B> $${HIGH:NumberFormat(thousands}<br>"
				 +"<B>District Name (Arrow Direction)</B>${sname1}<br>"
				 +"<br><a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+mp.y+","+mp.x+"&cbp=12,0,0,0,0'>Launch Google Streetview</a>";
			     template.setContent(content);	
                 feature.setInfoTemplate(template);
            }
			else if (result.layerName ==='ExistingSigns'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		           content = "<FONT color=#CB2F27><B>Existing Sign</B></FONT><br>"
				   +"<B>Description:</B> ${DESCRIPT_1}<br>"
			     +"<B>PennDOT ID:</B> ${ID}<br>"
			     +"<B>Municipality:</B> ${MUNI}<br>"
				 +"<B>Highway Orientation:</B> ${HWYSORIENT}<br>"
				 +"<B>Position:</B> ${POSITION}<br>"
				 +"<B>Facing Direction:</B> ${FACING_DIR}<br>"
				 +"<B>Post Type:</B> ${POST_TYPE}<br>"
				 +"<B>Size:</B> ${WIDTH} x ${HEIGHT}<br>"
				 +"<br><a target='_blank' href='http://maps.google.com/maps?q=&layer=c&cbll="+mp.y+","+mp.x+"&cbp=12,0,0,0,0'>Launch Google Streetview</a>";
			     template.setContent(content);
                 feature.setInfoTemplate(template);
            }
			else if (result.layerName ==='Attractions'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		        content = "<B>Name:</B> ${Descriptio}<br>";
			     template.setContent(content);	
                 feature.setInfoTemplate(template);
            }
			else if (result.layerName ==='CommDistricts'){
			     var template = new esri.InfoTemplate();
				 var attr = feature.attributes;
		        content = "<B>Name:</B> ${Name}<br>";
			     template.setContent(content);	
                 feature.setInfoTemplate(template);
            }																																																																						
            return feature;
          });
        });
		
        map.infoWindow.setFeatures([ deferred ]);
        map.infoWindow.show(evt.mapPoint);
      }
	}  
 // end identify

function compare(feature) {
	    if (feature.length > 0)    
	    return "" + feature +"";
		else return "";
      }

 		
  //Locator
	function locate() {
        map.graphics.clear();
        var address = {"SingleLine":dojo.byId("address").value};
        locator.outSpatialReference= map.spatialReference;
        locator.addressToLocations(address,["Loc_name"]);
      }

      function showResults(candidates) {
       var candidate;
      var symbol = new esri.symbol.SimpleMarkerSymbol();
        var infoTemplate = new esri.InfoTemplate("Location", "Address: ${address}<br />Score: ${score}<br />Source locator: ${locatorName}");
        symbol.setStyle(esri.symbol.SimpleMarkerSymbol.STYLE_SQUARE);
        symbol.setSize (12);
        symbol.setColor(new dojo.Color([153,0,51,0.75]));

        var geom;
        
        dojo.every(candidates,function(candidate){
          console.log(candidate.score);
          if (candidate.score > 80) {
            console.log(candidate.location);
            var attributes = { address: candidate.address, score:candidate.score, locatorName:candidate.attributes.Loc_name };   
            geom = candidate.location;
            var graphic = new esri.Graphic(geom, symbol, attributes, infoTemplate);
            //add a graphic to the map at the geocoded location
            map.graphics.add(graphic);
            //add a text symbol to the map listing the location of the matched address.
            var displayText = candidate.address;
            var font = new esri.symbol.Font("16pt",esri.symbol.Font.STYLE_NORMAL, esri.symbol.Font.VARIANT_NORMAL,esri.symbol.Font.WEIGHT_BOLD,"Helvetica");
           
            var textSymbol = new esri.symbol.TextSymbol(displayText,font,new dojo.Color("#666633"));
            textSymbol.setOffset(0,8);
       //     map.graphics.add(new esri.Graphic(geom, textSymbol));
            return false; //break out of loop after one candidate with score greater  than 80 is found.
          }
        });
        if(geom !== undefined){
          map.centerAndZoom(geom,15);
        }

      }
	   
             
 dojo.addOnLoad(init);