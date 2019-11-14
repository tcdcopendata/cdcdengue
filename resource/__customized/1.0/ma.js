// 20160418 use dedicated worker instead of shared worker due to the support of IE
var enableWorker = 0;

// cityJSONData, townJSONData and villageJSONData are json objects
var cityJSONData = null;
var townJSONData = null;
var villageJSONData = null;
var dengueGeoJSONData = null;
var geodataworker = null;

// 20160418 update to refetch data
var immigration = "0";
var citycode = '05';
var currentDateSelection = ['2016/01/01', '2017/12/31'];

// 20160421 update
var lat_center, lon_center, selcity = '台南市', city_file, town_file, village_file;

if (window.Worker) {
    var cityworker = new Worker('resource/__workers/1.0/city_full.js');
    var citytownworker = new Worker('resource/__workers/1.0/cityTown_full.js');
    var villageworker = new Worker('resource/__workers/1.0/village_full.js');
    geodataworker = new Worker('resource/__workers/1.0/shared_GETGEO.js');

    cityworker.postMessage([]);
    citytownworker.postMessage([]);
    villageworker.postMessage([]);

    cityworker.onmessage = function (e) {
        cityJSONData = JSON.parse(e.data);
    }

    citytownworker.onmessage = function (e) {
        townJSONData = JSON.parse(e.data);
    }

    villageworker.onmessage = function (e) {
        villageJSONData = JSON.parse(e.data);
    }

    enableWorker = 1;
}

// 20160422 update to prevent _leaflet_id error
var enableWorker = 0;
var malayerWorker = null;
var drugweekWorker = null;
var getMalayerData = null;
var getDrugWeekData = null;

if (window.Worker) {
    malayerWorker = new Worker('resource/__workers/1.0/malayer.js');
    malayerWorker.postMessage([]);
    malayerWorker.onmessage = function (e) {
        getMalayerData = e.data;
    }
    drugweekWorker = new Worker('resource/__workers/1.0/drugWeek.js');
    drugweekWorker.postMessage([]);
    drugweekWorker.onmessage = function (e) {
        getDrugWeekData = e.data;
    }
    enableWorker = 1;
} else {
    $.getJSON("data/dengue_layer/臺南市及高雄市加強孳清.json", function (data) {
        getMalayerData = data;
    });
    $.getJSON("data/dengue_layer/噴藥點位.json", function (data) {
        getDrugWeekData = data;
    });
}

function start_timestamp(str) {
    return new Date(str).getTime();
}

function end_timestamp(str) {
    return new Date(str).getTime();
}

// Create a string representation of the date.
function formatDate(date) {
    return date.getFullYear() + "/" + months[date.getMonth()] + "/" + check_zero(date.getDate());
}

// Create a list of day and monthnames.
var months = [
        "01", "02", "03",
        "04", "05", "06", "07",
        "08", "09", "10",
        "11", "12"
];

function check_zero(d) {
    if (d > 0 && d < 10) {
        return '0' + d;
    } else {
        return d;
    }
}

var map;
var mapLayerGroups = [];
var dategroup = [];
var geojson;
var timer;

