function timestamp(str) {
    return new Date(str).getTime();
}

function formatDate(date) {
    return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate();
}

var months = [
        "1", "2", "3",
        "4", "5", "6", "7",
        "8", "9", "10",
        "11", "12"
];

function check_zero(d) {
    if (d > 0 && d < 10) {
        return '0' + d;
    } else {
        return d;
    }
}

var selcity = '台南市';
var layerlist = [];

// 20160421 update to avoid _leaflet_id error
function showMultiArea(data) {
    if ($("#city_select option:selected").val() != undefined) {
        selcity = $("#city_select option:selected").text();
    }

    layerlist = [];
    var stage;
    if (selcity == '台南市') {
        stage = ['第一期', '第二期', '第三期', '第四期', '第五期'];
    } else if (selcity == '高雄市') {
        stage = ['第一期', '第二期', '第三期', '第四期'];
    }

    for (i = 0; i < stage.length; i++) {
        var stagestr = stage[i].toString();
        var malayer = L.geoJson(data, {
            style: function (feature) {
                if (i == stage.length - 1) {
                    return { color: "gray", fillColor: "#EEEE00", weight: 1.5, opacity: 1, fillOpacity: 0.5 };
                } else {
                    return { color: "gray", fillColor: "#FFFF77", weight: 1.5, opacity: 1, fillOpacity: 0.5 };
                }
            },
            filter: function (feature, layer) {
                if (feature.properties) {
                    if (feature.properties.stage == stagestr && feature.properties.C_NAME103 == selcity) {
                        return true;
                    }
                }
                return false;
            },
            onEachFeature: function (feature, layer) {
                layer.bindLabel('孳生源加強查核區<br/>' + feature.properties.date + feature.properties.VILLAGE, { noHide: true });
                layer.on('click', function (e) {
                    var startdate = (feature.properties.date).split('-')[0];
                    var enddate = (feature.properties.date).split('-')[1];
                    areadate = convert_arardate(startdate, enddate);
                    showareaepi(e, areadate);
                });
            }
        });
        layerlist.push(malayer);
    }
}

function load_malayer() {

    if (getMalayerData != null) {
        showMultiArea(getMalayerData);
    } else {
        if (window.Worker) {
            malayerWorker.postMessage([]);
            malayerWorker.onmessage = function (e) {
                getMalayerData = e.data;
                showMultiArea(getMalayerData);
            }
        } else {
            $.getJSON("data/dengue_layer/臺南市及高雄市加強孳清.json", function (data) {
                getMalayerData = data;
                showMultiArea(getMalayerData);
            });
        }
    }
}

function convert_arardate(date1, date2) {
    var yystr1 = date1.toString().split('/')[0];
    var mmstr1 = date1.toString().split('/')[1];
    var ddstr1 = date1.toString().split('/')[2];

    var yystr2 = date2.toString().split('/')[0];
    var mmstr2 = date2.toString().split('/')[1];
    var ddstr2 = date2.toString().split('/')[2];

    var formatdate1 = timestamp(mmstr1 + "/" + ddstr1 + "/" + yystr1) + 8 * 60 * 60 * 1000;  //UTC +8 hours to fit timezone of Taipei
    var formatdate2 = timestamp(mmstr2 + "/" + ddstr2 + "/" + yystr2) + 8 * 60 * 60 * 1000;  //UTC +8 hours to fit timezone of Taipei

    var datediff = (formatdate2 - formatdate1) / 86400000;

    var daystr = '';
    for (d = 0; d <= datediff ; d++) {
        daystr += formatDate(new Date(formatdate1 + d * 86400000)) + ',';
    }

    return daystr;
}

function showareaepi(e, areadate) {
    $('#eip_modal').modal('show');
    var layer = e.target;
    var datelsit = areadate.split(',');
    var markerdate1 = datelsit[0];
    var town = layer.feature.properties.T_NAME103;
    var village = layer.feature.properties.V_NAME103;
    var villagestr = selcity + town + village;
    var title = selcity + town + village;

    $('#detail_tittle').html(title); //設定標題

    var startdate, villagestr, immigration;
    startdate = new Date(markerdate1.split('/')[0], markerdate1.split('/')[1] - 2, markerdate1.split('/')[2])  //往前推一個月時間

    var immigration = $("#imm_select option:selected").val();

    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString();
        var dd = this.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    };

    $.ajax({
        type: "POST",
        url: "DengueData.asmx/GetVillageData",
        data: "{startdate:'" + startdate.yyyymmdd() + "', villagestr:'" + villagestr + "', immigration:'" + immigration + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var flagtitle = '查', flagtxt = '孳生源加強查核';
            CreateChart(datelsit, flagtitle, flagtxt, data, villagestr.split(','));
        },
        beforeSend: function () {
            $('#MapLoader2').show();
        },
        complete: function () {
            $('#MapLoader2').hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });

}

