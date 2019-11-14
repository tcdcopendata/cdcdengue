// 20160409 use dedicated worker instead of shared worker due to the support of IE
var enableWorker = 0;

// cityJSONData, townJSONData and villageJSONData are json objects
var village309JSONData = null;
var dengueGeoJSONData = null;
var geoworker = null;

// 20160410 update to refetch data
var immigration = "0";

//設定縣市中心點
// 20180809 : manully set the center to new taipei city but with the whole country data
var boundary = [
    { "cityname": "全國", "center": "23.583234,120.5825975", "map_level": 8 },
    { "cityname": "台北市、新北市", "center": "25.0610099,121.492354", "map_level": 11 },
    { "cityname": "基隆市", "center": "25.120702,121.72236", "map_level": 13 },
    { "cityname": "宜蘭縣", "center": "24.748703,121.7543979", "map_level": 10 },
    { "cityname": "台北市", "center": "25.0556462,121.5492322", "map_level": 12 },
    { "cityname": "新北市", "center": "25.0610099,121.492354", "map_level": 11 },
    { "cityname": "桃園市", "center": "24.977705,121.268093", "map_level": 11 },
    { "cityname": "新竹市", "center": "24.816708,120.97992", "map_level": 12 },
    { "cityname": "新竹縣", "center": "24.823708,121.014411", "map_level": 11 },
    { "cityname": "苗栗縣", "center": "24.552304,120.815569", "map_level": 11 },
    { "cityname": "南投縣", "center": "23.9704493,120.9465243", "map_level": 10 },
    { "cityname": "台中市", "center": "24.1837584,120.6037066", "map_level": 11 },
    { "cityname": "彰化縣", "center": "23.9503557,120.5273573", "map_level": 11 },
    { "cityname": "雲林縣", "center": "23.709355,120.4003843", "map_level": 11 },
    { "cityname": "嘉義市", "center": "23.479610, 120.446196", "map_level": 13 },
    { "cityname": "嘉義縣", "center": "23.479610, 120.446196", "map_level": 11 },
    { "cityname": "台南市", "center": "23.038265,120.211707", "map_level": 11 },
    { "cityname": "高雄市", "center": "22.640458,120.314034", "map_level": 11 },
    { "cityname": "台南市、高雄市與屏東縣", "center": "22.8393615,120.2628705", "map_level": 10 },
    { "cityname": "屏東縣", "center": "22.5491097,120.5455904", "map_level": 10 },
    { "cityname": "花蓮縣", "center": "23.7266258,121.439971", "map_level": 10 },
    { "cityname": "台東縣", "center": "23.057294,121.1669677", "map_level": 10 },
    { "cityname": "澎湖縣", "center": "23.5643307,119.5657459", "map_level": 12 },
    { "cityname": "連江縣", "center": "26.1632444,119.9594756", "map_level": 12 },
    { "cityname": "金門縣", "center": "24.4406787,118.4200947", "map_level": 11 }
]
// 20161126 : default is taipei city
// 20170502 : set default city to tainan-kaohsiung-pingtung
// 20171012 : set default city to new taipei city
// 20180809 : set default city to all
/*var citycode = '05-07-43';
var defaultSelcity = '台南市、高雄市與屏東縣';
var defaultZoomlevel = 10;*/
var citycode = 'all';
var defaultSelcity = '全國';
var selcity;
var defaultZoomlevel = 8;

// 20160406 : 預設為流行季開始時間(2016/1/1)
// 20170503 : set default date peoirdgetCrtYear
// 20170806 : set default date peroid from 2017/01/01
// 20170809 : set beginning date to 2018/07/01 as the default
var todaydate = new Date();
//var lasttwoyear = currentDateAddDays(-365);
var lasttwoyear = new Date();
lasttwoyear.setFullYear(2019, 0, 1);
//lasttwoyear.setFullYear(lasttwoyear.getFullYear() - 1);  //time slider預設為近一年
var endingDate = (todaydate) + "/" + getCrtMonth(todaydate) + "/" + getCrtDate(todaydate);
var beginningDate = getCrtYear(lasttwoyear) + "/" + getCrtMonth(lasttwoyear) + "/" + getCrtDate(lasttwoyear);
var currentDateSelection = [beginningDate, endingDate];

var map;
var mapLayerGroups = [];
var dategroup = [];
var geojson;
var timer;

