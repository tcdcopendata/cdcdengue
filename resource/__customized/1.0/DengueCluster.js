var map;
var geojson;

// 20160409 use dedicated worker to replace shared worker due to the support of IE
var enableWorker = 0;
var lastestClusterData = null;
var getLastestClusterworder = null;
var checkLayer = null;

// 20170502 default settings
var defaultCitycode = "07";
var defaultCityName = "高雄市";
var selcity = defaultCityName;

if (window.Worker) {
    getLastestClusterworder = new Worker('resource/__workers/1.0/clusterLastestCode1.js');

    // desc : get all city information
    // 20161126 : set the default county is taipei city
    // 20170502 : set the default county to kaohsiung city
    getLastestClusterworder.postMessage([defaultCitycode]);

    getLastestClusterworder.onmessage = function (e) {
        lastestClusterData = e.data;
    }

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

// 2017/08/04 add fetching single code1 area for the latest clustering area
function fetchCode1Area(getCityCode, getCode1, getVillage) {
    if (getCityCode in saveCenterAreaInfo) {
        getGeoAreaData = saveCenterAreaInfo[getCityCode];
    } else {
        // use redis cached database
        $.ajax({
            type: "POST",
            url: "https://epimap.cdc.gov.tw/cdcdengue",
            data: '{ "operation" : "getGeoArea" , "getCityCode" : "' + getCityCode + '" , "getCode1" : "' + getCode1 + '" }',
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                getGeoAreaData = JSON.parse(data["d"]);
                getGeoAreaData["properties"]["VILLAGE"] = getVillage;
                saveCenterAreaInfo[getCityCode] = getGeoAreaData;
            },
            error: function (xhr, ajaxOptions, thrownError) {
                $('#MapLoader1').hide();
                console.log("Sending json data to web method is error.(" + xhr.status + ": " + thrownError + ")");
            },
            beforeSend: function () {
                $('#MapLoader1').show();
            },
            complete: function () {
                $('#MapLoader1').hide();
            }
        });
    }
}

/*
 * desc : set the location to the center of the map
 */
function setNewCenter() {
    var newCenter = null;
    mapLayer = L.geoJson(getGeoAreaData, {
        onEachFeature: function (feature, layer) {
            //onEachFeaturePup(feature,layer);
            layer.on({
                mouseover: villhighlightFeature,
                mouseout: villresetHighlight,
            });
        }
    }).addTo(map);
    switch ($("#city_select option:selected").val()) {
        case "05":
            newCenter = L.latLng(getGeoAreaData["geometry"]["coordinates"][0][0][0][1], getGeoAreaData["geometry"]["coordinates"][0][0][0][0]);
            break;
        default:
            newCenter = L.latLng(getGeoAreaData["geometry"]["coordinates"][0][0][1], getGeoAreaData["geometry"]["coordinates"][0][0][0]);
            break;
    }

    map.setView(newCenter, 14);
}

