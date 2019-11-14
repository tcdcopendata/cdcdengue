// cityJSONData, townJSONData and villageJSONData are json objects
var cityJSONData = null;
var townJSONData = null;
var villageJSONData = null;
var village_pointJSONData = null;

// layers
var citylayer = null;
var townlayer = null;
var villagelayer = null;
var village_pointlayer = null;
var dangerVillagelayer=null;
var datatimestamp = new Date();
datatimestamp = datatimestamp.getFullYear().toString() + datatimestamp.getMonth().toString() + datatimestamp.getDate().toString() + datatimestamp.getHours().toString();


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
	//fillColor: "#0066FF",
	fillColor: "#0066FF",
	weight: 1.5,
	opacity: 1,
	fillOpacity: 0.2
};
// village layer
var DangerStyle = {
	//fillColor: "#DC143C",
	fillColor: "red",
	color: "#262626",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.3
};

var WarningStyle = {
	fillColor: "#ff8400",
	//fillColor: "#ff4000",
	//fillColor: "orange",
	color: "#262626",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.3
};
var SafeStyle = {
	fillColor: "#ebcf00",
	//fillColor: "yellow",
	color: "#262626",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.3
};
var NoneStyle = {
	fillColor: "#a6a6a6",
	color: "#262626",
	weight: 1,
	opacity: 1,
	fillOpacity: 0.3
};
function getRandom(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
};
function showDangerVillageLayer(chosenVillage,chosenTown) {
	if (villageJSONData == null) { return; }
	removeDangerVillaageLayer();
	dangerVillagelayer = L.geoJson(villageJSONData, {
		style: DangerStyle,
		filter: function (feature, layer) {
			if (feature.properties) {
				if (feature.properties.VILLAGE == chosenVillage&&feature.properties.TOWN==chosenTown) {
					return true;
				}
			}
			return false;
		},
		onEachFeature: function (feature, layer) {
			layer.on({
				mouseover: villhighlightFeature,
				mouseout: villresetHighlight,
				 click: openPopup(feature, layer)
			});
		}


	})
	dangerVillagelayer.addTo(map);
	map.fitBounds(dangerVillagelayer.getBounds());
	//.setZoom(13);
	$("#statistic_table").modal('hide');
	dangerVillagelayer.eachLayer(function(layer){
		layer.openPopup()})
}
function removeDangerVillaageLayer(){
	if(dangerVillagelayer!=null){
		map.removeLayer(dangerVillagelayer);
	}
}

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
	layer.setStyle({ // highlight the feature
		//color: "orange",
		color: "#0066FF",
		weight: 1,
		opacity: 0.7,
		//fillOpacity: 0.7
		fillOpacity: 0.2
	})

	// layer.setStyle(defaultstyle);
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
//var properties={"weeks":[{"dS":"7/7/2019","dE":"7/13/2019","m_level":null,"b_pos":null,"g_pos":null,"color":"gray"},{"dS":"6/30/2019","dE":"7/6/2019","m_level":null,"b_pos":null,"g_pos":null,"color":"gray"},{"dS":"6/23/2019","dE":"6/29/2019","m_level":null,"b_pos":null,"g_pos":null,"color":"gray"},{"dS":"6/16/2019","dE":"6/22/2019","m_level":null,"b_pos":null,"g_pos":null,"color":"gray"},{"dS":"6/9/2019","dE":"6/15/2019","m_level":null,"b_pos":null,"g_pos":null,"color":"gray"}]}
//氣泡排序法
var swap = function (data, i, j) {
	var tmp = data[i];
	data[i] = data[j];
	data[j] = tmp;
};

var bubbleSort = function (data) {
	var flag = true;
	for (var i = 0; i < data.length - 1 && flag; i++) {
		flag = false;
		for (var j = 0; j < data.length - i - 1; j++) {
			if (new Date(data[j + 1].dS) < new Date(data[j].dS)) {
				swap(data, j + 1, j);
				flag = true;
			}
		}
	}
};

