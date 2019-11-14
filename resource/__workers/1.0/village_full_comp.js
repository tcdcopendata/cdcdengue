// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');

// define ajax function to fetch compressed json data and decompressd it
onmessage = function (e) {
	ajax('../../../data/geojson/village_ori_comp.json', null, function (data) {
        // decompressed '../../../data/geojson/village_ori_comp.json'
        self.postMessage(LZString.decompressFromUTF16(data));
		//self.postMessage(data);
    }, 'GET');
}