$(document).ready(function () {
    var lat_center, lon_center;
    var latlng;
    var zoomlev = 13;
    var data;
    var citycode;
    LoadMapData();

    /*
     * desc : load the map data
     */
    function LoadMapData() {

        if ($("#city_select option:selected").val() != undefined) {
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
            }
        ]

        Object.keys(boundary).map(function (k) {
            if (selcity == boundary[k].cityname) {
                lat_center = boundary[k].center.split(",")[0];
                lon_center = boundary[k].center.split(",")[1];
                zoomlev = boundary[k].map_level;
            }
        });

        $.ajax({
            type: "POST",
            url: "DengueData.asmx/GetDengueCluster",
            data: "{citycode:'" + citycode + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
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


    /*
     * desc : start the service
     */
    function CreateMap(data) {

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
            fullscreenControl: true
        }).setView(latlng, zoomlev);

        var baseLayers = {
            "Grayscale": grayscale,
            //"tmcwmap": tmcwmap,
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

        $.ajaxSetup({
            async: false
        });

        // 讀取集中區json資料
        var geojson = $.parseJSON(data.d);
        var ClusterLayer = L.geoJson(geojson, {
            style: function (feature) {
                return { color: "gray", fillColor: "#EEEE00", weight: 1.5, opacity: 1, fillOpacity: 0.5 };
            },
            onEachFeature: function (feature, layer) {
                var areahtm = '病例聚集區域<br/>所轄區域：' + layer.feature.properties.TOWN + layer.feature.properties.VILLAGE + '<br/>發病日兩週內病例數：' + layer.feature.properties.COUNT;
                // 20161128 : only leaflet 0.7.7 would be allowed due to leaflet.label.js
                layer.bindLabel(areahtm, { noHide: true });
            }
        });

        // set control layer
        var overlaymap = {
            "病例聚集區域": ClusterLayer
        };

        map.addLayer(ClusterLayer);
        L.control.layers(baseLayers, overlaymap).addTo(map);

        $.ajaxSetup({
            async: true
        });

        // 集中區legend
        var legend = L.control({ position: 'bottomright' });
        legend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var htmstr = '<div class="legendtb">';
            htmstr += '<i class="stop icon" style="color:#EEEE00"></i>病例聚集區域</br>';
            htmstr += '<i style="font-size: 12px;"></i>近兩週發病病例數≥2之一級發布區<br/>';
            htmstr += '(由內政部定義人口數約450人之區域)<br/>';
            htmstr += '有關病例分布請見<a href="TimeMap.aspx">動態地圖</a>';
            htmstr += '</div>';
            div.innerHTML = htmstr;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        legend.addTo(map);

        // 區域文字
        var loclegend = L.control({ position: 'bottomleft' });
        loclegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            div.innerHTML = '<div style="font-size:40px;color:rgba(217,92,92,1);font-family: "微軟正黑體""><b id="locval"></b></div>';
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            return div;
        };
        loclegend.addTo(map);

        // 縣市下拉選單
        var citylegend = L.control({ position: 'topright' });
        citylegend.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var control_htm = '<select id="city_select" class="ui fluid dropdown" style="font-size: 15px;" onchange="javascript: addNS1Loc(\'initial\');">';
            control_htm += '<option value="01">台北市</option>';
            control_htm += '<option value="31">新北市</option>';
            control_htm += '<option value="03">台中市</option>';
            control_htm += '<option value="07">高雄市</option>';
            control_htm += '<option value="05">台南市</option>';
            control_htm += '<option value="43">屏東縣</option>';
            control_htm += '</select>';

            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        citylegend.addTo(map);
        $("#city_select").val(citycode);
        $("#city_select").change(function () {
            // change the county
            LoadMapData();
        });

        // GeoJSON Data download button
        var downloadbtn = L.control({ position: 'bottomleft' });
        downloadbtn.onAdd = function (map) {
            var div = L.DomUtil.create('div', 'info legend');
            var control_htm = ' <div id="download_json" class="ui teal icon button" style="font-color: white;"><i><img src="data/images/GeoJSON_icon.png" style="width:40px"></img></i><br/>GeoJSON</div>';
            div.innerHTML = control_htm;
            div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
            L.DomEvent.disableClickPropagation(div);
            return div;
        };
        downloadbtn.addTo(map);
        $("#download_json").click(function () {
            var link = 'https://data.cdc.gov.tw/dataset/dengue-case-clustering-area-2w';
            window.open(link);
        });


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
        var json = $.parseJSON(data.d);
        var features = json.features;
        town_i = 0;
        $.each(features, function (k, feature) {
            if ($.inArray(features[k].properties.TOWN, town_name) == -1) {
                town_val = 0;
                town_count = 0;
                town_p = {
                    id: "id_" + town_i,
                    name: features[k].properties.TOWN,
                    color: getRandomColor()  //隨機顏色
                };
                village_i = 0;
                $.each(features, function (m, feature) {
                    if ($.inArray(features[m].properties.VILLAGE, village_name) == -1 && features[m].properties.TOWN == features[k].properties.TOWN) {
                        village_val = 0;
                        village_count = 0;
                        village_p = {
                            id: town_p.id + "_" + village_i,
                            name: features[m].properties.VILLAGE,
                            parent: town_p.id
                        };
                        unit_i = 0;
                        $.each(features, function (n, feature) {
                            if ((features[n].properties.TOWN + features[n].properties.VILLAGE) == (features[k].properties.TOWN + features[m].properties.VILLAGE)) {
                                unit_p = {
                                    id: village_p.id + "_" + unit_i,  //id
                                    parent: village_p.id,  //上一層id
                                    name: features[n].properties.CODE1,  //code
                                    lat: features[n].properties.lat,  //中心點緯度
                                    lon: features[n].properties.lon,  //中心點經度
                                    parentvillage: features[k].properties.TOWN + features[m].properties.VILLAGE,  //所屬村里
                                    value: +features[n].properties.COUNT  //病例數
                                };
                                village_val += unit_p.value;
                                town_val += unit_p.value;
                                points.push(unit_p);
                                unit_i = unit_i + 1;

                                //加總集中區個數
                                village_count = village_count + 1;
                                town_count = town_count + 1;

                            }
                        });
                        village_name.push(features[m].properties.VILLAGE);
                        village_p.value = village_val;
                        village_p.count = village_count;
                        points.push(village_p);
                        village_i = village_i + 1;
                    }
                });
                town_name.push(features[k].properties.TOWN);
                town_p.value = town_val;
                town_p.count = town_count;
                points.push(town_p);
                town_i = town_i + 1;
            }
        });

        //判斷是否有病例聚集區
        if (points.length > 0) {
            $('#treemap').show();
            $('#msg').hide();

            var mouseOverLayer;
            $('#treemap').highcharts({
                chart:
                {
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    events: {
                        redraw: function () {
                            map.setView(latlng, zoomlev);  //reset lat, lon, level
                        }
                    }
                },
                series: [{
                    type: "treemap",
                    layoutAlgorithm: 'squarified',
                    allowDrillToNode: true,
                    dataLabels: {
                        enabled: false
                    },
                    levelIsConstant: false,
                    levels: [{
                        level: 1,
                        dataLabels: {
                            enabled: true
                        },
                        borderWidth: 3
                    }],
                    data: points,
                    turboThreshold: 9999,   //default is 1000，當超過1000個時，系統會錯誤而無法顯示，故調整此設定
                    tooltip: {
                        pointFormatter: function () {
                            if (this.count != null) {
                                return '<b>' + this.name + '</b><br/>病例聚集區域數：' + this.count + '<br/>聚集區域加總病例數：' + this.value;
                            } else {
                                return this.name + '<br/>所轄區域：' + this.parentvillage + '<br/>發病日兩週內病例數：' + this.value;
                            }
                        }
                    },
                }],
                plotOptions: {
                    treemap: {
                        dataLabels: {
                            formatter: function () {
                                return '<b>' + this.point.name + '</b>';
                            },
                            style: { font: 'bold 16px Trebuchet MS, Verdana, sans-serif, 微軟正黑體' }
                        },
                    },
                    series: {
                        point: {
                            events: {
                                mouseOver: function () {
                                    //alert(JSON.stringify(geojson));
                                    //alert(this.name);
                                    var thisname = this.name;
                                    mouseOverLayer = L.geoJson(geojson, {
                                        style: function (feature) {
                                            if (feature.properties.TOWN == thisname || feature.properties.VILLAGE == thisname || feature.properties.CODE1 == thisname) {
                                                // set the map center
                                                map.setView(
                                                    [feature.geometry.coordinates[0][0][1], feature.geometry.coordinates[0][0][0]],
                                                14);
                                                return { color: "#0000FF", weight: 1, opacity: 1, fillOpacity: 0.5 };
                                            } else {
                                                return { color: "#0000FF", weight: 1, opacity: 0, fillOpacity: 0 };
                                            }
                                        }
                                    });

                                    map.addLayer(mouseOverLayer);
                                },
                                mouseOut: function () {
                                    map.removeLayer(mouseOverLayer);
                                },
                                click: function () {
                                    if (this.lat != null && this.lon != null) {
                                        map.setView([this.lat, this.lon], 16);  //set lat, lon, level
                                    }
                                },
                            }
                        }

                    }
                },
                title: {
                    text: selcity + '病例聚集區域統計',
                    style: { font: 'bold 18px Trebuchet MS, Verdana, sans-serif, 微軟正黑體' }
                }
            });
        } else {
            $('#treemap').hide();
            $('#msg').show();

            // 20160426 show the final clustering code1 and date
            getLastestClusterworder.postMessage([$("#city_select option:selected").val()]);
            getLastestClusterworder.onmessage = function (e) {

                getCode1DetailInfo = JSON.parse(e.data.d);

                // 20161127 : prevent geojson data is not updated in open data
                var checkDate = new Date(
                    getCode1DetailInfo[0]['sick_date'].substring(4, 6) + '/' +
                    getCode1DetailInfo[0]['sick_date'].substring(6, 8) + '/' +
                    getCode1DetailInfo[0]['sick_date'].substring(0, 4)
                );

                var currentDate = new Date();
                var timeDiff = Math.abs(currentDate.getTime() - checkDate.getTime());
                var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

                if (diffDays > 14) {
                    var htmstr = '';

                    // 20171012 : remove the notification
                    //htmstr = ' <div class="ui huge info message">';
                    //htmstr += '<i class="yellow star icon"></i>';
                    //htmstr += selcity + '近兩週無病例聚集區域<br>';
                    //htmstr += '</div>';
                    htmstr += '<div class="ui huge info message"><i class="black marker icon"></i>';

                    // 20171012 : modify the text information
                    if (getCode1DetailInfo[0]['village'] !== undefined && getCode1DetailInfo[0]['village'] != null) {
                        htmstr += selcity;
                        htmstr += '最近一次聚集事件發生於' + getCode1DetailInfo[0]['town'] + getCode1DetailInfo[0]['village'] + '的一級發布區：';
                    }
                    if (getCode1DetailInfo[0]['code1'] !== undefined && getCode1DetailInfo[0]['code1'] != null) {
                        htmstr += '<a class="setCenterView" onclick="javascript: setNewCenter();">' + getCode1DetailInfo[0]['code1'] + '</a>';
                    }

                    var endDate = new Date(checkDate.getTime() + 14 * 24 * 60 * 60 * 1000);
                    if (getCode1DetailInfo[0]['sick_date'] !== undefined && getCode1DetailInfo[0]['sick_date'] != null) {
                        htmstr += '，事件起始日期為 ' + getCode1DetailInfo[0]['sick_date'] + '。';
                    }
                    if (getCode1DetailInfo[0]['village'] !== undefined && getCode1DetailInfo[0]['village'] != null
                        && getCode1DetailInfo[0]['code1'] !== undefined && getCode1DetailInfo[0]['code1'] != null) {
                        // 20160511 add code1 area
                        fetchCode1Area($("#city_select option:selected").val(), getCode1DetailInfo[0]['code1'], getCode1DetailInfo[0]['village']);
                    }
                    htmstr += '</div>';
                    $('#msg').html(htmstr);
                } else {
                    var htmstr = '';
                    htmstr += '<div class="ui huge info message"><i class="black marker icon"></i>';
                    if (getCode1DetailInfo[0]['village'] !== undefined && getCode1DetailInfo[0]['village'] != null) {
                        htmstr += '最近一次聚集事件發生於 ';
                        htmstr += getCode1DetailInfo[0]['county'] + ' 所轄區域 ' + getCode1DetailInfo[0]['town'] + getCode1DetailInfo[0]['village'] + ' 的一級發布區 ';
                    }
                    if (getCode1DetailInfo[0]['code1'] !== undefined && getCode1DetailInfo[0]['code1'] != null) {
                        htmstr += '<a class="setCenterView" onclick="javascript: setNewCenter();">' + getCode1DetailInfo[0]['code1'] + '</a>';
                    }
                    if (getCode1DetailInfo[0]['sick_date'] !== undefined && getCode1DetailInfo[0]['sick_date'] != null) {
                        htmstr += ' ，事件起始日期為 ' + getCode1DetailInfo[0]['sick_date'];
                    }
                    htmstr += ' ，發病日兩週內病例數 ' + getCode1DetailInfo[0]['ttl_determined_cnt'] + ' 。';
                    if (getCode1DetailInfo[0]['village'] !== undefined && getCode1DetailInfo[0]['village'] != null
                        && getCode1DetailInfo[0]['code1'] !== undefined && getCode1DetailInfo[0]['code1'] != null) {
                        // 20160511 add code1 area
                        fetchCode1Area($("#city_select option:selected").val(), getCode1DetailInfo[0]['code1'], getCode1DetailInfo[0]['village']);
                    }
                    htmstr += '</div>';
                    $('#msg').html(htmstr);
                }
            }
        }

        // 20161223 : show current location button
        showCurrentLocationBtn();

        // 20180824 : add city, town, village buttons
        addLocBtns();
    }
});
