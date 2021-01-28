
function load_map(){
	mapboxgl.accessToken = 'pk.eyJ1IjoiY29sbGVjdGl2ZXRoZW9yeSIsImEiOiJjanIzejZ4bTUwY2Z4NDNuNWZvZzRoNXM0In0.YnUUjbGwy58YQhj-NMoDGA';
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/dark-v10',
		zoom: 1,
		//renderWorldCopies: false
	});

	let Galaxy_18_NAKH_bounds = [[-128.18955903027947, 3.880701784393068], [-107.4541919291027, 81.82574117175974]]
	let Eutelat_113_bounds = [[-111.2720408664392, -55.06978282991927], [-51.60000073171241, 49.641482239547315]]
	let Telstar_11N_Africa_bounds = [[10.9600094038868, -48.9986614870798], [32.17916461214418, 27.584754550657436]]
	let Telstar_11N_Europe_bounds = [[8.532934187981397, 22.64368503931415], [33.76930810071687, 77.57932587470356]]
	let Telstar_18V_2_bounds = [[132.24924519548665, 10.440357748029811], [138.73709313985535, 75.99405602039246]]
	let Telstar_18V_bounds = [[132.42858274511315, -50.54379248483775], [151.6219949287867, 78.7696827166721]]


	//$colors: #0BA0CE, #007CFF, #704FFF, #912FDF, #BD1BD9, #CE2F8D;
	let satelliteGeojson = [
		{id:"Galaxy_18", name:"Galaxy 18 (North America)", flatPanelAntenna: true, value: 123, geoJson: Galaxy_18, bounds: Galaxy_18_NAKH_bounds, fillColor: "#0BA0CE"}, 
		{id:"Eutelsat_113", name:"Eutelsat 113 (South America)", flatPanelAntenna: true, value: 113, geoJson: Eutelsat_113, bounds: Eutelat_113_bounds, fillColor: "#007CFF"}, 
		{id:"Telstar_11N_Africa", name:"Telstar 11N (Africa)", flatPanelAntenna: true, value: 37.5, geoJson: Telstar_11N_Africa, bounds: Telstar_11N_Africa_bounds, fillColor: "#704FFF"},
	    {id:"Telstar_11N_Europe", name:"Telstar 11N (Europe)", flatPanelAntenna: true, value: 37.5, geoJson: Telstar_11N_Europe, bounds: Telstar_11N_Europe_bounds, fillColor: "#912FDF"}, 
	    {id:"telstar18v_2", name:"Telstar 18V Ku Band (Asia Pacific)", flatPanelAntenna: true, value: -138, geoJson: telstar18v, bounds: Telstar_18V_2_bounds, fillColor: "#CE2F8D"},
		{id:"telstar18v", name:"Telstar 18V C Band (Asia Pacific)", flatPanelAntenna: false, value: -138, geoJson: telstar18v_2, bounds: Telstar_18V_bounds, fillColor: "#BD1BD9"},
	]

	var marker = new mapboxgl.Marker({color: "#3C82F9"})
	let popup = new mapboxgl.Popup({ closeOnClick: false })


	search_coords = [];
	var EIRPlevels = [];
	var PopUpInfo = "";
	let PopUpCoord = ""
	let PopUpAddress = ""
	let worldBounds = [ [-180, -85], [180, 85] ]
	// custom fit to bounds by Experimenting with lat, long values
	let fitToMapBounds = [[1.42858274511315, -50.54379248483775], [1.6219949287867, 65.7696827166721]]

	// Latitude and Longitude input query 
	var coordinatesGeocoder = function(query) {
		// match anything which looks like a decimal degrees coordinate pair
		var matches = query.match(
			/^[ ]*(?:Lat: )?(-?\d+\.?\d*)[, ]+(?:Lng: )?(-?\d+\.?\d*)[ ]*$/i
			);
			if (!matches) {
			return null;
		}
		
		function coordinateFeature(lng, lat) {
			return {
				center: [lng, lat],
				geometry: {
				type: 'Point',
				coordinates: [lng, lat]
			},
				place_name: 'Lat: ' + lat + ' Lng: ' + lng,
				place_type: ['coordinate'],
				properties: {},
				type: 'Feature'
			};
		}
		
		var coord1 = Number(matches[1]);
		var coord2 = Number(matches[2]);
		var geocodes = [];
		
		if (coord1 < -90 || coord1 > 90) {
		// must be lng, lat
			geocodes.push(coordinateFeature(coord1, coord2));
		}
		
		if (coord2 < -90 || coord2 > 90) {
		// must be lat, lng
			geocodes.push(coordinateFeature(coord2, coord1));
		}
		
		if (geocodes.length === 0) {
		// else could be either lng, lat or lat, lng
			geocodes.push(coordinateFeature(coord1, coord2));
			geocodes.push(coordinateFeature(coord2, coord1));
		}
		
		return geocodes;
	};
	// Add Autocomplete search to map ************
	var geocoder = new MapboxGeocoder({
		accessToken: mapboxgl.accessToken,
		localGeocoder: coordinatesGeocoder,
		zoom: 14,
		marker: false,
		flyTo: false,
	    placeholder: 'Enter Address or Lat Lng (i.e Lat: 27 Lng: -80)',
	    clearOnBlur: true,
		mapboxgl: mapboxgl
	})

	//map.addControl(geocoder);
	document.getElementById('geocoder').appendChild(geocoder.onAdd(map));

	geocoder.on('result', function(e) {
	    let lat = e.result.geometry.coordinates[1]
	    let long = e.result.geometry.coordinates[0]
		let coord = e.result.geometry.coordinates
	   
	 	if(marker){
			marker.remove()
	 	}
		search_coords = [lat,long];
	    marker.setLngLat(coord).addTo(map);
	    
	    PopUpCoord = `<div class="popup-coord">
						<p>Lat, Lng: <span>(${lat}, ${long})</span></p>
					  </div>
					`
	    PopUpAddress = ""		
	    reverseGeocode(long.toString() + "," + lat.toString());
	});

	geocoder.on('error', function(e) {
		console.log(e)
	})

	// Find Lat, Long Point in All Satellite GeoJson 
	const findPointInAllSatellites = () => {
		// Empty Satellite Found
		let satelliteFound = []
		satelliteGeojson.forEach(satellite => {
			// Create obj to push into SatelliteFound Array
			let satDetailsObj = {
				satelliteName: satellite.name,
				satelliteId: satellite.id,
				satelliteFlatPanelAntenna: satellite.flatPanelAntenna,
				satelliteValue: satellite.value,
				satelliteColor: satellite.fillColor,
				satEIRPlevels: []
			}
			// Array of satEIRP found
			let satEIRP = []
			satellite.geoJson.forEach(layer => {
				var coords = layer.geometry.coordinates;
				coords.forEach(coord => {
					if(isMarkerInsidePolygon([search_coords[1],search_coords[0]], coord)) {
						satEIRP.push(parseInt(layer.properties.Name));
					}
				})   
			})
			// if there's "marker inside Polygon" add the satEIPR to the "satDetailsObj" and push it inside "satelliteFound"
			if(satEIRP.length > 0){
				satDetailsObj.satEIRPlevels = satEIRP
				satelliteFound.push(satDetailsObj)
			}
		})
		showPopup(satelliteFound)
	}


	//*A* EIRP level to dish size table by associative array
	var dishSize = new Object();
	dishSize["34"] = 355;
	dishSize["35"] = 300;
	dishSize["36"] = 240;
	dishSize["37"] = 180;
	dishSize["38"] = 150;
	dishSize["39"] = 135;
	dishSize["40"] = 120;
	dishSize["41"] = 120;
	dishSize["42"] = 110;
	dishSize["43"] = 99;
	dishSize["44"] = 90;
	dishSize["45"] = 90;
	dishSize["46"] = 80;
	dishSize["47"] = 75;
	dishSize["48"] = 60;
	dishSize["49"] = 60;
	dishSize["50"] = 60;
	dishSize["51"] = 55;
	dishSize["52"] = 50;
	dishSize["53"] = 50;
	dishSize["54"] = 45;
	dishSize["55"] = 40;
	dishSize["56"] = 38;
	dishSize["57"] = 36;
	dishSize["58"] = 34;
	dishSize["59"] = 32;
	dishSize["60"] = 30;
	dishSize["61"] = 28;
	dishSize["62"] = 26;
	dishSize["63"] = 24;
	dishSize["64"] = 22;

	const removeLayer = (layer) => {
		if (map.getLayer(layer)){
			map.removeLayer(layer)
		}
		if (map.getSource(layer)){
			map.removeSource(layer);
		}
	}

	// Satellite List Clicked
	$('.satnav_sat-row li').on('click', function() {
		addMapLayerOnClick(this)
	});

	const addMapLayerOnClick = (clickedNav) => {
		if (clickedNav.classList.contains("off")){
			addMapLayerOnClickDone(clickedNav.id)
			clickedNav.classList.remove("off")
		
		}else{
			removeLayer(clickedNav.id)
			clickedNav.classList.add("off")	
		}
	}

	const addMapLayerOnClickDone = (id) => {
		satelliteGeojson.forEach(sat => {
			if(sat.id === id){
				if (!map.getLayer(sat.id)){
					addMapLayer(sat.geoJson, sat.id, sat.bounds, sat.fillColor);
				}
			}
		})
	}

	//*A* define Sats Layers variables

	const addMapLayer = (satGeo, satId, bounds, fillColor) => {
		let fillOpacity = 0.2
		// Reduce Opacity for Galaxy 18 Satellite only
		if(satId === "Galaxy_18") fillOpacity = 0.1
		map.addSource(satId, {
	            'type': 'geojson',
	            'data': {
	                'type': 'FeatureCollection',
	                'features': satGeo
	            }
	    });
		map.addLayer({
	            'id': satId,
	            'type': 'fill',
	            'source': satId,
	            'paint': {
	                'fill-color': fillColor,
	                'fill-opacity': fillOpacity,
					'fill-outline-color': "black"
	            }, 
	    });
	    //map.flyTo({ center: [-70.66406250000117, 2.108898659243451] });
	    map.fitBounds(bounds);
		//map.fitBounds(fitToMapBounds)
	}
									   

	// Satellite Load Function
	 map.on('load', function() {
	     map.addControl(new mapboxgl.NavigationControl({showZoom: true, showCompass: false}));
		 satelliteGeojson.forEach(sat => {
			addMapLayer(sat.geoJson, sat.id, sat.bounds, sat.fillColor);
		})
		map.fitBounds(fitToMapBounds)
	 })

	
	//Repeatedly add (or subtract) 360 to longitude value until it's in the range of (-180 => 180).
	const normalizeLongitude = (lng) => {
		while(lng < -180){
			lng +=360;
		}
		while (lng > 180){
			lng -= 360;
		}
		return lng
	}
	
	   
	//*A* Map clicking
	map.on('click', function(e) {

		let lat = e.lngLat.lat
		let lng = e.lngLat.lng

		lng = normalizeLongitude(lng)
	    
	    search_coords = [lat, lng];
	    marker.setLngLat(e.lngLat).addTo(map);
	    PopUpCoord = "<b>Lat, Lng:</b><span> (" + e.lngLat.lat + ", "+e.lngLat.lng+ ")</span><br>"
		PopUpAddress = ""

		reverseGeocode(e.lngLat.lng.toString() + ", " + e.lngLat.lat.toString());
		
	});


	//*A* reverse geocoding - get address by coordinates
	function reverseGeocode(reverse_coords){
	    var geocodeRequest = 'https://api.mapbox.com/geocoding/v5/mapbox.places/' + reverse_coords + '.json?limit=1&access_token=' + mapboxgl.accessToken;
	    $.ajax({
	        method: 'GET',
	        url: geocodeRequest,
	    }).done(function(data) {
	        if(data.features.length>0) {
	            PopUpAddress = `<div class="coord-address">
									<p>Address: <span>${data.features[0].place_name}</span></p>
								</div>
								`
	        }
	    }).always(function(){
			findPointInAllSatellites()
	    });
	    
	}


	//*A* check on how many layers the marker & select the max EIRP level
	function showPopup(satelliteFound){
	    PopUpInfo = "";
		if(satelliteFound.length > 0) {

				// Turn off all Satellite so that we can Activate the SatelliteFounds
				satelliteGeojson.forEach(sat => {
					removeLayer(sat.id)
				})
				// Turn off all Satellite nav so that we can Active the SatelliteFounds
				document.querySelectorAll(".satnav_sat-row li").forEach(navItem => {
					navItem.classList.add('off')
				})

				PopUpInfo = `<div class="popup-address">${PopUpAddress} ${PopUpCoord}</div>`
				//Add satellifound to popup
				satelliteFound.map(satfound => {
					// EIRP Level Calculation (Not Correct, Working on a Fix)
					var max_eirp_level = Math.max.apply(Math, satfound.satEIRPlevels);
					let satMetrics = calcMetrics(search_coords[0], search_coords[1], satfound.satelliteValue)
					
					// Turn on SatelliteFounds
					satelliteGeojson.forEach(sat => {
						if (satfound.satelliteName === sat.name){
							if (!map.getLayer(sat.id)){
								addMapLayer(sat.geoJson, sat.id, sat.bounds, sat.fillColor);
							}
							//Activate satellite nav Found
							document.getElementById(sat.id).classList.remove('off')
						}
					})
					let flatPanelAntenna = `<p style="color:green;">Flat-Panel Antenna: <span>Supported <i class="far fa-check"></i></span></p>`
					if (!satfound.satelliteFlatPanelAntenna){
						flatPanelAntenna = `<p style="color:red;">Flat-Panel Antenna: <span>Not Supported</span></p>`
					}
					PopUpInfo += `
								<div class="sat-details">
									<div class="sat-name">
										<div style="color:${satfound.satelliteColor};">
											${satfound.satelliteName}
										</div>
											${flatPanelAntenna}
									</div>
									<div class="sat-reception">
										<h4>Reception details</h4>
										<p>Elevation: <span class="dp-ele">${satMetrics.satEle}</span><p>
										<p>Azimuth: <span class="dp-azt">${satMetrics.satAzt}</span><p>
										<p>Polarity: <span class="dp-pol">${satMetrics.satPol}</span><p>
	                                </div>
								</div>
								`
	            })
	           
			} else {
				PopUpInfo = `
	                        <div class="popup-address">${PopUpAddress} ${PopUpCoord}</div>
	                        <div class="sat-reception">
								<h4>Reception details</h4>
								<p class='warn-msg-bold'>NOT COVERED</p>
	                            <span class='warn-msg'>Try a different Address or Enter Latitude Longitude for more accuracy</span>
	                        </div>
						`
	           
			}
			
			var mq = window.matchMedia( "(max-width: 500px)" );
			if (mq.matches) {
				// window width is at less than 500px
				showMobilePopup(`<div id="popupContent">${PopUpInfo}</div>`)
			}
			else {
				// window width is greater than 500px
				popup.setHTML(`<div id="popupContent">${PopUpInfo}</div>`)
				marker.setPopup(popup).togglePopup();
				// center map to searched Address/coordinates
				map.flyTo({ center: [search_coords[1], search_coords[0]], zoom: 2 });
				// Adjust "popup width" if we found more than One satellite.
				if (satelliteFound.length > 1){
					document.querySelector('.mapboxgl-popup').style.width = "45%"
				}
			}
			
	}


	//*A* check if pin/marker on layer 
	function checkWhithinLayer(layer) {
	        var coords = layer.geometry.coordinates;
	    
	        for(i = 0; i < coords.length; i++) {
	            if(isMarkerInsidePolygon([search_coords[1],search_coords[0]], coords[i])) {
	                EIRPlevels.push(parseInt(layer.properties.Name));
	            }
	        }       
	}


	// Determine if a point reside inside a leaflet polygon
	function isMarkerInsidePolygon(markercoord, polycoords) {
	    var inside = false;
	    var x = markercoord[1], y = markercoord[0];
	        for (var i = 0, j = polycoords.length - 1; i < polycoords.length; j = i++) {
	                var xi = polycoords[i][1], yi = polycoords[i][0];
	                var xj = polycoords[j][1], yj = polycoords[j][0];
	            
	            var intersect = ((yi > y) != (yj > y))
	                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
	            if (intersect) inside = !inside;
	        }

	    return inside;
	};



	//*A* cm into inches converter
	function cm_to_inch(valNum) {
	    return Math.round(valNum*0.39370 *10)/10;
	}

	function calcMetrics(lat, long, satValue) {
	    var azt, pol;
		var sat_long = satValue
	    var angle = -1 * sat_long;

	    azt = 180 + 57.29578 * Math.atan(Math.tan((long - angle) / 57.29578) / Math.sin(lat / 57.29578));
	    azt = (lat < 0) ? azt - 180 : azt;
	    azt = (azt < 0) ? azt + 360.0 : azt;
	    azt = Math.round(azt * 100) / 100;

	    delta = (long - angle) / 57.29578;
	    latr = lat / 57.29578;
	    r = 1 + 35786 / 6378.16;
	    i1 = r * Math.cos(latr) * Math.cos(delta) - 1;
	    i2 = r * Math.sqrt(1 - Math.cos(latr) * Math.cos(latr) * Math.cos(delta) * Math.cos(delta));
	    ele = 57.29578 * Math.atan(i1 / i2);
	    ele = Math.round(ele * 100) / 100;

	    delta = (angle - long) / 57.29578;
	    s = -57.29578 * Math.atan((Math.sin(delta)) / Math.tan(lat / 57.29578));
	    pol = Math.round(s * 100) / 100;

		let metricObj = {satPol: pol, satEle: ele, satAzt: azt}
		return metricObj
	}

	const showMobilePopup = (popupinfo) => {
		$('.mobilePopup').fadeIn()
		document.getElementById('close').addEventListener('click', function(){
			$('.mobilePopup').fadeOut()
		})
		document.getElementById('mobilePopupContent').innerHTML = popupinfo
	}
}

setTimeout(() => {load_map()}, 1000);