// basemap options
var baseLayers = {};

if (window.Worker) {
    geoworker = new Worker('resource/__workers/1.0/shared_GETGEO.js');
    var village309worker = new Worker('resource/__workers/1.0/village309.js');

    geoworker.postMessage([citycode, immigration, currentDateSelection[0], currentDateSelection[1]]);
    village309worker.postMessage([]);

    village309worker.onmessage = function (e) {
        village309JSONData = e.data;
    }

    enableWorker = 1;
}

function calTimestamp(str) {
    return new Date(str).getTime();
}

// desc : format date as YYYY/MM/DD
function formatDate(date) {
    return getCrtYear(date) + "/" + getCrtMonth(date) + "/" + getCrtDate(date);
}

$(document).ready(function () {
   
    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        return yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]); // padding
    };

    var dateSlider = document.getElementById('slider-date');

    //設定起始時間的顯示
    document.getElementById('startdate').value = lasttwoyear.yyyymmdd();
    document.getElementById('enddate').value = todaydate.yyyymmdd();

    var settings = {
        animate: true,

        range: {
            min: calTimestamp(lasttwoyear.yyyymmdd()),
            max: calTimestamp(todaydate.yyyymmdd())
        },
        behaviour: 'tap',
        connect: 'lower',
        step: 24 * 60 * 60 * 1000,
        start: [calTimestamp(todaydate.yyyymmdd())],

        format: wNumb({
            decimals: 0
        })
    };

    noUiSlider.create(dateSlider, settings);

    var isPaused = true; //預設不會自動跑
    var platstep; //slider的時間

    function setIntervalvalue() {
        dateSlider.noUiSlider.on('update', function (values, handle) {
            if (document.getElementById('datestep') != undefined) {
                document.getElementById('datestep').innerHTML = formatDate(new Date(+values[handle]));
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
            platstep = calTimestamp(document.getElementById('datestep').innerHTML);
            //dateSlider.noUiSlider.set(platstep);
            reloadmarker();
        });

        if (document.getElementById('datestep') == undefined || document.getElementById('datestep') == undefined) {
            platstep = calTimestamp(document.getElementById('startdate').value);
        } else if (document.getElementById('startdate').value == document.getElementById('datestep').innerHTML) {
            platstep = calTimestamp(document.getElementById('startdate').value);
        } else if (document.getElementById('startdate').value != document.getElementById('datestep').innerHTML) {
            platstep = calTimestamp(document.getElementById('datestep').innerHTML);
        }
    }

    setIntervalvalue();

    function reloadmarker() {
        var mindatindex = dategroup.indexOf(document.getElementById('startdate').value);
        var dateindex = dategroup.indexOf(formatDate(new Date(platstep)));
        for (i = 0; i < mapLayerGroups.length; i++) {
            map.removeLayer(mapLayerGroups[i]);
        }
        for (i = mindatindex; i <= dateindex; i++) {
            map.addLayer(mapLayerGroups[i]);

            //設定脫離潛伏期病例的style
            if (i >= (dateindex - 7)) {
                mapLayerGroups[i].setStyle({ fillColor: 'red' });
            }
            else if (i >= (dateindex - 14)) {
                mapLayerGroups[i].setStyle({ fillColor: 'orange' });
            }
            else if (i >= (dateindex - 30)) {
                mapLayerGroups[i].setStyle({ fillColor: 'yellow' });
            }
            else {
                mapLayerGroups[i].setStyle({ fillColor: 'gray' });
            }
        }

        for (i = dateindex; i >= mindatindex; i--) {

        }
    }

    var speed = 1; //預設為1倍速
    var rate = 24 * 60 * 60 * 1000;　//86400000毫秒
    var mapplay = setInterval(palyit, 200); //毫秒
    function palyit() {
        if (!isPaused) { //不等於暫停
            platstep = platstep + rate;  //以一天為頻率
            if (!(platstep > calTimestamp(document.getElementById('enddate').value))) {  //slider的時間還在範圍內  
                dateSlider.noUiSlider.set(platstep);
                document.getElementById('datestep').innerHTML = formatDate(new Date(platstep));

                var dateindex = dategroup.indexOf(formatDate(new Date(platstep)));
                map.addLayer(mapLayerGroups[dateindex]);

                //設定脫離潛伏期病例的style
                setmarkercolor(dateindex);
            } else {
                if ($("#loopcheck").hasClass("checked")) {  //有勾選迴圈的話回到開始時間
                    platstep = calTimestamp(document.getElementById('startdate').value);
                    dateSlider.noUiSlider.set(platstep);
                    //清除所有layer
                    for (i = 0; i < mapLayerGroups.length; i++) {
                        mapLayerGroups[i].setStyle({ fillColor: 'red' }); //將style調整回去
                        map.removeLayer(mapLayerGroups[i]);
                    }
                }
            }
        }
    }

    function setmarkercolor(i) {
        //設定脫離潛伏期病例的style
        mapLayerGroups[i].setStyle({ fillColor: 'red' });
        if (mapLayerGroups[i - 8] != undefined) {
            mapLayerGroups[i - 8].setStyle({ fillColor: 'orange' });
        }
        if (mapLayerGroups[i - 15] != undefined) {
            mapLayerGroups[i - 15].setStyle({ fillColor: 'yellow' });
        }
        if (mapLayerGroups[i - 31] != undefined) {
            mapLayerGroups[i - 31].setStyle({ fillColor: 'gray' });
        }
    }

    $('#play_btn').on('click', function (e) {
        //speed = 1 / $("#rate_select :selected").val();
        e.preventDefault();
        isPaused = false;
        $(this).removeClass("red");
        $(this).addClass("disabled");
        $('#pause_btn').removeClass("disabled");
        $('#pause_btn').addClass("red");

        //初始先清除所有layer
        if (document.getElementById('enddate').value == document.getElementById('datestep').innerHTML) {
            for (i = 0; i < mapLayerGroups.length; i++) {
                map.removeLayer(mapLayerGroups[i]);
            }
        }
    });

    $('#pause_btn').on('click', function (e) {
        e.preventDefault();
        isPaused = true;
        $(this).removeClass("red");
        $(this).addClass("disabled");
        $('#play_btn').removeClass("disabled");
        $('#play_btn').addClass("red");
    });

    $("#startdate").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            reset_datetime();

            $('#MapLoader1').hide();
        }, 0);
    });

    $("#enddate").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            reset_datetime();

            $('#MapLoader1').hide();
        }, 0);
    });

    // 20160410 fetch data after startdate or enddate is changed
    function resignData(data) {
        if (data.d === 'undefined') {
            console.log('un');
        }

        var results = JSON.parse(data.d);

        Object.keys(results).map(function (k) {
            var datefliter = results[k].sickdate;
            var city_name = results[k].city_name;
            var town_name = results[k].town_name;
            var lat = results[k].lat;
            var lng = results[k].lng;
            var loccnt = results[k].count;
            var latlngarr = [lng, lat, loccnt];
            //var marker = L.marker(new L.LatLng(lat, lng), { time: datefliter });
            //marker_list.push(marker);
            if (lat != null && lng != null) {
                //alert(lat + ", " + lng)
                geojson.features.push({
                    "type": "Feature",
                    "properties": {
                        "sickdate": datefliter,  // "time": datefliter
                        "city": city_name,
                        "town": town_name
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": latlngarr
                    }
                });
            }
        });

        // 20160410 update several operations
        // due to javascript core, the function setmarkers() must be after all cases put into the map
        setmarkers();
        resetslider();
        reloadmarker();

        $('#MapLoader1').hide();
    }

    function refetchData() {
        $('#MapLoader1').show();
        geoworker.postMessage([citycode, immigration, $("#startdate").val(), $("#enddate").val()]);

        if (enableWorker == 1) {
            geoworker.onmessage = function (e) {
                dengueGeoJSONData = e.data;
                mapdata = dengueGeoJSONData;
                // 20160410 only to redraw cases
                resignData(dengueGeoJSONData);
            }
        } else {
            $.ajax({
                type: "POST",
                url: "DengueData.asmx/GetDengueLocation",
                data: "{citycode:'" + citycode + "', immigration: '" + immigration + "', startDate: " + $("#startdate").val() + ", endDate: " + $("#enddate").val() + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    mapdata = data;
                    resignData(data);
                },
                beforeSend: function () {
                    $('#MapLoader1').show();
                },
                complete: function () {
                    $('#MapLoader1').hide();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);
                }
            });
        }
    }

    function resetTime(getDate) {
        var sepTime = getDate.match(/(\d*)\/(\d*)\/(\d*)/i);
        return new Date(sepTime[1], sepTime[2], sepTime[3]).getTime();
    }

    function reset_datetime() {
        for (i = 0; i < mapLayerGroups.length; i++) {
            map.removeLayer(mapLayerGroups[i]);
        }

        // 20160410 fetch new data after startdate or enddate is changed
        // update only occur the start date or the end date is out of range of current date
        var currentDateTime = [resetTime(currentDateSelection[0]), resetTime(currentDateSelection[1])];
        var selectDateTime = [resetTime($("#startdate").val()), resetTime($("#enddate").val())];

        if (!(currentDateTime[0] <= selectDateTime[0] && selectDateTime[0] <= currentDateTime[1]
            && currentDateTime[0] <= selectDateTime[1] && selectDateTime[1] <= currentDateTime[1])) {
            currentDateSelection[0] = $("#startdate").val();
            currentDateSelection[1] = $("#enddate").val();
            refetchData();
        } else {
            setmarkers();
            resetslider();
            reloadmarker();
        }
    }

    var orgminval = calTimestamp(lasttwoyear.yyyymmdd());
    var orfmaxval = calTimestamp(todaydate.yyyymmdd());

    function resetslider() {    //重新設定slider           
        var minval = calTimestamp(document.getElementById('startdate').value)
        var maxval = calTimestamp(document.getElementById('enddate').value)
        if (maxval > minval) {
            dateSlider.noUiSlider.destroy();
            settings.range.min = minval;
            settings.range.max = maxval;
            settings.start = calTimestamp(document.getElementById('enddate').value)
            noUiSlider.create(dateSlider, settings);
            setIntervalvalue();

            //設定目前的值
            orgminval = minval;
            orfmaxval = maxval;
        } else {
            //把時間設定回去
            document.getElementById('startdate').value = formatDate(new Date(orgminval));
            document.getElementById('enddate').value = formatDate(new Date(orfmaxval));
            alert("結束時間應大於開始時間一日以上");
        }
    }

    $("#city_select").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            LoadMapData();

            $('#MapLoader1').hide();
        }, 0);
    });

    $("#imm_select").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            LoadMapData();

            $('#MapLoader1').hide();
        }, 0);
    });

    var lat_center, lon_center;

    // 20161126, 20170502 selcity or zoomlev must be initialized
    var zoomlev = defaultZoomlevel;

    function LoadMapData() {
        // 20160410 設定本土, 外來等
        if ($("#imm_select option:selected").val() != undefined) {
            immigration = $("#imm_select option:selected").val();
        }

        // 20161126 設定縣市, 預設為台北市
        // 20170502 設台南市、高雄市與屏東縣為預設
        selcity = defaultSelcity;
        zoomlev = defaultZoomlevel;

        if ($("#city_select option:selected").val() != undefined) {
            // 20160409 add cty combinations
            citycode = $("#city_select option:selected").val();
            selcity = $("#city_select option:selected").text();
        }

        // 20160409 set new city to use dedicated worker
        if (enableWorker == 1) {
            //geoworker.postMessage([citycode, immigration]);
            geoworker.postMessage([citycode, immigration, $("#startdate").val(), $("#enddate").val()]);
        }

        Object.keys(boundary).map(function (k) {
            if (selcity == boundary[k].cityname) {
                lat_center = boundary[k].center.split(",")[0];
                lon_center = boundary[k].center.split(",")[1];
                zoomlev = boundary[k].map_level;
            }
        });

        // 20160407 be used while shared worker does not work
		// 設定要讀取的GeoJson檔名
        village309_file = "data/dengue_layer/vill309.json";

        //Load Dengue Location Data by selected city
        // 2016/04/09 use dedicated worker to improve the performance
        if (enableWorker == 1) {
            geoworker.onmessage = function (e) {
                $('#MapLoader1').show();
                dengueGeoJSONData = e.data;
                mapdata = dengueGeoJSONData;
                CreateMap(dengueGeoJSONData);
                $('#MapLoader1').hide();
            }
        } else {
            $.ajax({
                type: "POST",
                url: "DengueData.asmx/GetDengueLocation",
                data: "{citycode:'" + citycode + "', immigration: '" + immigration + "', startDate: " + $("#startdate").val() + ", endDate: " + $("#enddate").val() + "}",
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                    mapdata = data;
                    CreateMap(data);
                },
                beforeSend: function () {
                    $('#MapLoader1').show();
                },
                complete: function () {
                    $('#MapLoader1').hide();
                },
                error: function (xhr, ajaxOptions, thrownError) {
                    alert(xhr.status);
                    alert(thrownError);
                }
            });
        }
    }

    function CreateMap(data) {
        if (data === null || data.d === 'undefined') {
            console.log('Web worker went error duing "CreateMap".');
            return;
        }

        if (map != undefined) {
            map.remove();
        }

        var latlng = L.latLng(lat_center, lon_center);

        var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        //var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamlhbmthaXdhbmciLCJhIjoiY2lqeG93bGVtMTc5ZHZva2lvdmQwazU3ciJ9.Hxnj3i_T20JH1kC_H1U2tA';
        var mbUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        // 20170807 : use css to cover the map layer
        var grayscale = L.tileLayer(mbUrl, { id: 'mapbox.outdoors', attribution: mbAttr }),
            //streets = L.tileLayer(mbUrl, { id: 'mapbox.streets', attribution: mbAttr });
            outdoors = L.tileLayer(mbUrl, { id: 'mapbox.outdoors', attribution: mbAttr });
            //satellite = L.tileLayer(mbUrl, { id: 'mapbox.satellite', attribution: mbAttr });

        map = L.map('map', {
            layers: [grayscale],
            fullscreenControl: true
        }).setView(latlng, zoomlev);

        baseLayers = {
            "Grayscale": grayscale,
            //"Streets": streets,
            "Outdoors": outdoors,
            //"Satellite": satellite
        };

        // 20170807 change map layer style
        map.on('baselayerchange', function (e) {
            if (e.name == "Grayscale" && (!$('#map').hasClass('grayscale'))) {
                $('#map').addClass('grayscale');
            } else if (e.name != "Grayscale" && $('#map').hasClass('grayscale')) {
                $('#map').removeClass('grayscale');
            }
        });

        var results = JSON.parse(data.d);

        var defaultstyle = {
            color: "#0066FF",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.2
        };


        $.ajaxSetup({
            async: false
        });

        // 20160422 update village 309 in Tainan and kaohsiung
		var village309layer = null;

		function showVillage309Layer(data) {
		    village309layer = L.geoJson(data, {
		        style: function (feature) {
		            switch (feature.properties.C_Name) {
		                case '高雄市': return { color: "#22B14C", weight: 1.5, opacity: 1, fillOpacity: 0.2 };
		                case '臺南市': return { color: "#0000ff", weight: 1.5, opacity: 1, fillOpacity: 0.2 };
		            }
		        },
		        filter: function (feature, layer) {
		            if (feature.properties) {
		                if (feature.properties.C_Name == selcity) {
		                    return true;
		                } else if (selcity == "台南市" && feature.properties.C_Name == "臺南市") {
		                    return true;
		                } else if (selcity == "台南市、高雄市與屏東縣" && (feature.properties.C_Name == "臺南市" || feature.properties.C_Name == "高雄市")) {
		                    return true;
		                }
		            }
		            return false;
		        },
		        onEachFeature: function (feature, layer) {
		            layer.on({
		                mouseover: vill309highlightFeature,
		                mouseout: villreset309Highlight,
		            });
		        }

		    });
		}

		if (enableWorker == 1) {
		    showVillage309Layer(village309JSONData);
		} else {
		    $.getJSON(village309_file, function (data) {
		        showVillage309Layer(data);
		    });
		}

        // 20160422 update village 309 in Tainan and Kaohsiung
        function vill309highlightFeature(e) {
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
            document.getElementById('locval').innerHTML = (layer.feature.properties.T_Name + layer.feature.properties.V_Name);
        }

        function villreset309Highlight(e) {
            var layer = e.target;
            layer.setStyle(defaultstyle);
            layer.setStyle(getDefaultStyle(e));
            if (!L.Browser.ie && !L.Browser.opera) {
                layer.bringToFront();
            }
            document.getElementById('locval').innerHTML = "";
        }

        // 20160422 reset the color after leaving the point
        function getDefaultStyle(layer) {
            switch (layer.target.feature.properties.C_Name) {
                case '高雄市': return { color: "#22B14C" };
                case '臺南市': return { color: "#0000ff" };
            }
        }

        var overlaymap = {
            "300里獎勵計畫里別": village309layer
        };
        L.control.layers(baseLayers, overlaymap).addTo(map);

        $.ajaxSetup({
            async: true
        });

        //將json資料讀到marker cluster
        geojson = {
            "type": "FeatureCollection",
            "features": []
        };
        Object.keys(results).map(function (k) {
            var datefliter = results[k].sickdate;
            var city_name = results[k].city_name;
            var town_name = results[k].town_name;
            var lat = results[k].lat;
            var lng = results[k].lng;
            var loccnt = results[k].count;
            var latlngarr = [lng, lat, loccnt];
            //var marker = L.marker(new L.LatLng(lat, lng), { time: datefliter });
            //marker_list.push(marker);
            if (lat != null && lng != null) {
                //alert(lat + ", " + lng)
                geojson.features.push({
                    "type": "Feature",
                    "properties": {
                        "sickdate": datefliter,  // "time": datefliter
                        "city": city_name,
                        "town": town_name
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": latlngarr
                    }
                });
            }
        });

        setmarkers();


        var legend = L.control({ position: 'topright' });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<div class="ui massive red label"><span class="example-val six wide field" id="datestep"></span></div>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        legend.addTo(map);

        var loclegend = L.control({ position: 'bottomleft' });
        loclegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<div style="font-size:40px;color:rgba(217,92,92,1);font-family: "微軟正黑體""><b id="locval"></b></div>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        loclegend.addTo(map);


        var dayslegend = L.control({ position: 'bottomright' });
        dayslegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<div class="legendtb"><div class="circle" style="background:#FF0000"><span class="legendtxt">發病日7天以內病例</span></div><br/><div class="circle" style="background:#FF8C00"><span class="legendtxt">發病日8-14天病例</span></div><br/><div class="circle" style="background:#FFD700"><span class="legendtxt">發病日15-30天病例</span></div><br/><div class="circle" style="background:#A9A9A9"><span class="legendtxt">發病日超過30天病例</span></div></div>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        dayslegend.addTo(map);

        //預設地圖上的開始時間
        $("#datestep").html(document.getElementById('enddate').value);

        $("#startdate").datepicker({
            dateFormat: 'yy/mm/dd',
            beforeShow: function () {
                setTimeout(function () {
                    $('.ui-datepicker').css('z-index', 99999999999999);
                }, 0);
            }
        });
        $("#enddate").datepicker({
            dateFormat: 'yy/mm/dd',
            beforeShow: function () {
                setTimeout(function () {
                    $('.ui-datepicker').css('z-index', 99999999999999);
                }, 0);
            }
        });

        $('.ui.checkbox').checkbox();


        // 20161223 : show current location button
        showCurrentLocationBtn();

        // 20180824 : add city, town, village buttons
        addLocBtns();
    }

    function setmarkers() {
        //計算天數
        var daycount = (calTimestamp(document.getElementById('enddate').value) - calTimestamp(document.getElementById('startdate').value) + 86400000) / 86400000;

        mapLayerGroups = [];
        dategroup = [];
        for (i = 0; i < daycount; i++) {
            var timestamp = calTimestamp(document.getElementById('startdate').value) + i * 86400000;
            var iday = formatDate(new Date(timestamp));  //format: yyyy/mm/dd

            //marker的設定
            var geojsonMarkerOptions = {
                radius: 5,
                fillColor: "red",
                color: "gray",
                weight: 0.5,
                opacity: 1,
                fillOpacity: 0.6
            };

            var maplayer = L.geoJson(geojson, {
                filter: function (feature, layer) {
                    if (feature.properties) {
                        if (feature.properties.sickdate == iday) {
                            return true;
                        }
                    }
                    return false;
                },
                pointToLayer: function (feature, latlng) {
                    return L.circleMarker(latlng, geojsonMarkerOptions);
                }
            });

            //設定脫離潛伏期病例的style
            if (i >= (daycount - 7)) {
                maplayer.setStyle({ fillColor: 'red' });
            }
            else if (i >= (daycount - 14)) {
                maplayer.setStyle({ fillColor: 'orange' });
            }
            else if (i >= (daycount - 30)) {
                maplayer.setStyle({ fillColor: 'yellow' });
            }
            else {
                maplayer.setStyle({ fillColor: 'gray' });
            }

            dategroup.push(iday);
            mapLayerGroups.push(maplayer);
            maplayer.addTo(map);
        }
    }

    LoadMapData();
});