// desc : start to fetch data by date, not to take all data
var getData = {};

// desc : 
// 20161126 set taipei city as the default county
// 20170930 add new taipei city and set it as the default county
self.getData['01'] = "";
self.getData['05'] = "";
self.getData['03'] = "";
self.getData['07'] = "";
self.getData['43'] = "";
self.getData['31'] = "";

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
    if (self.getData[e.data[0]] == "") {
        // redis-server
        var sentData = { "operation" : "GetDengueClusterCODE1", "citycode" : e.data[0] };
        postJsonAjax("https://epimap.cdc.gov.tw/cdcdengue", sentData, function (data) {
            self.getData[e.data[0]] = JSON.parse(data);
            self.postMessage(JSON.parse(data));
        });
        /*
        // default web service
        var sentData = { citycode: e.data[0] };
        postJsonAjax("/DengueData.asmx/GetDengueClusterCODE1", sentData, function (data) {
            self.getData[e.data[0]] = JSON.parse(data);
            self.postMessage(JSON.parse(data));
        });
        */
    } else {
        self.postMessage(self.getData[e.data[0]]);
    }
}