//=====讀入'近一週噴藥村里'=====\
// 20160422 update to avoid _leaflet_id error
var allmarker = [];
var lastweeklayer;
var beforlayer;
var lastweekoption = { color: "gray", fillColor: "#5599FF", radius: 20, weight: 1.5, opacity: 1, fillOpacity: 0.5 };
var beforeoption = { color: "gray", fillColor: "#AFEEEE", radius: 15, weight: 1.5, opacity: 1, fillOpacity: 0.5 };

function drugWeekPosition(data) {
    var geojson = data;
    lastweeklayer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { riseOnHover: true, icon: L.AwesomeMarkers.icon({ icon: 'fa-bug', prefix: 'fa', markerColor: "green" }) });
        },
        filter: function (feature, layer) {
            //抓出所有時間和村里，放入陣列
            for (i = 0 ; i < (feature.properties.里別).split(' ').length ; i++) {
                allmarker.push([feature.properties.日期, '台南市' + feature.properties.區域 + (feature.properties.里別).split(' ')[i]]);
            }

            var today = new Date();
            var dataday = new Date(feature.properties.日期);
            var diffdays = (today - dataday) / 86400000;

            if (diffdays <= 7) {  //最近一週
                return true;
            }
            return false;
        },
        onEachFeature: function (feature, layer) {
            var popuhtml = popuphtm(layer);

            layer.bindLabel(popuhtml, { noHide: false });
            layer.on({
                click: showepi
            });
        }
    });

    beforlayer = L.geoJson(geojson, {
        pointToLayer: function (feature, latlng) {
            return L.marker(latlng, { riseOnHover: true, icon: L.AwesomeMarkers.icon({ icon: 'fa-bug', prefix: 'fa', markerColor: "darkgreen" }) })
        },
        filter: function (feature, layer) {
            var today = new Date();
            var dataday = new Date(feature.properties.日期);
            var diffdays = (today - dataday) / 86400000;

            if (diffdays >= 7) {  //一週前
                return true;
            }
            return false;
        },
        onEachFeature: function (feature, layer) {
            var popuhtml = popuphtm(layer);

            layer.bindLabel(popuhtml, { noHide: false });
            layer.on({
                click: showepi
            });
        }
    });
}

function loadDrupWeekPosData() {
    if (getDrugWeekData != null) {
        drugWeekPosition(getDrugWeekData);
    } else {
        if (enableWorker == 1) {
            drugweekWorker.postMessage([]);
            drugweekWorker.onmessage = function (e) {
                getDrugWeekData = e.data;
                drugWeekPosition(getDrugWeekData);
            }
        } else {
            $.getJSON("data/dengue_layer/噴藥點位.json", function (data) {
                getDrugWeekData = data;
                drugWeekPosition(getDrugWeekData);
            });
        }
    }
}

function popuphtm(layer) {
    var popuhtml = '<table class="ui very basic table"><tbody>';
    popuhtml += '<tr><td>日期</td><td>' + layer.feature.properties.日期 + '</td></tr>';
    popuhtml += '<tr><td>區域</td><td>' + layer.feature.properties.區域 + '</td></tr>';
    popuhtml += '<tr><td>里別</td><td>' + layer.feature.properties.里別 + '</td></tr>';
    popuhtml += '<tr><td>集合地點</td><td>' + layer.feature.properties.集合地點 + '</td></tr>';
    popuhtml += '<tr><td>噴工數</td><td>' + layer.feature.properties.噴工數 + '</td></tr>';
    popuhtml += '<tr><td>支援人力</td><td>' + layer.feature.properties.支援人力 + '</td></tr>';
    popuhtml += '</tbody></table>';

    return popuhtml;
}


