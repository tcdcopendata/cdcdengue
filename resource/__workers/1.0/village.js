importScripts('dwork_ajax.js');
var getVillageData = null;

onmessage = function (e) {
    if (self.getVillageData == null) {
        ajax('../../../data/geojson/village_comp.json', null, function (data) {
            //do something with the data like:
            self.getVillageData = data;
            self.postMessage(self.getVillageData);
        }, 'GET');
    } else {
        self.postMessage(self.getVillageData);
    }
}