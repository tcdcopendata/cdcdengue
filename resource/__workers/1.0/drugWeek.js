// import ajax
importScripts('dwork_ajax.js');
importScripts('../../lzstring/1.4.4/lz-string.js');
var drugWeekData = null;

// data is little so that no necessary to use compression techniques
onmessage = function (e) {
    if (self.drugWeekData == null) {
        ajax('../../../data/dengue_layer/噴藥點位_comp.json', null, function (data) {
            self.drugWeekData = JSON.parse(LZString.decompressFromUTF16(data));
            self.postMessage(self.drugWeekData);
        }, 'GET');
    } else {
        self.postMessage(self.drugWeekData);
    }
}