function showepi(e) {
    $('#eip_modal').modal('show');

    var layer = e.target;
    var markerdate = layer.feature.properties.日期;
    var town = layer.feature.properties.區域;
    var village = layer.feature.properties.里別.split('-')[0];  //ex:金華里-A段,金華里-B段
    var vlist = new Array();
    vlist = village.split(' ');  //空格區分村里
    var villagestr = "";
    var title = '台南市' + town + '(';
    for (i = 0; i < vlist.length; i++) {
        if (i != (vlist.length - 1)) {
            villagestr += '台南市' + town + vlist[i] + ',';
            title += vlist[i] + ', ';
        } else {
            villagestr += '台南市' + town + vlist[i];
            title += vlist[i] + ')';
        }
    }

    $('#detail_tittle').html(title); //設定標題

    var startdate, villagestr, immigration;
    startdate = new Date(markerdate.split('/')[0], markerdate.split('/')[1] - 2, markerdate.split('/')[2])  //時間軸往前推一個月時間

    var immigration = $("#imm_select option:selected").val();

    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString();
        var dd = this.getDate().toString();
        return yyyy + (mm[1] ? mm : "0" + mm[0]) + (dd[1] ? dd : "0" + dd[0]);
    };

    $.ajax({
        type: "POST",
        url: "DengueData.asmx/GetVillageData",
        data: "{startdate:'" + startdate.yyyymmdd() + "', villagestr:'" + villagestr + "', immigration:'" + immigration + "'}",
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            var flagtitle = '藥', flagtxt = '噴藥';
            CreateChart([markerdate], flagtitle, flagtxt, data, villagestr.split(','));
        },
        beforeSend: function () {
            $('#MapLoader2').show();
        },
        complete: function () {
            $('#MapLoader2').hide();
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    });
}


