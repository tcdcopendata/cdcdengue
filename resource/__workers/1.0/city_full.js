// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');

// define ajax function to fetch compressed json data and decompressd it
onmessage = function (e) {
    ajax('../../../data/geojson/city_full_comp.json', null, function (data) {
        // decompressed
        self.postMessage(LZString.decompressFromUTF16(data));
    }, 'GET');
}