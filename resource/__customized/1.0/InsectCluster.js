var map;
var geojson;
var village_point_geojson;
//var danger_point_geojson={features:[]};
var time_update = "資料讀取中";
var statistic_period = "資料讀取中";
var mapLayerGroups = [];
//20190724 計算統計資料
var num_village={
	"台南市":649,"高雄市":891, "屏東縣":463,"台北市":456,"基隆市": 157,"新北市": 1032,
	"連江縣": 22,"宜蘭縣": 233,"新竹市": 122,"新竹縣": 192,"桃園市": 504,"苗栗縣":275,
	"台中市":625,"彰化縣": 589,"南投縣":262,"嘉義市": 84,"嘉義縣":357,"雲林縣": 391,
	"澎湖縣": 96,"金門縣": 37,"台東縣": 147,"花蓮縣": 176
};
var statistic_mosquito_color;
var danger_village;
var statistic_bucket_color;
var statistic_kill_bucket_color;
// 20160409 use dedicated worker to replace shared worker due to the support of IE
var enableWorker = 0;
var lastestClusterData = null;
var getLastestClusterworder = null;
var checkLayer = null;

// 20170502 default settings
var defaultCitycode = "07";
var defaultCityName = "高雄市";
var selcity = defaultCityName;
var Time_options = {
	year: "numeric",
	month: "2-digit",
	day: "2-digit"
};
var Time_options_data = {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	hour:"2-digit",
	minute:"2-digit",
	second:"2-digit"
};

if (window.Worker) {
	getLastestClusterworder = new Worker('resource/__workers/1.0/clusterLastestCode1.js');

	// desc : get all city information
	// 20161126 : set the default county is taipei city
	// 20170502 : set the default county to kaohsiung city
	//getLastestClusterworder.postMessage([defaultCitycode]);

	//getLastestClusterworder.onmessage = function (e) {
	//    lastestClusterData = e.data;
	//}

	enableWorker = 1;
}

// 20160511 add to control CODE1
var getGeoAreaData;
var saveCenterAreaInfo = {};

// default style for highlighting
var defaultstyle = {
	color: "#0066FF",
	weight: 1.5,
	opacity: 1,
	fillOpacity: 0.1
};

// 20160511 add set to new center
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



