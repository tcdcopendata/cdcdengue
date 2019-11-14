/*
* desc : get / remove current location
* call : DengueCluster.aspx, TimeMap.aspx, MasterPage.Master
* inpt : none
* oupt : none
*/
var crtLocFlag = [];
//var crtLocCFlag = [];
var operateLocFlag = 0;

function showCurrentLocation() {

    // add the marker and circle
    function onLocationFound(e) {
        var radius = e.accuracy / 2;
        crtLocFlag.push(new L.marker(e.latlng).addTo(map));
        //crtLocCFlag.push(new L.circle(e.latlng, radius).addTo(map));
    }

    function onLocationError(e) {
        alert(e.message);
    }

    map.on('locationfound', onLocationFound);
    map.on('locationerror', onLocationError);

    map.locate({ setView: true, maxZoom: 16 });

    operateLocFlag = (operateLocFlag + 1) % 2;
}

function removeCurrentLocation() {
    
    // remove the marker
    while (crtLocFlag.length > 0) {
        for (var i = 0 ; i < crtLocFlag.length ; i++) {
            map.removeLayer(crtLocFlag[i]);
            crtLocFlag.splice(crtLocFlag.indexOf(crtLocFlag[i]), 1);
        }
    }

    /*
    // remove the circle
    while (crtLocCFlag.length > 0) {
        for (var i = 0 ; i < crtLocCFlag.length ; i++) {
            map.removeLayer(crtLocCFlag[i]);
            crtLocCFlag.splice(crtLocCFlag.indexOf(crtLocCFlag[i]), 1);
        }
    }
    */

    operateLocFlag = (operateLocFlag + 1) % 2;
}

function onLocationError() {
    alert('Get current location error.');
}

function operateCurrentLocation() {

    // clear first
    removeCurrentLocation();

    // ready for showing
    showCurrentLocation();
}



/**
 * desc: retrieve input address
 */
function __retrieveInputAddress() {
	var address = $($('input#searchAddress')[0]).val();
	if (address.length < 2) { return; }
	$.ajax({
		url: 'https://bites.cdc.gov.tw/api/geocoding?addr=' + address,
		type: 'get',
		data: {},
		error: function (xhr, ajaxOptions, thrownError) {
			console.log(xhr.status + " " + thrownError + ". Cannot connect to /api/geocoding.");
		},
		success: function (response) {
			if (response["status"] == "success") {
				removeCurrentLocation();
				crtLocFlag.push(new L.marker(response["response"]).addTo(map));
				map.setView(response["response"], 14);
			} else {
				console.log(response["response"]);
			}
		}
	});
}

/*
* desc : execution after loading
*/
function showCurrentLocationBtn() {
	if (window.jQuery && $('#map').length > 0) {
		var crtPosLoc = L.control({ position: 'topleft' });
		crtPosLoc.onAdd = function (map) {
			var div = L.DomUtil.create('div', 'leaflet-control-zoom leaflet-bar leaflet-control');
			div.style.backgroundColor = 'white';
			var control_htm = '<a class="leaflet-control-zoom-in" href="#map" onclick="javascript: operateCurrentLocation();" title="定位"><i class="small location arrow icon"></i></a>';
			div.innerHTML = control_htm;
			div.firstChild.onmousedown = div.firstChild.ondblclick = L.DomEvent.stopPropagation;
			L.DomEvent.disableClickPropagation(div);
			return div;
		};
			crtPosLoc.addTo(map);
		
	}
}

/*
* desc : clear the cache
*/
function clearCache() {
    window.location.reload(true);
}