var buildTR = function (weeks) {
	var html_tag = "";
	if (!window.mobilecheck()) {
		for (var i = 0; i < weeks.length; i++) {
			var style;
			switch (weeks[i].color) {
				case "red":
					style = 'style="background-color:rgba(255,0,0,0.3);"'
					break
				case "orange":
					style = 'style="background-color:rgba(255, 132, 0,0.3)"'
					break
				case "yellow":
					style = 'style="background-color:rgba(235, 207, 0,0.3)"'
					break
				case "gray":
					style = 'style="background-color:rgba(128,128,128,0.3)"'
					break
			}
			if (weeks[i].m_level == null) {
				weeks[i].m_level = "-";
			}
			if (weeks[i].b_pos == null) {
				weeks[i].b_pos = "-";
			} else if (weeks[i].b_pos != "-") {
				weeks[i].b_pos = parseInt(weeks[i].b_pos) + "%";
			}

			if (weeks[i].g_pos == null) {
				weeks[i].g_pos = "-";
			} else if (weeks[i].g_pos != "-") {
				weeks[i].g_pos = parseInt(weeks[i].g_pos).toFixed(1) + "%";
			}

			html_tag = html_tag +
				'<tr ' + style + '>' +
				'<td style="text-align: center;">' + new Date(weeks[i].dS).getWeek() + '週(前' + (5 - i) + '週)' + '</td>' +
				'<td style="text-align: center;">' + weeks[i].m_level + '</td>' +
				'<td style="text-align: right;">' + weeks[i].b_pos + '</td>' +
				'<td style="text-align: right;">' + weeks[i].g_pos + '</td>' +
				'</tr>';


		}
	} else {
		for (var i = 0; i < weeks.length; i++) {
			var style;
			switch (weeks[i].color) {
				case "red":
					style = 'style="background-color:rgba(255,0,0,0.3);"'
					break
				case "orange":
					style = 'style="background-color:rgba(255, 132, 0,0.3)"'
					break
				case "yellow":
					style = 'style="background-color:rgba(235, 207, 0,0.3)"'
					break
				case "gray":
					style = 'style="background-color:rgba(128,128,128,0.3)"'
					break
			}
			if (weeks[i].m_level == null) {
				weeks[i].m_level = "-";
			}
			if (weeks[i].b_pos == null) {
				weeks[i].b_pos = "-";
			} else if (weeks[i].b_pos != "-") {
				weeks[i].b_pos = parseInt(weeks[i].b_pos) + "%";
			}

			if (weeks[i].g_pos == null) {
				weeks[i].g_pos = "-";
			} else if (weeks[i].g_pos != "-") {
				weeks[i].g_pos = parseInt(weeks[i].g_pos).toFixed(1) + "%";
			}

			html_tag = html_tag +
				'<tr ' + style + '>' +
				'<td>' + new Date(weeks[i].dS).getWeek() + '週' + '</td>' +
				'<td>' + weeks[i].m_level + '</td>' +
				'<td>' + weeks[i].b_pos + '</td>' +
				'<td>' + weeks[i].g_pos + '</td>' +
				'</tr>';


		}
	}

	return html_tag
}

