/*  
 * desc : global scope
 */
var chartdata;

$(document).ready(function () {
    // Create a new date from a string, return as a timestamp.
    function start_timestamp(str) {
        return new Date(str).getTime();
    }

    function end_timestamp(str) {
        return new Date(str).getTime();
    }

    // Create a list of day and monthnames.
    var months = [
            "01", "02", "03",
            "04", "05", "06", "07",
            "08", "09", "10",
            "11", "12"
    ];

    function check_zero(d) {
        if (d > 0 && d < 10) {
            return '0' + d;
        } else {
            return d;
        }
    }

    // Create a string representation of the date.
    function formatDate(date) {
        return date.getFullYear() + "/" + months[date.getMonth()] + "/" + check_zero(date.getDate());
    }

    Date.prototype.yyyymmdd = function () {
        var yyyy = this.getFullYear().toString();
        var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
        var dd = this.getDate().toString();
        return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy; // padding
    };


    var dateSlider = document.getElementById('slider-date');
    var todaydate = new Date();

    var lasttwoyear = new Date();
    //lasttwoyear.setFullYear(lasttwoyear.getFullYear() - 1);  //預設為近一年資料
    lasttwoyear.setFullYear(2017, 0, 1);  // 自 2017/1/1 起

    var settings = {
        range: {
            min: start_timestamp(lasttwoyear.yyyymmdd()),  //個案數從1997/12/30開始出現，直接設定
            max: end_timestamp(todaydate.yyyymmdd())
        },
        behaviour: 'tap-drag',
        connect: true,
        step: 24 * 60 * 60 * 1000,

        start: [start_timestamp(lasttwoyear.yyyymmdd()), end_timestamp(todaydate.yyyymmdd())],

        format: wNumb({
            decimals: 0
        })
    };

    noUiSlider.create(dateSlider, settings);


    setIntervalvalue();
    function setIntervalvalue() {
        var dateValues = [
        document.getElementById('event-start'),
        document.getElementById('event-end')
        ];

        dateSlider.noUiSlider.on('update', function (values, handle) {
            dateValues[handle].innerHTML = formatDate(new Date(+values[handle]));
        });
    }

    var mapdata;


    var interval, citycode, gender, immigration;

    set_condition();
    LoadMapData();
    LoadChartData();

    function LoadMapData() {
        $.ajax({
            type: "POST",
            url: "DengueData.asmx/GetDengueData",
            data: "{interval:'" + interval + "', citycode:'" + citycode + "', gender:'" + gender + "', immigration: '" + immigration + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                mapdata = data;
                CreateMap(data,false);
            },
            beforeSend: function () {
                $('#MapLoader1').show();
            },
            complete: function () {
                $('#MapLoader1').hide();
            },
            error: function (xhr, ajaxOptions, thrownError) {
                alert("Data Request Error");
            }
        });
    }

    var map;
    function CreateMap(data,filtercheck) {
        var startday = $("#event-start").html().replace(/\//g, "");
        var endday = $("#event-end").html().replace(/\//g, "");

        if (map != undefined) { map.remove(); }

        var results = $.parseJSON(data.d);
        if (filtercheck == true) {   //時間調整才做filter
            results = $.grep(results, function (element, index) {
                return element.sickdate >= parseInt(startday, 10) && element.sickdate <= parseInt(endday, 10);  //filter
            });
        }

        var testData = {
            //max: 10,
            data: results
        };

        var baseLayer = L.tileLayer(
          'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
              maxZoom: 18
          }
        );

        var cfg = {
            "radius": .01,
            "maxOpacity": .5,
            "scaleRadius": true,
            "useLocalExtrema": true,
            latField: 'lat',
            lngField: 'lng',
            valueField: 'count'
        };
        var heatmapLayer = new HeatmapOverlay(cfg);
        map = new L.Map('heatmap', {
            center: new L.LatLng(22.631176, 120.339886),
            zoom: 9,
            layers: [baseLayer, heatmapLayer]
        });

        heatmapLayer.setData(testData);


        //執行marker cluster
        setMarkerCluster(results);

    }

    function LoadChartData() {
        $.ajax({
            type: "POST",
            url: "DengueData.asmx/GetAggreateData",
            data: "{interval:'" + interval + "', citycode:'" + citycode + "', gender:'" + gender + "', immigration: '" + immigration + "'}",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            success: function (data) {
                chartdata = data;
                CreateChart(data,false);
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

    function CreateChart(data,filtercheck) {
        var startday = $("#event-start").html().replace(/\//g, "");
        var endday = $("#event-end").html().replace(/\//g, "");

        var results = $.parseJSON(data.d);
        if (filtercheck == true) {   //時間調整才做filter
            results = $.grep(results, function (element, index) {
                return element.sickdate >= parseInt(startday, 10) && element.sickdate <= parseInt(endday, 10);  //filter
            });

            //sortResults('sickdate', true);
        }

        function sortResults(sickdate, asc) {
            results = results.sort(function (a, b) {
                if (asc) return (a[sickdate] > b[sickdate]) ? 1 : ((a[sickdate] < b[sickdate]) ? -1 : 0);
                else return (b[sickdate] > a[sickdate]) ? 1 : ((b[sickdate] < a[sickdate]) ? -1 : 0);
            });
        }

        

        //convert date and count json data to array
        var datearr = Object.keys(results).map(function (k) { return [convertdate(results[k].sickdate), results[k].count] });

        function convertdate(datestr) {
            var yystr = datestr.toString().substr(0, 4);
            var mmstr = datestr.toString().substr(4, 2);
            var ddstr = datestr.toString().substr(6, 2);

            var formatdate = mmstr + "/" + ddstr + "/" + yystr;  //format: mm/dd/yy
            return end_timestamp(formatdate) + 8 * 60 * 60 * 1000;  // UTC +8 hours to fit timezone of Taiiei 
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

            },
            yAxis:
            {
                title: { text: '病例數', x:30, style: { height: '50px', color: '#000000', font: '16px 微軟正黑體' } },
                min: 0,
                lineColor: '#000',
                lineWidth: 1,
                tickColor: '#000',
                tickWidth: 0,
                gridLineWidth: 1,
                alternateGridColor: null,
                minorTickInterval: null,
                labels: { style: { color: '#000' }, x:27,  formatter: function () { return this.value; } },
                plotLines: [{ value: 0, width: 0, color: '#FF0000' }]

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

            series: [{
                name: '確定病例', type: 'areaspline', data: datearr, color: 'rgba(217,92,92,1)',
                dataGrouping: {
                    approximation: "sum"
                }
            }],
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

    var timer;
    function set_condition() {
        //set slider event
        document.getElementById('slider-date').noUiSlider.on('change', function () {
            window.clearTimeout(timer);
            $('#MapLoader1').show();
            timer = window.setTimeout(function () {
                $('#MapLoader1').hide();

                CreateMap(mapdata, true);
                CreateChart(chartdata, true);
            }, 0);
        });

        QueryCondition(); //預設查詢條件
        $('#searchsubmit').click(function () {
            QueryCondition();
          
            window.clearTimeout(timer);
            $('#MapLoader1').show();
            timer = window.setTimeout(function () {
                $('#MapLoader1').hide();

                LoadMapData();
                LoadChartData();
            }, 0);
        });

        function QueryCondition() {
            var serachstr = '';

            //時間年度條件
            var intialdate;
            interval = $("#interval_select option:selected").val();
            if (interval == '0') {
                intialdate = start_timestamp(lasttwoyear.yyyymmdd());
            } else if (interval == '1') {
                intialdate = start_timestamp("01/01/1998");
            }

            //重新設定slider開始---------------------------------------------------
            var dateSlider = document.getElementById('slider-date');
            dateSlider.noUiSlider.destroy();
            var settings = {
                // Create two timestamps to define a range.
                range: {
                    min: intialdate,  //個案數從1997/12/30開始出現，直接設定
                    max: end_timestamp(todaydate.yyyymmdd())
                },
                behaviour: 'tap-drag',
                connect: true,
                step: 24 * 60 * 60 * 1000,
                start: [intialdate, end_timestamp(todaydate.yyyymmdd())],

                format: wNumb({
                    decimals: 0
                })
            };
            // Create a slider with the new options.                     
            noUiSlider.create(dateSlider, settings);

            document.getElementById('slider-date').noUiSlider.on('change', function () {    
                window.clearTimeout(timer);
                $('#MapLoader1').show();
                timer = window.setTimeout(function () {
                    $('#MapLoader1').hide();

                    CreateMap(mapdata, true);
                    CreateChart(chartdata, true);
                }, 0);
            });

            slidervalue(intialdate, end_timestamp(todaydate.yyyymmdd()));
            //重新設定slider結束---------------------------------------------------

            //縣市條件
            citycode = $("#city_select option:selected").val();
            serachstr += $("#city_select option:selected").text();

            //性別條件
            gender = $("#gender_select option:selected").val();
            serachstr += " / " + $("#gender_select option:selected").text();

            //本土or境外條件
            immigration = $("#imm_select option:selected").val();
            serachstr += " / " + $("#imm_select option:selected").text();

            $('#conditstr').html(serachstr);
        };

        Date.prototype.yyyymmdd = function () {
            var yyyy = this.getFullYear().toString();
            var mm = (this.getMonth() + 1).toString(); // getMonth() is zero-based
            var dd = this.getDate().toString();
            return (mm[1] ? mm : "0" + mm[0]) + "/" + (dd[1] ? dd : "0" + dd[0]) + "/" + yyyy; // padding
        };
    }

    function slidervalue(startvalue, endvalue) {
        dateSlider.noUiSlider.set([startvalue, endvalue]);
        setIntervalvalue();
    }

    var clustermap;
    function setMarkerCluster(results) {
        if (clustermap != undefined) { clustermap.remove(); }

        var tiles = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        }),
        latlng = L.latLng(22.631176, 120.339886);

        clustermap = L.map('clustermap', { center: latlng, zoom: 9, layers: [tiles] });

        var markers = L.markerClusterGroup();
        var markersList = [];
        var m;

        //將jason資料讀到marker cluster
        Object.keys(results).map(function (k) {
            var lat = results[k].lat;
            var lng = results[k].lng;
            var loccnt = results[k].count;
            var latlngarr = [lng, lat];
            geoJsonFeature = {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": latlngarr
                    }
                }
                ]
            };
            m = L.geoJson(geoJsonFeature, {
                pointToLayer: function (feature, latlng) {
                    return L.marker(latlng);
                }
            });
            markersList.push(m);
            markers.addLayer(m);
        });

        clustermap.addLayer(markers);
    }
});