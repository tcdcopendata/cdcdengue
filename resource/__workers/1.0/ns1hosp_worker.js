// import ajax
importScripts('dwork_ajax.js');

// define ajax function to fetch compressed json data and decompressd it
var ns1hosploc = "";

// use shared worker
onmessage = function (e) {
    if (self.ns1hosploc.length < 1) {
        ajax('../../../data/ns1/ns1hosp_20160603_lzstring.json', null, function (data) {
            self.ns1hosploc = data;
            self.postMessage(self.ns1hosploc);
        }, 'GET');
    } else {
        self.postMessage(self.ns1hosploc);
    }
};