window.mobilecheck = function () {
	var check = false;
	(function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
	return check;
};

// getweek
Date.prototype.getWeek = function (dowOffset) {
	/*getWeek() was developed by Nick Baicoianu at MeanFreePath: http://www.meanfreepath.com */

	dowOffset = typeof (dowOffset) == 'int' ? dowOffset : 0; //default dowOffset to zero
	var newYear = new Date(this.getFullYear(), 0, 1);
	var day = newYear.getDay() - dowOffset; //the day of week the year begins on
	day = (day >= 0 ? day : day + 7);
	var daynum = Math.floor((this.getTime() - newYear.getTime() -
		(this.getTimezoneOffset() - newYear.getTimezoneOffset()) * 60000) / 86400000) + 1;
	var weeknum;
	//if the year starts before the middle of a week
	if (day < 4) {
		weeknum = Math.floor((daynum + day - 1) / 7) + 1;
		if (weeknum > 52) {
			nYear = new Date(this.getFullYear() + 1, 0, 1);
			nday = nYear.getDay() - dowOffset;
			nday = nday >= 0 ? nday : nday + 7;
			/*if the next year starts before the middle of
			  the week, it is week #1 of that year*/
			weeknum = nday < 4 ? 1 : 53;
		}
	}
	else {
		weeknum = Math.floor((daynum + day - 1) / 7);
	}
	return weeknum;
};

// village layer
function showVillageLayer() {

	if (villageJSONData == null) { return; }

	var tgtBtn = $('.villagelayer').find('i');
	if (tgtBtn.hasClass('btn-off')) {
		tgtBtn.removeClass('btn-off');

		villagelayer = L.geoJson(villageJSONData, {
			style: function (feature) {
				if (feature.properties.background_color == "yellow") {
					return SafeStyle;
				} else if (feature.properties.background_color == "red") {
					return DangerStyle;
				} else if (feature.properties.background_color == "orange") {
					return WarningStyle;
				} else {
					return NoneStyle;
				}

			},
			filter: function (feature, layer) {
				if (feature.properties) {
					if (feature.properties.COUNTY == selcity) {
						return true;
					}
					//else if (selcity == "台南市、高雄市與屏東縣" && (feature.properties.COUNTY == "台南市" || feature.properties.COUNTY == "高雄市" || feature.properties.COUNTY == "屏東縣")) {
					//    return true;
					//} else if (selcity == "台北市、新北市" && (feature.properties.COUNTY == "台北市" || feature.properties.COUNTY == "新北市")) {
					//    return true;
					//} else if (selcity == "全國") {
					//    return true;
					//}
				}
				return false;
			},
			onEachFeature: function (feature, layer) {
				layer.on({
					mouseover: villhighlightFeature,
					mouseout: villresetHighlight,
					click: openPopup(feature, layer)
				});
			}

		});

		villagelayer.addTo(map);
		//village_pointlayer.addTo(map);

	} else {
		map.removeLayer(villagelayer);
		//map.removeLayer(village_pointlayer);
		tgtBtn.addClass('btn-off');
	}
}


function setPolygonColor() {
	mapLayerGroups = [];

	for (var i = 0; i < 5; i++) {
		var village_timemap_layer = L.geoJson(villageJSONData, {
			style: function (feature) {
				if (feature.properties.weeks[i].color == "yellow") {
					return SafeStyle;
				} else if (feature.properties.weeks[i].color == "red") {
					return DangerStyle;
				} else if (feature.properties.weeks[i].color == "orange") {
					return WarningStyle;
				} else {
					return NoneStyle;
				}

			},
			filter: function (feature, layer) {
				if (feature.properties) {
					if (feature.properties.COUNTY == selcity) {
						//openPopup(feature,layer);
						bubbleSort(feature.properties.weeks);
						return true;
					}
				}
				return false;
			},

			onEachFeature: function (feature, layer) {
				layer.on({
					mouseover: villhighlightFeature,
					mouseout: villresetHighlight,
					//click:openPopup(feature,layer)
					click: popupWithoutBubbleSort(feature, layer)
				});
			}

		})
		mapLayerGroups.push(village_timemap_layer);

	}

}
function popupWithoutBubbleSort(feature, layer) {
	layer.bindPopup(
		'<h3>' + feature.properties.TOWN + feature.properties.VILLAGE + '</h3>' +
		'<table class="ui basic unstackable table">' +
		'<thead>' +
		'<tr>' +
		'<th>週別</th>' +
		'<th>布氏<br/>級數</th>' +
		'<th>誘卵桶<br/>指數</th>' +
		'<th>誘殺桶<br/>指數</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody>' + buildTR(feature.properties.weeks) + "</tbody>"
	);
}
function openPopup(feature, layer) {
	var weeks = feature.properties.weeks;
	bubbleSort(weeks);
	//changeNull(weeks);


	layer.bindPopup(
		'<h3>' + feature.properties.TOWN + feature.properties.VILLAGE + '</h3>' +
		'<table class="ui basic unstackable table">' +
		'<thead>' +
		'<tr>' +
		'<th>週別</th>' +
		'<th>布氏<br/>級數</th>' +
		'<th>誘卵桶<br/>指數</th>' +
		'<th>誘殺桶<br/>指數</th>' +
		'</tr>' +
		'</thead>' +
		'<tbody>' + buildTR(weeks) + "</tbody>"
		, { minWidth: 190, maxHeight: 400 });

}


function villhighlightFeature(e) {
	var layer = e.target;
	layer.setStyle({ // highlight the feature
		//color: "orange",
		weight: 1.5,
		opacity: 1,
		fillOpacity: 0.6
		//fillOpacity: 0.2
	});
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = (layer.feature.properties.TOWN + layer.feature.properties.VILLAGE);
}

function villresetHighlight(e) {
	var layer = e.target;
	layer.setStyle({ // highlight the feature
		//color: "orange",
		weight: 1,
		opacity: 1,
		//fillOpacity: 0.7
		fillOpacity: 0.3
	}


	);
	if (!L.Browser.ie && !L.Browser.opera) {
		layer.bringToFront();
	}
	document.getElementById('locval').innerHTML = "";
}

function showVillageBtnAvailable() {
	var tgtBtn = $('.villagelayer').find('i');

	if (tgtBtn.hasClass('fa-spinner') && villageJSONData != null) {
		// show the button is available
		tgtBtn.removeClass('fa-spinner');
		tgtBtn.removeClass('fa-spin');
		tgtBtn.addClass('fa-exclamation-triangle');
		tgtBtn.addClass('btn-off');
	}
}
function addLocBtns() {
	// add 1 buttons to the map
	var crtPosLoc = L.control({ position: 'topleft' });
	crtPosLoc.onAdd = function (map) {
		var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
		div.style.backgroundColor = 'white';
		var control_htm = '<a class="leaflet-control-zoom-in villagelayer" '
			+ 'id="villagebutton" href="#map" title="風險警示區" role="button" onclick="showVillageLayer();">'
			+ '<i class="fa fa-spinner fa-spin small-btn" aria-hidden="true"></i></a>';
		div.innerHTML = control_htm;
		div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		L.DomEvent.disableClickPropagation(div);
		return div;
	};
	crtPosLoc.addTo(map);
	setNav();
	if (villageJSONData != null) {
		showVillageBtnAvailable();
		showVillageLayer();
		setTimeMapBtnAvailable();
		//set polygon color
		setPolygonColor();
	}
}

function setTimeMapBtnAvailable() {

	$('#pause_btn').removeClass("disabled");
	$('#play_btn').removeClass("disabled");
	$('#Week_select').removeClass("disabled");
	$('#city_select').removeClass("disabled");
}

// main entry
$(function () {

	// web worker
	if (window.Worker) {
		var cityworker = new Worker('resource/__workers/1.0/city_full.js');
		var citytownworker = new Worker('resource/__workers/1.0/cityTown_full.js');
		var villageworker = new Worker('resource/__workers/1.0/village_full.js');
		var village_point_worker = new Worker('resource/__workers/1.0/village_point_full.js');
		cityworker.postMessage([]);
		citytownworker.postMessage([]);
		villageworker.postMessage([]);
		village_point_worker.postMessage([]);

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
			showVillageLayer();
			setTimeMapBtnAvailable();
			setPolygonColor();

		}
		// village_point_worker.onmessage = function (e) {
		// 	village_pointJSONData = JSON.parse(e.data);
		// }
	} else {

		// fetch each data
		var city_file = "data/geojson/city_ori.json";
		var town_file = "data/geojson/citytown_full_comp.json"
		//var village_file = "data/geojson/village_full_comp.json";
		//var village_point_file = "data/geojson/village_ori_point.json";
		var village_file = 'https://zone.cdc.gov.tw/map/geojson/cdcdengueVillage.json?timestamp=' + datatimestamp;
		//var village_file = 'https://zone.cdc.gov.tw/map/geojson/cdcdengueVillage.json_test?timestamp=' + datatimestamp;

		//var village_point_file = "https://zone.cdc.gov.tw/map/geojson/cdcdengueVillagePoint.json?timestamp=" + datatimestamp;
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
				//var uncompdata = JSON.parse(LZString.decompressFromUTF16(data));
				showVillageLayer(data);
				setTimeMapBtnAvailable();
				setPolygonColor();

			}
		});
		// $.ajax({
		// 	url: village_point_file,
		// 	type: 'get',
		// 	data: {},
		// 	dataType: 'json',
		// 	beforeSend: function () {
		// 		//console.log("start to load village data");
		// 	},
		// 	error: function (xhr, ajaxOptions, thrownError) {
		// 		console.log("Error: Can't fetch a village point file.");
		// 	},
		// 	success: function (data) {
		// 		//var uncompdata = JSON.parse(LZString.decompressFromUTF16(data));
		// 		village_pointJSONData = data;

		// 	}
		// });
	}
})

// ------------------------------------------------------