//ready
$(document).ready(function () {
	var lat_center, lon_center;
	var latlng;
	var zoomlev = 13;
	var data;
	var citycode;
	//20190724 將畫面移動至操作圖台上
	if (document.body.offsetWidth < 767) {
		window.scrollTo({
			top: parseInt($("#header").css("height")) - 59 + parseInt($("#mainNavBar").css("height")),
			behavior: "smooth"
		});
	}
	LoadMapData();

	////// set time map for village area color
	// set noUiSlider
	var dateSlider = document.getElementById('slider-date');
	//設定
	var settings = {
		animate: true,

		range: {
			min: 0,
			max: 5
		},
		behaviour: 'tap',
		connect: 'lower',
		step: 1,
		start: 5,
		tooltips: [true],
		format: wNumb({
			decimals: 0
		})
	};
	noUiSlider.create(dateSlider, settings);
	var isPaused = true; //預設不會自動跑
	var platstep = 0; //slider的時間

	$('#play_btn').on('click', function (e) {
		var tgtBtn = $('.villagelayer').find('i');
		if (!tgtBtn.hasClass('btn-off')) {
			showVillageLayer()
		}

		//speed = 1 / $("#rate_select :selected").val();
		e.preventDefault();
		isPaused = false;
		$(this).removeClass("red");
		$(this).addClass("disabled");
		$('#pause_btn').removeClass("disabled");
		$('#pause_btn').addClass("red");
	});

	$('#pause_btn').on('click', function (e) {
		var tgtBtn = $('.villagelayer').find('i');
		e.preventDefault();
		isPaused = true;
		$(this).removeClass("red");
		$(this).addClass("disabled");
		$('#play_btn').removeClass("disabled");
		$('#play_btn').addClass("red");
	});

	function setIntervalvalue() {
		dateSlider.noUiSlider.on('update', function (values, handle) {
			if (document.getElementById('datestep') != undefined) {
				if (dateSlider.noUiSlider.get() == 0) {
					document.getElementById('datestep').innerHTML = "<p>重複播放</p>";
				} else {
					document.getElementById('datestep').innerHTML = "<p>前" + (6 - parseInt(dateSlider.noUiSlider.get())) + "週";
				}
				//alert(new Date(+values[handle]) + " --- " + +values[handle]);
			}
		});

		//拖拉的時候讓播放暫停及變換按鈕
		dateSlider.noUiSlider.on('slide', function () {
			isPaused = true;
			$('#pause_btn').removeClass("red");
			$('#pause_btn').addClass("disabled");
			$('#play_btn').removeClass("disabled");
			$('#play_btn').addClass("red");
		});

		//改變slider的值完成後，設定value
		dateSlider.noUiSlider.on('change', function () {
			var tgtBtn = $('.villagelayer').find('i');
			if (!tgtBtn.hasClass('btn-off')) {
				showVillageLayer()
			}
			//platstep = calTimestamp(document.getElementById('datestep').innerHTML);
			platstep = dateSlider.noUiSlider.get();
			console.log(dateSlider.noUiSlider.get());
			dateSlider.noUiSlider.set(platstep);
			reloadpolygon();
			//reloadmarker();
		});
	}
	setIntervalvalue();

	function reloadpolygon() {
		var dateindex = (parseInt(dateSlider.noUiSlider.get()) - 1);
		for (i = 0; i < 5; i++) {
			map.removeLayer(mapLayerGroups[i])
		}


		map.addLayer(mapLayerGroups[dateindex]);
	}

	//播放設定
	var speed = 1; //預設為1倍速
	var rate = 24 * 60 * 60 * 1000;　//86400000毫秒
	var mapplay = setInterval(palyit, 2000); //毫秒
	function palyit() {
		if (!isPaused) { //不等於暫停
			platstep = parseInt(platstep) + 1;  //以一天為頻率
			if (!(platstep > 5)) {  //slider的時間還在範圍內  
				dateSlider.noUiSlider.set(platstep);
				if (dateSlider.noUiSlider.get() == 0) {
					document.getElementById('datestep').innerHTML = "<p>重複播放</p>";
				} else {
					document.getElementById('datestep').innerHTML = "<p>前" + (6 - parseInt(dateSlider.noUiSlider.get())) + "週";
				}
				var dateindex = (dateSlider.noUiSlider.get() - 1);
				if (dateindex != 0) {
					map.removeLayer(mapLayerGroups[dateindex - 1])
				}
				map.addLayer(mapLayerGroups[dateindex]);
				//設定脫離潛伏期病例的style
				//setmarkercolor(dateindex);
			} else {
				if ($("#loopcheck input")[0].checked) {  //有勾選迴圈的話回到開始時間
					platstep = 0;
					dateSlider.noUiSlider.set(platstep);
					//清除所有layer
					map.removeLayer(mapLayerGroups[4])
				}
			}
		}
	}
	//use selection to change layer
	$('#Week_select').on('change', function (e) {
		e.preventDefault();
		var tgtBtn = $('.villagelayer').find('i');
			if (!tgtBtn.hasClass('btn-off')) {
				showVillageLayer()
			}
		$("#pause_btn").click();
		var setting = $('#Week_select').val();
		platstep = setting;
		dateSlider.noUiSlider.set(parseInt(setting) + 1);
		if (dateSlider.noUiSlider.get() == 0) {
			document.getElementById('datestep').innerHTML = "<p>重複播放</p>";
		} else {
			document.getElementById('datestep').innerHTML = "<p>前" + (6 - parseInt(dateSlider.noUiSlider.get())) + "週";
		}
		//remove layer
		for (i = 0; i < mapLayerGroups.length; i++) {
			map.removeLayer(mapLayerGroups[i]);
		}
		map.addLayer(mapLayerGroups[parseInt(setting)]);
	})

    /*
     * desc : load the map data
     */
	function LoadMapData() {

		if ($("#city_select option:selected").val() != undefined && $("#city_select option:selected").val() != "00") {
			citycode = $("#city_select option:selected").val();
			selcity = $("#city_select option:selected").text();
		} else {
			// 20161126 : county selected in the beginning of the session
			// 20170502 : set the default county to kaohsiung city
			citycode = defaultCitycode;
			selcity = defaultCityName;
		}
		//設定縣市中心點
		var boundary = [
			{
				"cityname": "台北市",
				"center": "25.0556462,121.5492322",
				"map_level": 12
			},
			{
				"cityname": "新北市",
				"center": "25.0610099,121.492354",
				"map_level": 11
			},
			{
				"cityname": "台中市",
				"center": "24.1837584,120.6037066",
				"map_level": 11
			},
			{
				"cityname": "台南市",
				"center": "23.000065,120.211707",
				"map_level": 13
			},
			{
				"cityname": "高雄市",
				"center": "22.640458,120.314034",
				"map_level": 13
			},
			{
				"cityname": "屏東縣",
				"center": "22.5491097,120.5455904",
				"map_level": 13
			},
			{
				"cityname": "桃園市",
				"center": "24.9923,121.3085",
				"map_level": 12
			},
			{
				"cityname": "連江縣",
				"center": "26.1562,119.9355",
				"map_level": 12
			},
			{
				"cityname": "基隆市",
				"center": "25.1259,121.7407",
				"map_level": 12
			},
			{
				"cityname": "宜蘭縣",
				"center": "24.6959,121.7687",
				"map_level": 12
			},
			{
				"cityname": "新竹市",
				"center": "24.8076,120.9921",
				"map_level": 12
			},
			{
				"cityname": "新竹縣",
				"center": "24.6695,121.1778",
				"map_level": 12
			},
			{
				"cityname": "苗栗縣",
				"center": "24.5677,120.8153",
				"map_level": 12
			},
			{
				"cityname": "彰化縣",
				"center": "24.0524,120.5173",
				"map_level": 12
			},
			{
				"cityname": "南投縣",
				"center": "23.8745,120.9286",
				"map_level": 12
			},
			{
				"cityname": "嘉義市",
				"center": "23.4823,120.4466",
				"map_level": 12
			},
			{
				"cityname": "嘉義縣",
				"center": "23.4796,120.3544",
				"map_level": 12
			},
			{
				"cityname": "雲林縣",
				"center": "23.7117,120.4333",
				"map_level": 12
			},
			{
				"cityname": "澎湖縣",
				"center": "23.5756,119.5790",
				"map_level": 12
			},
			{
				"cityname": "花蓮縣",
				"center": "23.8252,121.4085",
				"map_level": 12
			},
			{
				"cityname": "台東縣",
				"center": "22.7635,121.1344",
				"map_level": 12
			},
			{
				"cityname": "金門縣",
				"center": "24.4496,118.3770",
				"map_level": 12
			}
		]

		Object.keys(boundary).map(function (k) {
			if (selcity == boundary[k].cityname) {
				lat_center = boundary[k].center.split(",")[0];
				lon_center = boundary[k].center.split(",")[1];
				zoomlev = boundary[k].map_level;
			}
		});
		CreateMap();
	}
	/*
	 * create customize filter for footable
	 * 
	 */

	FooTable.MyFiltering = FooTable.Filtering.extend({
		construct: function (instance) {
			this._super(instance);
			this.statuses = [
				"台南市", "高雄市", "屏東縣", "台北市", "基隆市", "新北市",
				"連江縣", "宜蘭縣", "新竹市", "新竹縣", "桃園市", "苗栗縣",
				"台中市", "彰化縣", "南投縣", "嘉義市", "嘉義縣", "雲林縣",
				"澎湖縣", "金門縣", "台東縣", "花蓮縣"
			];
			this.def = '全部';
			this.$status = null;
		},
		$create: function () {
			this._super();
			var self = this,
				$form_grp = $('<div/>', { 'class': 'form-group' })
					.append($('<label/>', { 'class': 'sr-only', text: 'CountyTown' }))
					.prependTo(self.$form);

			self.$status = $('<select/>', { 'class': 'form-control' })
				.on('change', { self: self }, self._onStatusDropdownChanged)
				.append($('<option/>', { text: self.def }))
				.appendTo($form_grp);

			$.each(self.statuses, function (i, status) {
				self.$status.append($('<option/>').text(status));
			});
		},
		_onStatusDropdownChanged: function (e) {
			var self = e.data.self,
				selected = $(this).val();
			if (selected !== self.def) {
				self.addFilter('CountyTown', selected, ['CountyTown']);
			} else {
				self.removeFilter('CountyTown');
			}
			self.filter();
			if (selected != "全部") {
				document.getElementById("danger_village").innerHTML =
					"<h3>" + selected + "</h3>" +
					"<p>危險級村里數：" + danger_village[selected] + "里<br/>" +
					"布氏級數總調查里數：" + statistic_mosquito_color[selected] + "里("+(100*parseInt(statistic_mosquito_color[selected])/num_village[selected]).toFixed(1)+"%), " +
					"誘卵桶總調查里數：" + statistic_bucket_color[selected] + "里("+(100*parseInt(statistic_bucket_color[selected])/num_village[selected]).toFixed(1)+"%), " +
					"誘殺桶總調查里數：" + statistic_kill_bucket_color[selected] + "里("+(100*parseInt( statistic_kill_bucket_color[selected])/num_village[selected]).toFixed(1)+"%)</p>"
					document.getElementById("total_village").innerHTML="5. "+selected+"轄內共"+num_village[selected]+"村里";
			} else {
				document.getElementById("danger_village").innerHTML = "<p></p>"
				document.getElementById("total_village").innerHTML ="<p></p>"
			}


		},
		draw: function () {
			this._super();
			var status = this.find('CountyTown');
			if (status instanceof FooTable.Filter) {
				this.$status.val(status.query.val());
			} else {
				this.$status.val(this.def);
			}
		}
	});



    /*
     * desc : start the service
     */
	function CreateMap() {

		if (map != undefined) {
			map.remove();
		}

		latlng = L.latLng(lat_center, lon_center);

		// 20160128 update apikey in the mbUrl
		var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
		//var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamlhbmthaXdhbmciLCJhIjoiY2lqeG93bGVtMTc5ZHZva2lvdmQwazU3ciJ9.Hxnj3i_T20JH1kC_H1U2tA';
		var mbUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

		//var tmcwmap = L.tileLayer(mbUrl, { id: 'tmcw.map-ajwqaq7t', attribution: mbAttr });
		var grayscale = L.tileLayer(mbUrl, { id: 'mapbox.outdoors', attribution: mbAttr });
		//var streets = L.tileLayer(mbUrl, { id: 'mapbox.streets', attribution: mbAttr });
		var outdoors = L.tileLayer(mbUrl, { id: 'mapbox.outdoors', attribution: mbAttr });
		//var satellite = L.tileLayer(mbUrl, { id: 'mapbox.satellite', attribution: mbAttr });

		map = L.map('map', {
			layers: [grayscale],
			fullscreenControl: true,
			zoomControl: false
		}).setView(latlng, zoomlev);

		var baseLayers = {
			"灰階地圖": grayscale,
			//"tmcwmap": tmcwmap,
			//"Streets": streets,
			"彩色地圖": outdoors,
			//"Satellite": satellite
		};

		// 20170807 change map layer style
		map.on('baselayerchange', function (e) {
			if (e.name == "灰階地圖" && (!$('#map').hasClass('grayscale'))) {
				$('#map').addClass('grayscale');
			} else if (e.name != "灰階地圖" && $('#map').hasClass('grayscale')) {
				$('#map').removeClass('grayscale');
			}
		});

		$.ajaxSetup({
			async: false
		});

		// 村里界線 wmts服務
		villageNameURL = "http://wmts.nlsc.gov.tw/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=Village&STYLE=_null&TILEMATRIXSET=EPSG:3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png";
		var villiageNameLayer = L.tileLayer(villageNameURL, { id: 'Taiwan.village' });
		//city layer
		var city_layer;
		$.ajax({
			url: "data/geojson/city_ori.json",
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
				city_layer = L.geoJson(data, {
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

			}
		});

		//town layer
		var town_layer;
		$.ajax({
			url: "data/geojson/citytown_ori.json",
			type: 'get',
			data: {},
			dataType: 'json',
			beforeSend: function () {
				//console.log("start to load town data");
			},
			error: function (xhr, ajaxOptions, thrownError) {
				console.log("Error: Can't fetch a town file.");
			},
			success: function (data) {
				town_layer = L.geoJson(data, {
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
			}
		});

		// 以村里為單位之三種指數 點圖層
		var villagePointLayer;
		var resultData = [];
		//檢查village_point_geojson是否已有資料
		if (village_point_geojson == undefined) {


			$.ajax({
				url: "https://zone.cdc.gov.tw/map/geojson/cdcdengueVillagePoint.json?timestamp=" + datatimestamp,
				//url: "https://zone.cdc.gov.tw/map/geojson/cdcdengueVillagePoint_test.json?timestamp=" + datatimestamp,
				type: 'get',
				data: {},
				dataType: 'json',
				beforeSend: function () {
					//console.log("start to load village data");
				},
				error: function (xhr, ajaxOptions, thrownError) {
					console.log("Error: Can't fetch a village file.");
				},
				success: function (data) {
					//document.getElementById("download_btn").setAttribute("href", "https://zone.cdc.gov.tw/map/csv/cdcdengueData.csv?timestamp=" + new Date().getTime() + ".csv");
					//document.getElementById("download_btn").setAttribute("download", "cdcdengueData_" + new Date().getTime()+".csv");
					//footable 資料產製
					village_point_geojson = data;
					var processData = village_point_geojson;
					//製作資料更新時間
					if (processData.timestamp) {
						time_update = processData.timestamp;
						var d = new Date(time_update);
						time_update = d.toLocaleString("ja-JP",Time_options_data);
					}
					//資料統計時間
					if (processData.dateStart && processData.dateEnd) {
						var start = new Date(processData.dateStart)
						var end = new Date(processData.dateEnd)
						var startweek = start.getWeek();
						var endweek = end.getWeek();
						start = start.toLocaleString("ja-JP",Time_options).split(" ")[0];
						end = end.toLocaleString("ja-JP",Time_options).split(" ")[0];
						statistic_period = start + "(" + startweek + "週) - " + end + "(" + endweek + "週)";
					}

					//addDay
					Date.prototype.addDays = function (days) {
						this.setDate(this.getDate() + days);
						return this;
					}
					//動態 selection
					// document.getElementById("Week_select")
					var html_content = "";

					for (var i = 0; i < 5; i++) {
						var dateRecord = start;
						var weekRecord = startweek;
						html_content = html_content +
							"<option value='" + i + "'>" + (parseInt(weekRecord) + i) + "週(前" + (5 - i) + "週，" + new Date(dateRecord).addDays(7 * (i)).toLocaleString("ja-JP",Time_options).split(" ")[0] + "~" + new Date(dateRecord).addDays(6 + 7 * (i)).toLocaleString("ja-JP",Time_options).split(" ")[0] + ")</option>"
					}
					document.getElementById("Week_select").innerHTML = html_content;
					//統計指數
					//高風險里別
					danger_village = {
						// "tainan": 0, "kaohsiung": 0, "pingtung": 0,
						"台南市": 0, "高雄市": 0, "屏東縣": 0, "台北市": 0, "基隆市": 0, "新北市": 0,
						"連江縣": 0, "宜蘭縣": 0, "新竹市": 0, "新竹縣": 0, "桃園市": 0, "苗栗縣": 0,
						"台中市": 0, "彰化縣": 0, "南投縣": 0, "嘉義市": 0, "嘉義縣": 0, "雲林縣": 0,
						"澎湖縣": 0, "金門縣": 0, "台東縣": 0, "花蓮縣": 0
					};
					//布氏指數
					statistic_mosquito_color = {
						//"tainan": 0,"kaohsiung": 0,"pingtung": 0,
						"台南市": 0, "高雄市": 0, "屏東縣": 0, "台北市": 0, "基隆市": 0, "新北市": 0,
						"連江縣": 0, "宜蘭縣": 0, "新竹市": 0, "新竹縣": 0, "桃園市": 0, "苗栗縣": 0,
						"台中市": 0, "彰化縣": 0, "南投縣": 0, "嘉義市": 0, "嘉義縣": 0, "雲林縣": 0,
						"澎湖縣": 0, "金門縣": 0, "台東縣": 0, "花蓮縣": 0
					};
					//誘卵桶指數
					statistic_bucket_color = {
						//"tainan": 0,"kaohsiung": 0,"pingtung": 0,
						"台南市": 0, "高雄市": 0, "屏東縣": 0, "台北市": 0, "基隆市": 0, "新北市": 0,
						"連江縣": 0, "宜蘭縣": 0, "新竹市": 0, "新竹縣": 0, "桃園市": 0, "苗栗縣": 0,
						"台中市": 0, "彰化縣": 0, "南投縣": 0, "嘉義市": 0, "嘉義縣": 0, "雲林縣": 0,
						"澎湖縣": 0, "金門縣": 0, "台東縣": 0, "花蓮縣": 0
					};
					//誘殺桶指數
					statistic_kill_bucket_color = {
						//"tainan": 0,"kaohsiung": 0,"pingtung": 0,
						"台南市": 0, "高雄市": 0, "屏東縣": 0, "台北市": 0, "基隆市": 0, "新北市": 0,
						"連江縣": 0, "宜蘭縣": 0, "新竹市": 0, "新竹縣": 0, "桃園市": 0, "苗栗縣": 0,
						"台中市": 0, "彰化縣": 0, "南投縣": 0, "嘉義市": 0, "嘉義縣": 0, "雲林縣": 0,
						"澎湖縣": 0, "金門縣": 0, "台東縣": 0, "花蓮縣": 0
					};
					for (i = 0; i < processData.features.length; i++) {
						//計算統計資料
						//footable資料
						//if (processData.features[i].properties.COUNTY == "台南市" || processData.features[i].properties.COUNTY == "高雄市" || processData.features[i].properties.COUNTY == "屏東縣") {
						if (processData.features[i].properties.background_color == 'red') {
							var resultObj = {}
							resultObj.county = processData.features[i].properties.COUNTY;
							resultObj.town = processData.features[i].properties.TOWN;
							resultObj.village = processData.features[i].properties.VILLAGE;
							resultObj.CountyTown = processData.features[i].properties.COUNTY + "　" + processData.features[i].properties.TOWN;
							
							// var featureObj = {};
							//danger_point_geojson.features.push(processData.features[i]);
							//"23.5756,119.5790"
							//resultObj.center=[processData.features[i].geometry.coordinates[1],processData.features[i].geometry.coordinates[0]]
							resultObj.function="<button  id ='" + i + "' type=\"button\" class=\"ui brown button\"  onclick=\"showDangerVillageLayer('"+resultObj.village+"','"+resultObj.town+"')\" >查看</button>";
							resultData.push(resultObj);
							//3.高風險指數

							switch (processData.features[i].properties.COUNTY) {
								case "台南市": danger_village["台南市"] = danger_village["台南市"] + 1; break;
								case "高雄市": danger_village["高雄市"] = danger_village["高雄市"] + 1; break;
								case "屏東縣": danger_village["屏東縣"] = danger_village["屏東縣"] + 1; break;
								case "台北市": danger_village["台北市"] = danger_village["台北市"] + 1; break;
								case "基隆市": danger_village["基隆市"] = danger_village["基隆市"] + 1; break;
								case "新北市": danger_village["新北市"] = danger_village["新北市"] + 1; break;
								case "連江縣": danger_village["連江縣"] = danger_village["連江縣"] + 1; break;
								case "宜蘭縣": danger_village["宜蘭縣"] = danger_village["宜蘭縣"] + 1; break;
								case "新竹市": danger_village["新竹市"] = danger_village["新竹市"] + 1; break;
								case "新竹縣": danger_village["新竹縣"] = danger_village["新竹縣"] + 1; break;
								case "桃園市": danger_village["桃園市"] = danger_village["桃園市"] + 1; break;
								case "苗栗縣": danger_village["苗栗縣"] = danger_village["苗栗縣"] + 1; break;
								case "台中市": danger_village["台中市"] = danger_village["台中市"] + 1; break;
								case "彰化縣": danger_village["彰化縣"] = danger_village["彰化縣"] + 1; break;
								case "南投縣": danger_village["南投縣"] = danger_village["南投縣"] + 1; break;
								case "嘉義市": danger_village["嘉義市"] = danger_village["嘉義市"] + 1; break;
								case "嘉義縣": danger_village["嘉義縣"] = danger_village["嘉義縣"] + 1; break;
								case "雲林縣": danger_village["雲林縣"] = danger_village["雲林縣"] + 1; break;
								case "澎湖縣": danger_village["澎湖縣"] = danger_village["澎湖縣"] + 1; break;
								case "金門縣": danger_village["金門縣"] = danger_village["金門縣"] + 1; break;
								case "台東縣": danger_village["台東縣"] = danger_village["台東縣"] + 1; break;
								case "花蓮縣": danger_village["花蓮縣"] = danger_village["花蓮縣"] + 1; break;
							}
						}
						//4 布氏級數

						if (processData.features[i].properties.mosquito_house_level != null) {
							switch (processData.features[i].properties.COUNTY) {
								case "台南市": statistic_mosquito_color["台南市"] = statistic_mosquito_color["台南市"] + 1; break;
								case "高雄市": statistic_mosquito_color["高雄市"] = statistic_mosquito_color["高雄市"] + 1; break;
								case "屏東縣": statistic_mosquito_color["屏東縣"] = statistic_mosquito_color["屏東縣"] + 1; break;
								case "台北市": statistic_mosquito_color["台北市"] = statistic_mosquito_color["台北市"] + 1; break;
								case "基隆市": statistic_mosquito_color["基隆市"] = statistic_mosquito_color["基隆市"] + 1; break;
								case "新北市": statistic_mosquito_color["新北市"] = statistic_mosquito_color["新北市"] + 1; break;
								case "連江縣": statistic_mosquito_color["連江縣"] = statistic_mosquito_color["連江縣"] + 1; break;
								case "宜蘭縣": statistic_mosquito_color["宜蘭縣"] = statistic_mosquito_color["宜蘭縣"] + 1; break;
								case "新竹市": statistic_mosquito_color["新竹市"] = statistic_mosquito_color["新竹市"] + 1; break;
								case "新竹縣": statistic_mosquito_color["新竹縣"] = statistic_mosquito_color["新竹縣"] + 1; break;
								case "桃園市": statistic_mosquito_color["桃園市"] = statistic_mosquito_color["桃園市"] + 1; break;
								case "苗栗縣": statistic_mosquito_color["苗栗縣"] = statistic_mosquito_color["苗栗縣"] + 1; break;
								case "台中市": statistic_mosquito_color["台中市"] = statistic_mosquito_color["台中市"] + 1; break;
								case "彰化縣": statistic_mosquito_color["彰化縣"] = statistic_mosquito_color["彰化縣"] + 1; break;
								case "南投縣": statistic_mosquito_color["南投縣"] = statistic_mosquito_color["南投縣"] + 1; break;
								case "嘉義市": statistic_mosquito_color["嘉義市"] = statistic_mosquito_color["嘉義市"] + 1; break;
								case "嘉義縣": statistic_mosquito_color["嘉義縣"] = statistic_mosquito_color["嘉義縣"] + 1; break;
								case "雲林縣": statistic_mosquito_color["雲林縣"] = statistic_mosquito_color["雲林縣"] + 1; break;
								case "澎湖縣": statistic_mosquito_color["澎湖縣"] = statistic_mosquito_color["澎湖縣"] + 1; break;
								case "金門縣": statistic_mosquito_color["金門縣"] = statistic_mosquito_color["金門縣"] + 1; break;
								case "台東縣": statistic_mosquito_color["台東縣"] = statistic_mosquito_color["台東縣"] + 1; break;
								case "花蓮縣": statistic_mosquito_color["花蓮縣"] = statistic_mosquito_color["花蓮縣"] + 1; break;
							}
						}
						//5 幼卵桶調查里數
						if (processData.features[i].properties.bucket_positive_rate != null) {
							switch (processData.features[i].properties.COUNTY) {
								case "台南市": statistic_bucket_color["台南市"] = statistic_bucket_color["台南市"] + 1; break;
								case "高雄市": statistic_bucket_color["高雄市"] = statistic_bucket_color["高雄市"] + 1; break;
								case "屏東縣": statistic_bucket_color["屏東縣"] = statistic_bucket_color["屏東縣"] + 1; break;
								case "台北市": statistic_bucket_color["台北市"] = statistic_bucket_color["台北市"] + 1; break;
								case "基隆市": statistic_bucket_color["基隆市"] = statistic_bucket_color["基隆市"] + 1; break;
								case "新北市": statistic_bucket_color["新北市"] = statistic_bucket_color["新北市"] + 1; break;
								case "連江縣": statistic_bucket_color["連江縣"] = statistic_bucket_color["連江縣"] + 1; break;
								case "宜蘭縣": statistic_bucket_color["宜蘭縣"] = statistic_bucket_color["宜蘭縣"] + 1; break;
								case "新竹市": statistic_bucket_color["新竹市"] = statistic_bucket_color["新竹市"] + 1; break;
								case "新竹縣": statistic_bucket_color["新竹縣"] = statistic_bucket_color["新竹縣"] + 1; break;
								case "桃園市": statistic_bucket_color["桃園市"] = statistic_bucket_color["桃園市"] + 1; break;
								case "苗栗縣": statistic_bucket_color["苗栗縣"] = statistic_bucket_color["苗栗縣"] + 1; break;
								case "台中市": statistic_bucket_color["台中市"] = statistic_bucket_color["台中市"] + 1; break;
								case "彰化縣": statistic_bucket_color["彰化縣"] = statistic_bucket_color["彰化縣"] + 1; break;
								case "南投縣": statistic_bucket_color["南投縣"] = statistic_bucket_color["南投縣"] + 1; break;
								case "嘉義市": statistic_bucket_color["嘉義市"] = statistic_bucket_color["嘉義市"] + 1; break;
								case "嘉義縣": statistic_bucket_color["嘉義縣"] = statistic_bucket_color["嘉義縣"] + 1; break;
								case "雲林縣": statistic_bucket_color["雲林縣"] = statistic_bucket_color["雲林縣"] + 1; break;
								case "澎湖縣": statistic_bucket_color["澎湖縣"] = statistic_bucket_color["澎湖縣"] + 1; break;
								case "金門縣": statistic_bucket_color["金門縣"] = statistic_bucket_color["金門縣"] + 1; break;
								case "台東縣": statistic_bucket_color["台東縣"] = statistic_bucket_color["台東縣"] + 1; break;
								case "花蓮縣": statistic_bucket_color["花蓮縣"] = statistic_bucket_color["花蓮縣"] + 1; break;
							}
						}
						//誘殺桶 gravitrap_positive_rate
						if (processData.features[i].properties.gravitrap_positive_rate != null) {
							switch (processData.features[i].properties.COUNTY) {
								case "台南市": statistic_kill_bucket_color["台南市"] = statistic_kill_bucket_color["台南市"] + 1; break;
								case "高雄市": statistic_kill_bucket_color["高雄市"] = statistic_kill_bucket_color["高雄市"] + 1; break;
								case "屏東縣": statistic_kill_bucket_color["屏東縣"] = statistic_kill_bucket_color["屏東縣"] + 1; break;
								case "台北市": statistic_kill_bucket_color["台北市"] = statistic_kill_bucket_color["台北市"] + 1; break;
								case "基隆市": statistic_kill_bucket_color["基隆市"] = statistic_kill_bucket_color["基隆市"] + 1; break;
								case "新北市": statistic_kill_bucket_color["新北市"] = statistic_kill_bucket_color["新北市"] + 1; break;
								case "連江縣": statistic_kill_bucket_color["連江縣"] = statistic_kill_bucket_color["連江縣"] + 1; break;
								case "宜蘭縣": statistic_kill_bucket_color["宜蘭縣"] = statistic_kill_bucket_color["宜蘭縣"] + 1; break;
								case "新竹市": statistic_kill_bucket_color["新竹市"] = statistic_kill_bucket_color["新竹市"] + 1; break;
								case "新竹縣": statistic_kill_bucket_color["新竹縣"] = statistic_kill_bucket_color["新竹縣"] + 1; break;
								case "桃園市": statistic_kill_bucket_color["桃園市"] = statistic_kill_bucket_color["桃園市"] + 1; break;
								case "苗栗縣": statistic_kill_bucket_color["苗栗縣"] = statistic_kill_bucket_color["苗栗縣"] + 1; break;
								case "台中市": statistic_kill_bucket_color["台中市"] = statistic_kill_bucket_color["台中市"] + 1; break;
								case "彰化縣": statistic_kill_bucket_color["彰化縣"] = statistic_kill_bucket_color["彰化縣"] + 1; break;
								case "南投縣": statistic_kill_bucket_color["南投縣"] = statistic_kill_bucket_color["南投縣"] + 1; break;
								case "嘉義市": statistic_kill_bucket_color["嘉義市"] = statistic_kill_bucket_color["嘉義市"] + 1; break;
								case "嘉義縣": statistic_kill_bucket_color["嘉義縣"] = statistic_kill_bucket_color["嘉義縣"] + 1; break;
								case "雲林縣": statistic_kill_bucket_color["雲林縣"] = statistic_kill_bucket_color["雲林縣"] + 1; break;
								case "澎湖縣": statistic_kill_bucket_color["澎湖縣"] = statistic_kill_bucket_color["澎湖縣"] + 1; break;
								case "金門縣": statistic_kill_bucket_color["金門縣"] = statistic_kill_bucket_color["金門縣"] + 1; break;
								case "台東縣": statistic_kill_bucket_color["台東縣"] = statistic_kill_bucket_color["台東縣"] + 1; break;
								case "花蓮縣": statistic_kill_bucket_color["花蓮縣"] = statistic_kill_bucket_color["花蓮縣"] + 1; break;
							}
						}
						//下面這個括弧
						//}
					}
					
					// document.getElementById("danger_village").innerText =
					// 	"3. 危險級村里數:" +
					// 	"台南市" + danger_village["台南市"] + "里," +
					// 	"高雄市" + danger_village["高雄市"] + "里," +
					// 	"屏東縣" + danger_village["屏東縣"] + "里"
					// document.getElementById("statistics_mosquito_color").innerText =
					// 	"4. 布氏級數總調查里數：" +
					// 	"台南市" + statistic_mosquito_color["台南市"] + "里," +
					// 	"高雄市" + statistic_mosquito_color["高雄市"] + "里," +
					// 	"屏東縣" + statistic_mosquito_color["屏東縣"] + "里"
					// document.getElementById("statistics_bucket_color").innerText =
					// 	"5. 誘卵桶總調查里數：" +
					// 	"台南市" + statistic_bucket_color["台南市"] + "里," +
					// 	"高雄市" + statistic_bucket_color["高雄市"] + "里," +
					// 	"屏東縣" + statistic_bucket_color["屏東縣"] + "里"
					//footable
					jQuery(function ($) {
						$('#insectTable').footable({
							components: {
								filtering: FooTable.MyFiltering
							},
							"paging": {
								"enabled": true
							},
							"filtering": {
								"enabled": true
							},
							"sorting": {
								"enabled": true
							},
							columns: $.get("data/InsectTable/TableColumns.json"),
							rows: resultData
						});
					});
					//繪製 村里三種指數 點圖層
					showVillagePoint(village_point_geojson)

				}
			});
			//如果已經有 village_point_geojson
		} else {
			showVillagePoint(village_point_geojson)
		}

		function showVillagePoint(village_point_geojson) {
			villagePointLayer = L.geoJson(village_point_geojson, {
				filter: function (feature, layer) {
					if (feature.properties) {
						if (feature.properties.mosquito_color == "gray" && feature.properties.bucket_color == "gray" && feature.properties.gravitrap_color == "gray") {
							return false;
						} else if (feature.properties.COUNTY == selcity) {
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
				pointToLayer: function (feature, latlng) {
					var firstBall;
					var secondBall;
					var thirdBall;

					if (feature.properties.mosquito_color == "yellow") {
						firstBall = "my-div-iconSafe";
					} else if (feature.properties.mosquito_color == "red") {
						firstBall = "my-div-iconDanger";
					} else if (feature.properties.mosquito_color == "orange") {
						firstBall = "my-div-iconWarn";
					} else {
						firstBall = "my-div-iconNone";
					}
					if (feature.properties.bucket_color == "yellow") {
						secondBall = "my-div-iconSafe";
					} else if (feature.properties.bucket_color == "red") {
						secondBall = "my-div-iconDanger";
					} else if (feature.properties.bucket_color == "orange") {
						secondBall = "my-div-iconWarn";
					} else {
						secondBall = "my-div-iconNone";
					}
					if (feature.properties.gravitrap_color == "yellow") {
						thirdBall = "my-div-iconSafe";
					} else if (feature.properties.gravitrap_color == "red") {
						thirdBall = "my-div-iconDanger";
					} else if (feature.properties.gravitrap_color == "orange") {
						thirdBall = "my-div-iconWarn";
					} else {
						thirdBall = "my-div-iconNone";
					}

					var myIcon = L.divIcon({
						className: 'my-div-group', iconSize: null,
						//html
						html: '<div class="' + firstBall + '"></div><div class="' + secondBall + '"></div><div class="' + thirdBall + '"></div>'

					});
					return new L.marker(latlng, { icon: myIcon })



					//return new L.CircleMarker(latlng, { radius: 8, fillOpacity: 0.85 });
				},
				onEachFeature: function (feature, layer) {
					layer.bindPopup(feature.properties.VILLAGE);
				}
			});

		}

		///// set control on map
		// set control layer
		var overlaymap = {
			"三種指數": villagePointLayer,
			"村里界線與名稱": villiageNameLayer,
			"縣市界線": city_layer,
			"鄉鎮界線": town_layer
		};

		// zoom control
		var zoom = L.control.zoom().addTo(map)
		zoom.setPosition('topleft');



		//map.addLayer(ClusterLayer);
		var navbtn = L.control({ position: 'topright' });
		navbtn.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			var control_htm = '<button type="button"  id="nav_start" onclick="navStart()" >教學導覽</button>'
			div.innerHTML = control_htm;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
			L.DomEvent.disableClickPropagation(div);
			return div;
		};
		navbtn.addTo(map);
		L.control.layers(baseLayers, overlaymap, { position: 'topright' }).addTo(map);
		map.on('overlayremove', function (eventLayer) {
			if (eventLayer.name === '三種指數') {
				$("#image_legend").css("display", "none");
			}
		})
		map.on('overlayadd', function (eventLayer) {
			if (eventLayer.name === '三種指數') {
				$("#image_legend").css("display", "block");
			}
		})

		$.ajaxSetup({
			async: true
		});

		// 圖例區legend
		var legend = L.control({ position: 'bottomright' });
		legend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			var small_html = '<div class="legendtb" id="legend_button_off" style="display:none"><b>圖例</b>'
			var htmstr = '<div class="legendtb " id="legend_button_on" style="display:block">';
			htmstr += '<div><b>病媒蚊風險警示</b><i class="fa fa-times-circle" style="position: left;position: absolute;right: 11px;top: 8px;"></i><br/></div><i class="stop icon" style="color:red; opacity:0.3"></i>危險<i class="stop icon" style="color:#ff8400 ; opacity:0.3"></i>注意<i class="stop icon" style="color:#ebcf00 ; opacity:0.3"></i>低風險<i class="stop icon" style="color:grey ; opacity:0.4"></i>無資料</br>';
			htmstr += '<img id="image_legend" src="/data/images/legend.png" style="display: none;width: 250px;margin: 10px auto;">';
			//htmstr += '第2點：誘卵桶指數<br/>';
			//htmstr += '第3點：誘殺桶指數<br/>';
			//htmstr += '詳細表格整理請見<a href="TimeMap.aspx">此連結</a>';
			htmstr += '</div>';
			htmstr = htmstr + small_html;
			div.innerHTML = htmstr;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

			return div;
		};
		legend.addTo(map);
		$("#legend_button_on").click(function () {
			$("#legend_button_on").css("display", "none");
			$("#legend_button_off").css("display", "block");
		})
		$("#legend_button_off").click(function () {
			$("#legend_button_on").css("display", "block");
			$("#legend_button_off").css("display", "none");
		})

		// 資料來源區legend
		var legend_data = L.control({ position: 'bottomright' });
		legend_data.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			var small_data_html = '<div class="legendtb" id="data_legend_button_off" style="display:none"><i class="fa fa-calendar" aria-hidden="true"></i>'
			var htmstr = '<div class="legendtb " id="data_legend_button_on" style="display:block">';
			htmstr += '<p  id="statistic_time" >資料統計期間：<br/>' + statistic_period + '<br/>' +
				'資料更新時間：<br/>' + time_update
				+ '</p>';
			//htmstr += '第2點：誘卵桶指數<br/>';
			//htmstr += '第3點：誘殺桶指數<br/>';
			//htmstr += '詳細表格整理請見<a href="TimeMap.aspx">此連結</a>';
			htmstr += '</div>';
			htmstr = htmstr + small_data_html;
			div.innerHTML = htmstr;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

			return div;
		};
		legend_data.addTo(map);
		$("#data_legend_button_on").click(function () {
			$("#data_legend_button_on").css("display", "none");
			$("#data_legend_button_off").css("display", "block");
		})
		$("#data_legend_button_off").click(function () {
			$("#data_legend_button_on").css("display", "block");
			$("#data_legend_button_off").css("display", "none");
		})
		// popup村里事件區legend
		// var popup_legend = L.control({ position: 'bottomright' });
		// popup_legend.onAdd = function (map) {
		// 	var div = L.DomUtil.create('div', 'info legend');
		// 	//var small_html = '<div class="legendtb" id="legend_button_off" style="display:none"><b>圖例</b>'
		// 	var htmstr = '<div class="legendtb " id="popup_legend" style="display:block">';
		// 	htmstr += '<div><b id="name_town_village">鄉鎮與村里</b><i class="fa fa-times-circle" style="position: left;position: absolute;right: 11px;top: 8px;"></i><br/></div>'+
		// 	'<div class="ui grid">'+
		// 	'<div class="four wide column"></div>'+
		// 	'<div class="three wide column">布氏<br/>級數</div>'+
		// 	'<div class="four wide column">誘卵桶<br/>指數</div>'+
		// 	'<div class="four wide column">誘殺桶<br/>指數</div>'+
		// 	'<div class="sixteen wide column">5</div>'+
		// 	'<div class="sixteen wide column">4</div>'+
		// 	'<div class="sixteen wide column">3</div>'+
		// 	'<div class="sixteen wide column">2</div>'+
		// 	'<div class="sixteen wide column">1</div>'+
		// 	'</div>'
		// 	div.innerHTML = htmstr;
		// 	//'<i class="stop icon" style="color:red; opacity:0.3"></i>危險<i class="stop icon" style="color:#ff8400 ; opacity:0.3"></i>注意<i class="stop icon" style="color:#ebcf00 ; opacity:0.3"></i>低風險<i class="stop icon" style="color:grey ; opacity:0.4"></i>無資料</br>';
		// 	//htmstr += '<img id="image_legend" src="/data/images/legend.png" style="display: none;width: 250px;margin: 10px auto;">';
		// 	//htmstr += '第2點：誘卵桶指數<br/>';
		// 	//htmstr += '第3點：誘殺桶指數<br/>';
		// 	//htmstr += '詳細表格整理請見<a href="TimeMap.aspx">此連結</a>';
		// 	//htmstr += '</div>';
		// 	//htmstr = htmstr + small_html;

		// 	//div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;

		// 	return div;
		// };
		// popup_legend.addTo(map);
		// $("#popup_legend").click(function () {
		// 	$("#popup_legend").css("display", "none");

		// })

		//動畫圖標區
		// var datestep_legend = L.control({ position: 'topright' });
		// datestep_legend.onAdd = function (map) {
		// 	var div = L.DomUtil.create('div', 'info legend');
		// 	div.innerHTML = '<div class="ui massive red label"><span class="example-val six wide field" id="datestep">測試</span></div>';
		// 	div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		// 	return div;
		// };
		// datestep_legend.addTo(map);

		// 縣市下拉選單
		// var citylegend = L.control({ position: 'topright' });
		// citylegend.onAdd = function (map) {
		//     var div = L.DomUtil.create('div', 'info legend');
		//     var control_htm = '<select id="city_select" class="ui fluid dropdown" '
		// 		+ 'style="font-size: 15px;">';
		// 	control_htm += '<option value="00">請選擇</option>';
		// 	control_htm += '<option value="07">高雄市</option>';
		// 	control_htm += '<option value="05">台南市</option>';
		// 	control_htm += '<option value="43">屏東縣</option>';
		// 	control_htm += '<option value="01">台北市</option>';
		// 	control_htm += '<option value="31">新北市</option>';
		// 	control_htm += '<option value="03">台中市</option>';

		// 	control_htm += '<option  value="10">基隆市</option>';
		// 	control_htm += '<option value="11">桃園市</option>';
		// 	control_htm += '<option value="13">連江縣</option>';
		// 	control_htm += '<option value="14">宜蘭縣</option>';
		// 	control_htm += '<option value="15">新竹市</option>';
		// 	control_htm += '<option value="16">新竹縣</option>';

		// 	control_htm += '<option value="17">苗栗縣</option>';
		// 	control_htm += '<option  value="18">彰化縣</option>';
		// 	control_htm += '<option  value="19">南投縣</option>';
		// 	control_htm += '<option value="20">嘉義市</option>';
		// 	control_htm += '<option  value="21">嘉義縣</option>';
		// 	control_htm += '<option  value="22">澎湖縣</option>';
		// 	control_htm += '<option value="23">雲林縣</option>';

		// 	control_htm += '<option value="24">花蓮縣</option>';
		// 	control_htm += '<option value="25">台東縣</option>';
		// 	control_htm += '<option value="26">金門縣</option>';
		//     control_htm += '</select>';


		//     div.innerHTML = control_htm;
		//     div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
		//     L.DomEvent.disableClickPropagation(div);
		//     return div;
		// };
		// citylegend.addTo(map);
		$("#city_select").val(citycode);
		$("#city_select").change(function () {
			// change the county
			if (document.getElementById("city_select").selectedIndex != 0) {
				LoadMapData();
				$('#ns1btn').removeClass("active");
                map.removeLayer(ns1MapLayer);
				//click_times=0
			}

		});
		// $("#city_select").mouseup(function () {
		// 	var open = $(this).data("isopen");
		// 	if(open) {
		// 		LoadMapData();
		// 	}
		// 	$(this).data("isopen", !open);
		// })
		var click_times = 0;
		$("#city_select").mousedown(function (e) {

			// change the county
			var explorer = navigator.userAgent;
			if (explorer.indexOf("Firefox") <= 0) {
				document.getElementById("city_select").selectedIndex = 0

			}
			e.stopPropagation();

		});
		// 地址定位欄位
		var locationKeyPress = L.control({ position: 'bottomleft' });
		locationKeyPress.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			var control_htm = '<input  type="text" id="searchAddress" placeholder="輸入位置定位" style="margin-bottom:10px"><button type="button" id="searchButton" onclick="__retrieveInputAddress(); " style="margin-bottom:10px">查詢</button>'

			div.innerHTML = control_htm;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
			L.DomEvent.disableClickPropagation(div);
			return div;
		};
		//防止enter 誤觸重新讀取頁面
		$('#form1').keypress(function (event) {
			if (event.keyCode === 10 || event.keyCode === 13) {
				event.preventDefault();
				__retrieveInputAddress();
			}
		});
		locationKeyPress.addTo(map);
		// GeoJSON Data download button
		var downloadbtn = L.control({ position: 'bottomleft' });
		downloadbtn.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			//var control_htm = ' <div id="download_json" class="ui teal icon button" style="font-color: white;"><i><img src="data/images/GeoJSON_icon.png" style="width:40px"></img></i><br/>統計表格</div>';
			//control_htm ='<button type="button" class="btn btn-danger" id="statistic" data-toggle="modal" data-target=".bd-example-modal-lg">統計表格</button>'
			var control_htm = '<button type="button"  id="statistic_button" onclick="openTable()">統計表格</button>'
			div.innerHTML = control_htm;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
			L.DomEvent.disableClickPropagation(div);
			return div;
		};
		downloadbtn.addTo(map);

		// 區域文字
		//如果不是mobile就啟動
		if(!window.mobilecheck()){
		var loclegend = L.control({ position: 'bottomleft' });
		loclegend.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'info legend');
			div.innerHTML = '<div style="font-size:40px;color:rgba(217,92,92,1);font-family: "微軟正黑體""><b id="locval"></b></div>';
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
			return div;
		};
		loclegend.addTo(map);
	}

		// 取得隨機顏色
		var getRandomColor = function () {
			return (function (m, s, c) {
				return (c ? arguments.callee(m, s, c - 1) : '#') + s[m.floor(m.random() * 16)]
			})(Math, '0123456789abcdef', 5)
		}

		// ==========Create TreeMap==========
		var points = [],
			town_p, town_val, town_i, town_count, town_name = [],
			village_p, village_val, village_i, village_count, village_name = [],
			unit_p, unit_i, unit_name = [];
		var TreeMapJson = [];
		$('#MapLoader1').hide();
		// var json = $.parseJSON(data.d);
		// var features = json.features;
		town_i = 0;



		// 20161223 : show current location button
		showCurrentLocationBtn();

		// 20180824 : add city, town, village buttons
		addLocBtns();
		// 20190704 : show village layer 

	}
});


