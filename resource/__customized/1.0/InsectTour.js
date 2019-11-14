function setNav() {
	document.getElementById("city_select").setAttribute("data-intro", "選擇查詢的縣市");
	document.getElementById("city_select").setAttribute("data-step", "1");

	document.getElementById("villagebutton").setAttribute("data-intro", "顯示選擇縣市村里的風險示警");
	document.getElementById("villagebutton").setAttribute("data-step", "2");

	document.getElementsByClassName("leaflet-control-layers-toggle")[0].setAttribute("data-intro", "開啟來選擇底圖、村里圖層、風險示警指標圖例");
	document.getElementsByClassName("leaflet-control-layers-toggle")[0].setAttribute("data-step", "3")

	document.getElementById("searchAddress").setAttribute("data-intro", "輸入欲查詢的位置");
	document.getElementById("searchAddress").setAttribute("data-step", "4");

	document.getElementById("searchButton").setAttribute("data-intro", "定位於輸入的位置");
	document.getElementById("searchButton").setAttribute("data-step", "5");

	document.getElementById("statistic_button").setAttribute("data-intro", "危險級里別列表與南高屏總調查里數資訊");
	document.getElementById("statistic_button").setAttribute("data-step", "6");

}


function navStart() {
	introJs().start();
}