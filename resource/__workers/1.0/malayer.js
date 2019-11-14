// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');
var saveMalayer = null;

// data is little so that no necessary to use compression techniques
onmessage = function (e) {
    if (self.saveMalayer == null) {
        ajax('../../../data/dengue_layer/臺南市及高雄市加強孳清_comp.json', null, function (data) {
            self.saveMalayer = JSON.parse(LZString.decompressFromUTF16(data));
            self.postMessage(self.saveMalayer);
        }, 'GET');
    } else {
        self.postMessage(self.saveMalayer);
    }
}