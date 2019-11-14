// cityJSONData, townJSONData and villageJSONData are json objects
var cityJSONData = null;
var townJSONData = null;
var villageJSONData = null;

// layers
var citylayer = null;
var townlayer = null;
var villagelayer = null;

// city layer
function showCityLayer() {
	if (cityJSONData == null) { return; }

	var tgtBtn = $('.citylayer').find('i');
	if (tgtBtn.hasClass('btn-off')) {
		tgtBtn.removeClass('btn-off');

		citylayer = L.geoJson(cityJSONData, {
			style: function (feature) {
				return {
					color: "#0066FF",
					weight: 1.5,
					opacity: 1,
					fillOpacity: 0
				};
			},
			filter: function (feature, layer) {
				if (feature.properties) {
					if (feature.properties.COUNTY == selcity) {
						return true;
					} else if (selcity == "台南市、高雄市與屏東縣" && (feature.properties.COUNTY == "台南市" || feature.properties.COUNTY == "高雄市" || feature.properties.COUNTY == "屏東縣")) {
						return true;
					} else if (selcity == "台北市、新北市" && (feature.properties.COUNTY == "台北市" || feature.properties.COUNTY == "新北市")) {
						return true;
					} else if (selcity == "全國") {
						return true;
					}
				}
				return false;
			}
		});
		citylayer.addTo(map);
	} else {
		map.removeLayer(citylayer);
		tgtBtn.addClass('btn-off');
	}
}

function showCityBtnAvailable() {
	var tgtBtn = $('.citylayer').find('i');

	if (tgtBtn.hasClass('fa-spinner') && cityJSONData != null) {
		// show the button is available
		tgtBtn.removeClass('fa-spinner');
		tgtBtn.removeClass('fa-spin');
		tgtBtn.addClass('fa-cog');
		tgtBtn.addClass('btn-off');
	}
}

// town layer
var defaultstyle = {
	color: "#0066FF",
	weight: 1.5,
	opacity: 1,
	fillOpacity: 0.2
};

function showCityTownLayer() {
	if (townJSONData == null) { return; }

	var tgtBtn = $('.townlayer').find('i');
	if (tgtBtn.hasClass('btn-off')) {
		tgtBtn.removeClass('btn-off');

		townlayer = L.geoJson(townJSONData, {
			style: function (feature) {
				return defaultstyle;
			},
			filter: function (feature, layer) {
				if (feature.properties) {
					if (feature.properties.COUNTYNAME == selcity) {
						return true;
					} else if (selcity == "台南市、高雄市與屏東縣" && (feature.properties.COUNTYNAME == "台南市" || feature.properties.COUNTYNAME == "高雄市" || feature.properties.COUNTYNAME == "屏東縣")) {
						return true;
					} else if (selcity == "台北市、新北市" && (feature.properties.COUNTYNAME == "台北市" || feature.properties.COUNTYNAME == "新北市")) {
						return true;
					} else if (selcity == "全國") {
						return true;
					}
				}
				return false;
			},
			onEachFeature: function (feature, layer) {
				layer.on({
					mouseover: townhighlightFeature,
					mouseout: townvillresetHighlight,
				});
			}
		});
		townlayer.addTo(map);

	} else {
		map.removeLayer(townlayer);
		tgtBtn.addClass('btn-off');
	}
}