function CreateChart(markerdate, flagtitle, flagtxt, data, villagearr) {
    var results = $.parseJSON(data.d);
    var series_obj = [];
    var plotBands = [];
    var colorobj = ['red', 'orange', 'yelolow', 'blue', 'green'];

    for (i = 0; i < villagearr.length; i++) {
        var datearr = Object.keys(results).map(function (k) {
            var vilstr = results[k].city + results[k].town + results[k].village;
            if (villagearr[i].indexOf(vilstr) > -1) { //符合村裡名稱的
                return [convertdate(results[k].sickdate), results[k].count];
            } else if (vilstr == 0) {  //沒有村裡資料(有日期)預設為0
                return [convertdate(results[k].sickdate), 0];
            }
        });
        datearr = datearr.filter(function (val) { return val !== undefined; }); //清掉空值
        var seriesid = 'dataseries' + i;

        //add epicurve
        series_obj.push({
            name: villagearr[i], data: datearr, type: 'spline', id: seriesid, color: colorobj[i]
        })


        //add flag
        var dataobj = [];
        var otherflag = [];
        for (j = 0; j < markerdate.length; j++) {
            dataobj.push({
                x: Date.UTC(markerdate[j].split('/')[0], markerdate[j].split('/')[1] - 1, markerdate[j].split('/')[2]),
                title: flagtitle,
                text: flagtxt + ' (' + villagearr[i] + ')'
            })

            //add plotBands
            if (flagtxt == "噴藥") {
                var addsevenday = new Date(markerdate[j]);
                addsevenday.setDate(addsevenday.getDate() + 7); //抓出7天的區間
                plotBands.push({
                    color: 'lightyellow', // Color value
                    from: Date.UTC(markerdate[j].split('/')[0], markerdate[j].split('/')[1] - 1, markerdate[j].split('/')[2]), // Start of the plot band
                    to: Date.UTC(addsevenday.getFullYear(), addsevenday.getMonth(), addsevenday.getDate()), // End of the plot band
                    label: {
                        text: '噴藥後7天',
                        align: 'center'
                    }
                });

                //取得相同村里其他日的噴藥資訊
                for (j = 0 ; j < allmarker.length; j++) {
                    var datestr = allmarker[j][0];
                    var townvil = allmarker[j][1];

                    var checkstr = villagearr[i];
                    if (checkstr == townvil && datestr != markerdate[j]) {  //不包含點選的噴藥點
                        otherflag.push({
                            x: Date.UTC(datestr.split('/')[0], datestr.split('/')[1] - 1, datestr.split('/')[2]),
                            title: flagtitle,
                            text: flagtxt + ' (' + townvil + ')'
                        });
                    }
                }
            } else if (flagtxt == '孳生源加強查核') {
                plotBands.push({
                    color: 'lightyellow', // Color value
                    from: Date.UTC(markerdate[0].split('/')[0], markerdate[0].split('/')[1] - 1, markerdate[0].split('/')[2]), // Start of the plot band
                    to: Date.UTC(markerdate[markerdate.length - 1].split('/')[0], markerdate[markerdate.length - 1].split('/')[1] - 1, markerdate[markerdate.length - 1].split('/')[2]), // End of the plot band
                    label: {
                        text: '孳生源加強查核',
                        align: 'center'
                    }
                });
            }

        }

        series_obj.push({
            type: 'flags',
            data: otherflag,
            shape: 'circlepin',
            onSeries: seriesid,
            width: 16,
            color: 'gray',
            fillColor: 'gray',
            style: { // text style
                color: 'white'
            }
        })

        series_obj.push({
            type: 'flags',
            data: dataobj,
            shape: 'circlepin',
            onSeries: seriesid,
            width: 16,
            color: colorobj[i],
            fillColor: colorobj[i],
            style: { // text style
                color: 'white'
            }
        })
    }

    function convertdate(datestr) {
        var yystr = datestr.toString().substr(0, 4);
        var mmstr = datestr.toString().substr(4, 2);
        var ddstr = datestr.toString().substr(6, 2);

        var formatdate = mmstr + "/" + ddstr + "/" + yystr;  //format: mm/dd/yy
        return end_timestamp(formatdate) + 8 * 60 * 60 * 1000;  // UTC +8 hours to fit timezone of Taipei 
    }

    //Loading Chart
    $('#chart_div').highcharts('StockChart', {
        chart:
        {
            height: 450,
            backgroundColor: { linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 }, stops: [[0, '#F0F0F0'], [1, '#F0F0F0']] },
            borderWidth: 0,
            borderColor: '#7B7B7B',
            plotBackgroundColor: '#FFFFFF',
            plotShadow: true,
            plotBorderWidth: 1,
            zoomType: 'x',
            marginRight: 60
        },

        title:
        {
            text: '',
            useHTML: true
        },
        xAxis:
        {
            title: { text: '發病日', y: 10, style: { height: '50px', color: '#000000', font: '16px 微軟正黑體' } },
            minTickInterval: 24 * 3600 * 1000,
            type: 'datetime',
            labels: { rotation: -90, style: { color: '#000000' } },
            gridLineWidth: 0,
            lineColor: '#000000',
            tickColor: '#000000',
            tickmarkPlacement: 'on',
            startOfWeek: 0,
            dateTimeLabelFormats: {
                week: '%a,<br/>%e. %b'
            },
            plotBands: plotBands
        },
        yAxis:
        {
            title: { text: '病例數', x: 30, style: { height: '50px', color: '#000000', font: '16px 微軟正黑體' } },
            min: 0,
            lineColor: '#000',
            lineWidth: 1,
            tickColor: '#000',
            tickWidth: 0,
            gridLineWidth: 1,
            alternateGridColor: null,
            minorTickInterval: null,
            labels: { style: { color: '#000' }, x: 27, formatter: function () { return this.value; } },
            plotLines: [{ value: 0, width: 0, color: '#FF0000' }],
            allowDecimals: false
        },
        legend:
        {
            itemStyle: { color: '#000000' },
            itemHoverStyle: { color: '#039' },
            itemHiddenStyle: { color: 'gray' },
            enabled: false
        },
        tooltip:
        {
            valueSuffix: '人',
            borderColor: '#7B7B7B',
        },
        labels: { style: { color: '#99b' } },
        navigation: { buttonOptions: { theme: { stroke: '#CCCCCC' } } },

        series: series_obj,
        plotOptions: {
            line: {
                marker: {
                    enabled: false,
                    radius: 2
                },
                lineWidth: 2
            },
            column: {},
            series: {
                pointPadding: -0.3
            }
        },

        exporting:
        {
            sourceWidth: 1300,
            enabled: true,
        },

        navigator: {
            maskFill: 'rgba(217,92,92,0.4)'
        },

        rangeSelector: {
            buttonTheme: {
                width: 50
            },
            inputDateFormat: '%Y/%m/%d',
            inputEditDateFormat: '%Y/%m/%d',
        },
    });
}