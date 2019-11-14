// start to fetch data by date, not to take all data
// 20170806 : only the first time to fetch cached data 

var sentData = { };
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

function __formatMDHMS(getValue) {
    return (getValue < 10 ? '0' + getValue : getValue);
}

onmessage = function (e) {
    // redis cached database prepared from 2015/01/01
    // 20180809 : remove the cache due to the order
    var allCachedCountries = ["05-07-43", "07", "31", "01-31", "01", "all", "05", "43", "03"];
    if (
        (allCachedCountries.indexOf(e.data[0]) > -1) &&
        parseInt(e.data[1]) == 0 &&
        new Date("2014/12/31").getTime() < new Date(e.data[2]).getTime()
    ) {
        self.sentData = { "operation": "GetDengueLocation", "citycode": "-1", "immigration": "-1", "startDate": "", "endDate": "" };
        self.sentData.citycode = e.data[0];
        self.sentData.immigration = e.data[1];
        self.sentData.startDate = new Date(e.data[2]).getFullYear() + "/" + __formatMDHMS((new Date(e.data[2])).getMonth() + 1) + "/01";
        self.sentData.endDate = new Date().getFullYear() + "/" + __formatMDHMS(new Date().getMonth() + 1) + "/" + __formatMDHMS(new Date().getDate());

        //postJsonAjax("https://epimap.cdc.gov.tw/cdcdengue", self.sentData, function (data) {
        postJsonAjax("/DengueData.asmx/GetDengueLocation", self.sentData, function (data) {
            self.getData = JSON.parse(data);
            self.postMessage(self.getData);
        });
    } else {
        self.sentData = { citycode: '-1', immigration: '-1', startDate: '2018/07/01', endDate: '2018/08/09' };
        self.sentData.citycode = e.data[0];
        self.sentData.immigration = e.data[1];
        self.sentData.startDate = e.data[2];
        self.sentData.endDate = e.data[3];

        postJsonAjax("/DengueData.asmx/GetDengueLocation", self.sentData, function (data) {
            self.getData = JSON.parse(data);
            self.postMessage(self.getData);
        });
    }
}