function townhighlightFeature(e) {
	var layer = e.target;
	layer.setStyle({ // highlight the feature
		color: "orange",
		weight: 3,
		opacity: 1,
		fillOpacity: 0.2
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = (layer.feature.properties.TOWNNAME);
}

function townvillresetHighlight(e) {
	var layer = e.target;
	layer.setStyle(defaultstyle);
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = "";
}

function showTownBtnAvailable() {
	var tgtBtn = $('.townlayer').find('i');

	if (tgtBtn.hasClass('fa-spinner') && cityJSONData != null) {
		// show the button is available
		tgtBtn.removeClass('fa-spinner');
		tgtBtn.removeClass('fa-spin');
		tgtBtn.addClass('fa-cogs');
		tgtBtn.addClass('btn-off');
	}
}


// village layer
function showVillageLayer() {

	if (villageJSONData == null) { return; }

	var tgtBtn = $('.villagelayer').find('i');
	if (tgtBtn.hasClass('btn-off')) {
		tgtBtn.removeClass('btn-off');

		villagelayer = L.geoJson(villageJSONData, {
			style: function (feature) {
				return defaultstyle;
			},
			filter: function (feature, layer) {
				if (feature.properties) {
					if (feature.properties.COUNTY == selcity) {
						return true;
					} else if (selcity == "台南市、高雄市與屏東縣" && (feature.properties.COUNTY == "台南市" || feature.properties.COUNTY == "高雄市" || feature.properties.COUNTY == "屏東縣")) {
						return true;
					} else if (selcity == "台北市、新北市" && (feature.properties.COUNTY == "台北市" || feature.properties.COUNTY == "新北市")) {
						return true;
					} else if (selcity == "全國") {
						return true;
					}
				}
				return false;
			},
			onEachFeature: function (feature, layer) {
				layer.on({
					mouseover: villhighlightFeature,
					mouseout: villresetHighlight,
				});
			}

		});
		villagelayer.addTo(map);

	} else {
		map.removeLayer(villagelayer);
		tgtBtn.addClass('btn-off');
	}
}

function villhighlightFeature(e) {
	var layer = e.target;
	layer.setStyle({ // highlight the feature
		color: "orange",
		weight: 3,
		opacity: 1,
		fillOpacity: 0.2
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = (layer.feature.properties.TOWN + layer.feature.properties.VILLAGE);
}

function villresetHighlight(e) {
	var layer = e.target;
	layer.setStyle(defaultstyle);
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = "";
}

function showVillageBtnAvailable() {
	var tgtBtn = $('.villagelayer').find('i');

	if (tgtBtn.hasClass('fa-spinner') && cityJSONData != null) {
		// show the button is available
		tgtBtn.removeClass('fa-spinner');
		tgtBtn.removeClass('fa-spin');
		tgtBtn.addClass('fa-crop');
		tgtBtn.addClass('btn-off');
	}
}


function addLocBtns() {
	// add 3 buttons to the map
	var crtPosLoc = L.control({ position: 'topleft' });
	crtPosLoc.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
		div.style.backgroundColor = 'white';
		// city
		var control_htm = '<a class="leaflet-control-zoom-in citylayer" href="#map" title="縣市" role="button" onclick="showCityLayer();">'
			+ '<i class="fa fa-spinner fa-spin small-btn" aria-hidden="true"></i></a>';
		// town
		control_htm += '<a class="leaflet-control-zoom-in townlayer" href="#map" title="鄉鎮" role="button" onclick="showCityTownLayer();">'
			+ '<i class="fa fa-spinner fa-spin small-btn" aria-hidden="true"></i></a>';
		// village
		control_htm += '<a class="leaflet-control-zoom-in villagelayer" href="#map" title="村里" role="button" onclick="showVillageLayer();">'
			+ '<i class="fa fa-spinner fa-spin small-btn" aria-hidden="true"></i></a>';
		div.innerHTML = control_htm;
		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		L.DomEvent.disableClickPropagation(div);
		return div;
	};
	crtPosLoc.addTo(map);

	if (cityJSONData != null) {
		showCityBtnAvailable();
	}

	if (townJSONData != null) {
		showTownBtnAvailable();
	}

	if (villageJSONData != null) {
		showVillageBtnAvailable();
	}
}



// main entry
$(function () {    

	// web worker
	if (window.Worker) {
		var cityworker = new Worker('resource/__workers/1.0/city_full.js');
		var citytownworker = new Worker('resource/__workers/1.0/cityTown_full.js');
		var villageworker = new Worker('resource/__workers/1.0/village_full_comp.js');

		cityworker.postMessage([]);
		citytownworker.postMessage([]);
		villageworker.postMessage([]);

		cityworker.onmessage = function (e) {
			cityJSONData = JSON.parse(e.data);
			showCityBtnAvailable();
		}

		citytownworker.onmessage = function (e) {
			townJSONData = JSON.parse(e.data);
			showTownBtnAvailable();
		}

		villageworker.onmessage = function (e) {
			villageJSONData = JSON.parse(e.data);
			showVillageBtnAvailable();
		}
	} else {
		// fetch each data
		var city_file = "data/geojson/city_ori.json";
		var town_file = "data/geojson/citytown_full_comp.json"
		var village_file = "data/geojson/village_full_comp.json";

		$.ajax({
			url: city_file,
			type: 'get',
			data: {},
			dataType: "json",
			beforeSend: function () {
				//console.log("start to load city data");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("Error: Can't fetch a city file.");
			},
			success: function (data) {
				//console.log("load city data complete");
				showCityLayer(data);
			}
		});

		$.ajax({
			url: town_file,
			type: 'get',
			data: {},
			dataType: 'text',
			beforeSend: function () {
				//console.log("start to load town data");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("Error: Can't fetch a town file.");
			},
			success: function (data) {
				var uncompdata = JSON.parse(LZString.decompressFromUTF16(data));
				showCityTownLayer(uncompdata);
			}
		});

		$.ajax({
			url: village_file,
			type: 'get',
			data: {},
			dataType: 'text',
			beforeSend: function () {
				//console.log("start to load village data");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("Error: Can't fetch a village file.");
			},
			success: function (data) {
				var uncompdata = JSON.parse(LZString.decompressFromUTF16(data));
				showVillageLayer(uncompdata);
			}
		});
	}
})

// ------------------------------------------------------


