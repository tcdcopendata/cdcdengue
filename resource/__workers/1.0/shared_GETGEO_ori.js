// use lz-string
importScripts('../../lzstring/1.4.4/lz-string.js');

var sentData = { citycode: '-1', immigration: '-1' };
var getData = null;

function postJsonAjax(url, sentdata, success) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        if (xhr.status === 200) {
            return success(xhr.responseText);
        }
    }
    xhr.send(JSON.stringify(sentdata));
}

onmessage = function (e) {
    if (e.data[0] != self.sentData.citycode || e.data[1] != self.sentData.immigration) {
        self.sentData.citycode = e.data[0];
        self.sentData.immigration = e.data[1];
        postJsonAjax("/DengueData.asmx/GetDengueLocation", self.sentData, function (data) {
            self.getData = JSON.parse(data);
            self.postMessage(self.getData);
        });
    } else {
        self.postMessage(self.getData);
    }
}