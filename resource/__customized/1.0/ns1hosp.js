// ------------------------------------------------------
// description : try to show hospitals providing NS1 test

// geo json feature
/* var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "臺南市東區衛生所",
		"add": "臺南市東區林森路一段418號",
		"phone": "06-2673613",
		"id": "2321010013",
		"code": "05"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [120.2220434489, 22.9850122077]
    }
}; */

// function usage
// showNS1Hosp(['05','07','43']);
// ------------------------------------------------------

function prepareNS1PupContent(getObj) {
	var htmlContent = "";
	htmlContent += '<div class="ui grid" style="font-size: 16px;">';
	htmlContent += '<div class="one column row">';
	htmlContent += '<div class="sixteen wide column" style="text-align: center;">NS1試劑配置醫療院所</div>';
	htmlContent += '</div>';
	htmlContent += '<div class="one column row">';
    htmlContent += '<div class="sixteen wide column"><i class="fa fa-h-square" aria-hidden="true"></i>&nbsp;&nbsp;' + getObj.properties.hospName + '</div>';
	htmlContent += '</div>';
	htmlContent += '<div class="one column row">';
    htmlContent += '<div class="sixteen wide column"><i class="fa fa-map-marker" aria-hidden="true"></i>&nbsp;&nbsp;' + getObj.properties.hospAddress + '</div>';
	htmlContent += '</div>';
	htmlContent += '<div class="one column row">';
    htmlContent += '<div class="sixteen wide column"><i class="fa fa-phone-square" aria-hidden="true"></i>&nbsp;&nbsp;' + getObj.properties.hospTel + '</div>';
	htmlContent += '</div>';
	htmlContent += '<div class="one column row">';
    htmlContent += '<div class="sixteen wide column">看診時段:&nbsp;<a href="https://www1.nhi.gov.tw/QueryN/Query3_Detail.aspx?HospID=' + getObj.properties.hospID + '" target=_blank>網頁連結</a></div>';
	htmlContent += '</div>';
	htmlContent += '</div>';
	return htmlContent;
}

// ns1 icon design
var ns1hospIcon = L.icon({
	iconUrl: 'data/images/ns1hosp.png',
	iconSize: [16, 16],
	iconAnchor: [0, 0],
	popupAnchor: [0, 0]
});

// popon setting
var customOptions =
{
	'maxWidth': '500',
	'minWidth': '200',
	'className' : 'custom'
}

// each features
function showHospName(e) {
    var layer = e.target;
    document.getElementById('locval').innerHTML = (layer.feature.properties.hospName);
}

function missHospName(e) {
    document.getElementById('locval').innerHTML = "";
}

// start to load data	
var featureCollections = [];
var ns1MapLayer = null;

function showNS1Hosp(getCityCode) {
    ns1MapLayer = L.geoJson(featureCollections, {
		// icon
		pointToLayer: function (feature, latlng) {
			return L.marker(latlng, {icon: ns1hospIcon});
		},
        filter: function (feature, layer) {
            if (getCityCode.indexOf(feature.properties.code) > -1 || getCityCode == "all") {
                // 20180809 : add ns1 to all counties
				return true;
			} else {
				// not to show the point
				return false;
			}
		},
		onEachFeature: function (feature, layer) {
		    // show the content
		    if (feature.properties) {
		        layer.bindPopup(prepareNS1PupContent(feature), customOptions);
		    }
		    // mouse over
		    layer.on({
		        mouseover: showHospName,
		        mouseout: missHospName,
		    });
		}
	}).addTo(map);
}	

// decompress data
function decompressData(getCompressData) {
    // json.parse transform string into json object
    var getPlainData = JSON.parse(LZString.decompressFromUTF16(getCompressData));
	for(var item = 0 ; item < getPlainData.features.length ; item ++) {
		featureCollections.push(getPlainData.features[item]);
	}
    // add the NS1 button
	$('#mainNavBar').append('<a id="ns1btn" class="item"><i class="hospital icon"></i>快篩院所</a>');

    // NS1 醫院按鈕
	$('#ns1btn').click(function () {
	    addNS1Loc("default");
	});
}

// 20160527 show NS1 hospital location
function addNS1Loc(option) {
    switch (option) {
        case "initial":
            if ($('#ns1btn').attr('class').split(" ").indexOf("active") > -1) {
                $('#ns1btn').removeClass("active");
                map.removeLayer(ns1MapLayer);
            }
            break;
        default:
            if ($('#ns1btn').attr('class').split(" ").indexOf("active") > -1) {
                $('#ns1btn').removeClass("active");
                map.removeLayer(ns1MapLayer);
            } else {
                $('#ns1btn').addClass("active");
                if ($('#city_select').val().indexOf("-") > -1) {
                    // TimeMap.aspx
                    showNS1Hosp($('#city_select').val().split("-"));
                } else {
                    // DengueCluster.aspx
                    showNS1Hosp([$('#city_select').val()]);
                }
                
            }
            break;
    }
}

var getNS1HospWorker = null;

if (window.Worker) {
    getNS1HospWorker = new Worker('resource/__workers/1.0/ns1hosp_worker.js');
    getNS1HospWorker.postMessage([])
}

$(function () {
    if (window.Worker) {
        getNS1HospWorker.onmessage = function (e) {
            decompressData(e.data);
        }
    } else {
        // fetch ns1 geo json compressed data
        $.ajax({
            dataType: "text",
            url: "data/ns1/ns1hosp_20160603_lzstring.json",
            success: function (LZdata) { decompressData(LZdata); }
        });
    }
})

// ------------------------------------------------------