$(document).ready(function () {

    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        return yyyy + "/" + (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]); // padding
    };

    var todaydate = new Date();
    var lasttwoyear = new Date();
    //lasttwoyear.setDate(lasttwoyear.getDate() - 14);  //往前推14天
    lasttwoyear.setFullYear(2017, 0, 1);  // 20170817 重設日期為 2017/01/01


    //設定起始時間的顯示
    document.getElementById('startdate').value = lasttwoyear.yyyymmdd();
    document.getElementById('enddate').value = todaydate.yyyymmdd();

    if (document.getElementById('datestep') != undefined) {
        document.getElementById('datestep').innerHTML = todaydate.yyyymmdd();
    }
    

    function reloadmarker() {
        var mindatindex = dategroup.indexOf(document.getElementById('startdate').value);
        var platstep = dategroup.indexOf(document.getElementById('enddate').value);

        var dateindex = platstep;
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

    $("#startdate").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            $('#MapLoader1').hide();

            reset_datetime();
        }, 0);
    });

    $("#enddate").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            $('#MapLoader1').hide();

            reset_datetime();
        }, 0);
    });

    // 20160421 fetch data after startdate or enddate is changed
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
        geodataworker.postMessage([citycode, immigration, $("#startdate").val(), $("#enddate").val()]);

        if (enableWorker == 1) {
            geodataworker.onmessage = function (e) {
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

        // 20160421 fetch new data after startdate or enddate is changed
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

    var orgminval = start_timestamp(lasttwoyear.yyyymmdd());
    var orfmaxval = end_timestamp(todaydate.yyyymmdd());
    function resetslider() {    //重新設定slider           
        var minval = start_timestamp(document.getElementById('startdate').value)
        var maxval = end_timestamp(document.getElementById('enddate').value)
        if (maxval > minval) {
            if (document.getElementById('datestep') != undefined) {
                document.getElementById('datestep').innerHTML = document.getElementById('enddate').value;
            }           
        } else {
            //把時間設定回去
            document.getElementById('startdate').value = formatDate(new Date(orgminval));
            document.getElementById('enddate').value = formatDate(new Date(orfmaxval));
            alert("結束時間應大於開始時間一日以上");
        }
    }

   
    LoadMapData();
    $("#city_select").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            load_malayer();
            LoadMapData();
            $('#MapLoader1').hide();
        }, 0);
    });

    $("#imm_select").change(function () {
        window.clearTimeout(timer);
        $('#MapLoader1').show();
        timer = window.setTimeout(function () {
            load_malayer();
            LoadMapData();
            $('#MapLoader1').hide();
        }, 0);
    });

    //var lat_center, lon_center, selcity, city_file, town_file, village_file;
    var zoomlev = 12;
    function LoadMapData() {
        // 20160418 update, move immgration to the top
        if ($("#imm_select option:selected").val() != undefined) {
            immigration = $("#imm_select option:selected").val();
        }

        // 20160418 update, move selcity to the top
        if ($("#city_select option:selected").val() != undefined) {
            citycode = $("#city_select option:selected").val();
            selcity = $("#city_select option:selected").text();
        }

        // 20160421 update to use webworker
        // not to post in the first time to avoid re-postmessage
        if (enableWorker == 1) {
            geodataworker.postMessage([citycode, immigration, $("#startdate").val(), $("#enddate").val()]);
        }

        //設定縣市中心點
        var boundary = [
            {
                "cityname": "台南市",
                "center": "23.008265,120.211707",
                "map_level": 12
            },
            {
                "cityname": "高雄市",
                "center": "22.640458,120.314034",
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

        //設定要讀取的GeoJson檔名
        city_file = "data/geojson/city.json";
        town_file = "data/geojson/citytown.json";
        village_file = "data/geojson/village.json";

        if (enableWorker == 1) {
            geodataworker.onmessage = function (e) {
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
                data: "{citycode:'" + citycode + "', immigration: '" + immigration + "', startDate: '2016/04/04', endDate: '2016/04/18' }",
                //data: "{citycode:'" + citycode + "', immigration: '" + immigration + "'}",
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
        if (map != undefined) {
            map.remove();
        }

        var latlng = L.latLng(lat_center, lon_center);

        var mbAttr = 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors';
        //var mbUrl = 'https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiamlhbmthaXdhbmciLCJhIjoiY2lqeG93bGVtMTc5ZHZva2lvdmQwazU3ciJ9.Hxnj3i_T20JH1kC_H1U2tA';
        var mbUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        var grayscale = L.tileLayer(mbUrl, { id: 'mapbox.light', attribution: mbAttr });
        //var streets = L.tileLayer(mbUrl, { id: 'mapbox.streets', attribution: mbAttr });
        var outdoors = L.tileLayer(mbUrl, { id: 'mapbox.outdoors', attribution: mbAttr });
        //var satellite = L.tileLayer(mbUrl, { id: 'mapbox.satellite', attribution: mbAttr });

        map = L.map('map', {
            layers: [grayscale],
            fullscreenControl: true
        }).setView(latlng, zoomlev);

        var baseLayers = {
            "Grayscale": grayscale,
            //"Streets": streets,
            "Outdoors": outdoors,
            //"Satellite": satellite
        };

        var results = $.parseJSON(data.d);

        var defaultstyle = {
            color: "#0066FF",
            weight: 1.5,
            opacity: 1,
            fillOpacity: 0.1
        };

        // 20170807 change map layer style
        map.on('baselayerchange', function (e) {
            if (e.name == "Grayscale" && (!$('#map').hasClass('grayscale'))) {
                $('#map').addClass('grayscale');
            } else if (e.name != "Grayscale" && $('#map').hasClass('grayscale')) {
                $('#map').removeClass('grayscale');
            }
        });

        
        $.ajaxSetup({
            async: false
        });

        //=====讀入縣市邊界=====
        // 20160421 use worker
        function showCityLayer(data) {
            citylayer = L.geoJson(data, {
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
                        }
                    }
                    return false;
                }
            });
        }

        var citylayer;
        if (enableWorker == 1) {
            showCityLayer(cityJSONData);
        } else {
            $.getJSON(city_file, function (data) {
                showCityLayer(data);
            });
        }

        //=====讀入鄉鎮邊界=====
        // 20160421 use worker
        var townlayer;

        function showTownLayer(data) {
            townlayer = L.geoJson(data, {
                style: function (feature) {
                    return defaultstyle;
                },
                filter: function (feature, layer) {
                    if (feature.properties) {
                        if (feature.properties.COUNTYNAME == selcity) {
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

        if (enableWorker == 1) {
            showTownLayer(townJSONData);
        } else {
            $.getJSON(town_file, function (data) {
                showTownLayer(data);
            });
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

        //=====讀入村里邊界=====
        // 20160421 use worker
        var villagelayer;

        function showVillageLayer(data) {
            villagelayer = L.geoJson(data, {
                style: function (feature) {
                    return defaultstyle;
                },
                filter: function (feature, layer) {
                    if (feature.properties) {
                        if (feature.properties.COUNTY == selcity) {
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
        }

        if (enableWorker == 1) {
            showVillageLayer(villageJSONData);
        } else {
            $.getJSON(village_file, function (data) {
                showVillageLayer(data);
            });
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

        // 20160422 update to avoid _leaflet_id error 
        var showOnceFlag = 0;
        function showCounty() {
            if (showOnceFlag == 1) { return; }
            if (selcity == '台南市') {
                var overlaymap = {
                    "9/23-9/25 孳生源加強查核區": layerlist[0],
                    "10/3-10/5 孳生源加強查核區": layerlist[1],
                    "10/9-10/11 孳生源加強查核區": layerlist[2],
                    "10/15-10/17 孳生源加強查核區": layerlist[3],
                    "10/24-10/28 孳生源加強查核區": layerlist[4],
                    "近一週噴藥村里": lastweeklayer,
                    "一週以前噴藥村里": beforlayer,
                    "縣市界": citylayer,
                    "鄉鎮界": townlayer,
                    "村里界": villagelayer
                };
                map.addLayer(layerlist[layerlist.length - 1]);
                map.addLayer(lastweeklayer);
                L.control.layers(baseLayers, overlaymap, { collapsed: false }).addTo(map);
            } else if (selcity == '高雄市') {
                var overlaymap = {
                    "10/14-10/15 孳生源加強查核區": layerlist[0],
                    "10/21-10/22 孳生源加強查核區": layerlist[1],
                    "10/28-10/29 孳生源加強查核區": layerlist[2],
                    "11/6-11/8 孳生源加強查核區": layerlist[3],
                    "縣市界": citylayer,
                    "鄉鎮界": townlayer,
                    "村里界": villagelayer
                };
                map.addLayer(layerlist[layerlist.length - 1]);
                L.control.layers(baseLayers, overlaymap, { collapsed: false }).addTo(map);
            }
            showOnceFlag = 1;
        }

        // 20160422 make sure all data prepared ready for showing on the map
        // due to function would be equally called
        // the showCounty() function must be called after (1) malayer and (2) drugWeek data already prepared
        // the map will be shown after patient points fetched completely

        if (getDrugWeekData != null) {
            // 噴藥資料已取得
            drugWeekPosition(getDrugWeekData);
            if (getMalayerData != null) {
                // 孳清資料取得
                showMultiArea(getMalayerData);
                showCounty();
            } else {
                // 孳清資料未取得
                if (enableWorker == 1) {
                    // 有支援 web worker
                    malayerWorker.postMessage([]);
                    malayerWorker.onmessage = function (e) {
                        getMalayerData = e.data;
                        showMultiArea(getMalayerData);
                        showCounty();
                    }
                } else {
                    // 沒有支援 web worker
                    $.getJSON("data/dengue_layer/臺南市及高雄市加強孳清.json", function (data) {
                        getMalayerData = data;
                        showMultiArea(getMalayerData);
                        showCounty();
                    });
                }
            }
        } else {
            // 噴藥資料未取得
            if (enableWorker == 1) {
                // 有支援 web worker
                drugweekWorker.postMessage([]);
                drugweekWorker.onmessage = function (e) {
                    getDrugWeekData = e.data;
                    drugWeekPosition(getDrugWeekData);

                    if (getMalayerData != null) {
                        // 已取得孳清資料
                        showMultiArea(getMalayerData);
                        showCounty();
                    } else {
                        // 未取得孳清資料
                        malayerWorker.postMessage([]);
                        malayerWorker.onmessage = function (e) {
                            getMalayerData = e.data;
                            showMultiArea(getMalayerData);
                            showCounty();

                            // 20160422 to make sure all data working correctly
                            window.location.reload();
                        }
                    }
                }
            } else {
                // 不支援 web worker
                $.getJSON("data/dengue_layer/噴藥點位.json", function (data) {
                    getDrugWeekData = data;
                    drugWeekPosition(getDrugWeekData);
                    if (getMalayerData != null) {
                        // 已取得孳清資料
                        showMultiArea(getMalayerData);
                        showCounty();
                    } else {
                        // 未取得孳清資料
                        $.getJSON("data/dengue_layer/臺南市及高雄市加強孳清.json", function (data) {
                            getMalayerData = data;
                            showMultiArea(getMalayerData);
                            showCounty();
                        });
                    }
                });
            }
        }

        $.ajaxSetup({
            async: true
        });

        //將jason資料讀到marker cluster
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


        var legend = L.control({ position: 'bottomleft' });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<div class="ui massive red label"><span class="example-val six wide field" id="datestep"></span></div>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        legend.addTo(map);
        document.getElementById('datestep').innerHTML = todaydate.yyyymmdd();

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
            var htmstr = '<div class="legendtb"><h4>確定病例</h4>';
            htmstr += '<i class="circle icon" style="color:#FF0000"></i>發病日7天以內病例</br>';
            htmstr += '<i class="circle icon" style="color:#FF8C00"></i>發病日8-14天病例</br>';
            htmstr += '<i class="circle icon" style="color:#FFD700"></i>發病日15-30天病例</br>';
            htmstr += '<i class="circle icon" style="color:#A9A9A9"></i>發病日超過30天病例</br>';
            htmstr += '</div>';
            div.innerHTML = htmstr;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        dayslegend.addTo(map);


        //專案里、訓練、合格、近一周噴藥的legend
        var malegend = L.control({ position: 'bottomright' });
        malegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var htmstr = '<div class="legendtb">';
            htmstr += '<i class="stop icon" style="color:#FFD700"></i>孳生源加強查核區</br>';
            htmstr += '<i class="bug icon" style="background:rgb(114,175,38); color: white"></i>近一週噴藥村里</br>';
            htmstr += '<i class="bug icon" style="background:rgb(114,130,36); color: white"></i>一週以前噴藥村里';
            htmstr += '</div>';
            div.innerHTML = htmstr;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        malegend.addTo(map);
    }

    // parse start date
    $("#startdate").datepicker({
        dateFormat: 'yy/mm/dd',
        beforeShow: function () {
            setTimeout(function () {
                $('.ui-datepicker').css('z-index', 99999999999999);
            }, 0);
        }
    });

    // parse end date
    $("#enddate").datepicker({
        dateFormat: 'yy/mm/dd',
        beforeShow: function () {
            setTimeout(function () {
                $('.ui-datepicker').css('z-index', 99999999999999);
            }, 0);
        }
    });
});

function setmarkers() {
    //計算天數
    var daycount = (end_timestamp(document.getElementById('enddate').value) - start_timestamp(document.getElementById('startdate').value) + 86400000) / 86400000;
    
    mapLayerGroups = [];
    dategroup = [];
    for (i = 0; i < daycount; i++) {
        var timestamp = start_timestamp(document.getElementById('startdate').value) + i * 86400000;
        var iday = formatDate(new Date(timestamp));  //format: yyyy/mm/dd

        //marker的設定
        var geojsonMarkerOptions = {
            radius: 3,
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

