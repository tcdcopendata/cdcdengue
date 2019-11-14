// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');
var village309Data = null;

// data is little so that no necessary to use compression techniques
onmessage = function (e) {
    if (self.village309Data == null) {
        ajax('../../../data/dengue_layer/vill309_comp.json', null, function (data) {
            self.village309Data = JSON.parse(LZString.decompressFromUTF16(data));
            self.postMessage(self.village309Data);
        }, 'GET');
    } else {
        self.postMessage(self.village309Data);
    }
}