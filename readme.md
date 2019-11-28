# 安裝登革熱地圖

本系統後端由.net建置，前端由leaflet.js、jquery、semantic-UI、noUislider...等套件所組成。使用者於安裝後可以檢視登革熱地圖與就醫資訊，本系統提供資訊如下所示：
1. 聚集警示: 可檢視病例聚集區域
2. 動態地圖: 透過動態地圖方式檢視登革熱病例蔓延情形。
3. 蚊媒地圖: 提供病媒蚊風險警示，並以統計表格與動畫影片方式檢視蚊媒警示變化。
4. 病例趨勢: 提供不同選項來進行病例查詢，並利用圖表的方式檢視資料。
5. 境外移入: 提供各國移入趨勢，並顯示目前該國之重要疫情資訊。
6. 快篩院所: 提供使用者點選來尋找快篩院所的位置與基本資料。
7. 資料說明: 針對本系統簡易說明資料來源與更新頻率。

## 安裝
* 開一個visual studio .Net 專案在本機端。
```
檔案>新增>專案
選擇 ASP.NET Core Web 應用程式
```

* 下載專案，並將其放置專案中。
* 根據.aspx檔案，下載所需之前端套件放到對應的資料夾中
```
根據前端檔案下載前端套件於資料夾resource中:
路徑如下:
/resource/bootstrap/
/resource/font-awesome/
/resource/footable/
/resource/highcharts/
/resource/intro/
/resource/jquery/
/resource/jquery-ui/
/resource/leaflet/
/resource/lzstring/
/resource/noUiSlider/
/resource/seed/
/resource/Semantic-UI/
/resource/turf/
```
* 啟動即可使用
