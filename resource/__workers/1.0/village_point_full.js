// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');

// define ajax function to fetch compressed json data and decompressd it
onmessage = function (e) {
	ajax('https://zone.cdc.gov.tw/map/geojson/cdcdengueVillagePoint.json', null, function (data) {
        // decompressed ../../../data/geojson/village_ori_point.json
        self.postMessage(data);
    }, 'GET');
}