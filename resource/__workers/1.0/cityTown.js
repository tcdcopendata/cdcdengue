importScripts('dwork_ajax.js');
var getCityTownData = null;

onmessage = function (e) {
    if (self.getCityTownData == null) {
        ajax('../../../data/geojson/citytown_comp.json', null, function (data) {
            //do something with the data like:
            self.getCityTownData = data;
            self.postMessage(self.getCityTownData);
        }, 'GET');
    } else {
        self.postMessage(self.getCityTownData);
    }
}      