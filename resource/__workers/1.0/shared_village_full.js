// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');

// define ajax function to fetch compressed json data and decompressd it
var villageFull = null;
function getFullJsonInfo() {
    ajax('../../../data/geojson/village_full_comp.json', null, function (data) {
	   // decompressed
	   villageFull = LZString.decompressFromUTF16(data);
	}, 'GET');
}
getFullJsonInfo();

// use shared worker
onconnect = function(e) {
	if(e.ports && e.ports.length > 0) {
		var selfPort = e.ports[0];
		selfPort.onmessage = function() {
			// direct copy the villageFull data back to the front end page
			selfPort.postMessage(villageFull);
		}
	}
};

