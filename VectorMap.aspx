<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="VectorMap.aspx.cs" Inherits="Dengue_Info.InsectCluster" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
	<link href="resource/footable/footable.standalone.css" rel="stylesheet">
    <link rel="stylesheet" href="resource/leaflet/1.0.0-rc1/leaflet.css"  />
    <link rel="stylesheet" href="resource/__customized/1.0/InsectCluster.css"  />
    <link rel="stylesheet" href="resource/noUiSlider/8.0.2/nouislider.min.css" />
	<link rel="stylesheet" href="resource/intro/introjs.css"  />
	
	<script src="resource/leaflet/1.0.0-rc1/leaflet.js"></script>
    <script src="resource/highcharts/4.2.5/highcharts.js"></script>
    <script src="resource/highcharts/4.2.5/treemap.js"></script>
    <script src="resource/highcharts/4.2.5/exporting.js"></script> 
    <script src="resource/Semantic-UI/2.0.3/semantic.min.js"></script>
    <script src="resource/noUiSlider/8.0.2/wNumb.js"></script>
    <script src="resource/noUiSlider/8.0.2/nouislider.min.js"></script>
    <script src="resource/lzstring/1.4.4/lz-string.js"></script> 
    <script src="resource/__customized/1.0/InsectCluster.js"></script> 
    <script src="resource/__customized/1.0/Insectarea.js"></script>
    <script src="resource/__customized/1.0/ns1hosp.js"></script>
	<script src='resource/turf/turf.min.js'></script>
   	<script src="resource/intro/intro.js"></script>
	<script src="resource/footable/footable.js"></script>
	<script src="resource/__customized/1.0/InsectTable.js"></script>
	<script src="resource/__customized/1.0/InsectTour.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container">
        <div id="pagemessage" class="ui message" >
            <div class="ui form" >
                <!-- style="margin-right: 30px;margin-left: 10px;margin-bottom: 10px" 
                <div id="scroll_Loader" class="ui active dimmer">
                    <div class="ui large  text loader">Loading</div>
                </div> -->
                <div class="ui column doubling stackable grid">
                    <div class="two wide column">
                        <select id="city_select" class="ui fluid disabled dropdown">
                            <option value="00">請選擇</option>
                            <option value="07">高雄市</option>
                            <option value="05">台南市</option>
                            <option value="43">屏東縣</option>
                            <option value="01">台北市</option>
                            <option value="31">新北市</option>
                            <option value="03">台中市</option>
                            <option value="32">桃園市</option>
                            <option value="11">基隆市</option>
                            <option value="34">宜蘭縣</option>
                            <option value="12">新竹市</option>
                            <option value="33">新竹縣</option>
                            <option value="35">苗栗縣</option>
                            <option value="37">彰化縣</option>
                            <option value="38">南投縣</option>
                            <option value="39">雲林縣</option>
                            <option value="22">嘉義市</option>
                            <option value="40">嘉義縣</option>
                            <option value="45">花蓮縣</option>
                            <option value="46">台東縣</option>
                            <option value="44">澎湖縣</option>
                            <option value="90">金門縣</option>
                            <option value="91">連江縣</option>
                        </select>

                    </div>
                    <div class="four wide column">
                        
                            <select id="Week_select" class="ui fluid disabled dropdown">
                                <option value="0">前五週</option>
                                <option value="1">前四週</option>
                                <option value="2">前三週</option>
                                <option value="3">前二週</option>
                                <option value="4">前一週</option>
                            </select>
                  
                        
                    </div>
                    <div class="two wide column">
                        <div class="ui large red label" style="text-align:center;margin-bottom: 5px;margin-bottom: 5px;width:100%"><span class="example-val six wide field" id="datestep">週別標籤</span></div>    
                         <div style="display: none;">
                            <div id="loopcheck" class="ui checkbox" style="margin: 10px 0px 15px 0px;" >
                                <input type="checkbox" checked="" />
                                <label>迴圈</label>
                            </div>
                           
                        </div>

                    </div>
                    <div class="eight wide column">
                        <div class="fields">
                            <div class="five wide field" style="margin-bottom: -5px">
                                <div class="ui two wide  icon buttons">
                                    <div id="pause_btn" class="ui  disabled icon button">
                                        <i id="pauseicon" class="pause icon"></i>
                                    </div>
                                    <div id="play_btn" class="ui disabled red icon button">
                                        <i id="pakyicon" class="play icon"></i>
                                    </div>
                                </div>
                            </div>
                            <div class="eleven wide field">
                                <div id="slider-date" style="margin: 10px 0px 0px 0px; padding-left: 5px;"></div>
                            </div>
        
                        </div>  
                    </div>

                </div>

   

            </div>



       
            <div id="MapLoader1" class="ui active inverted dimmer">
                <div class="ui large  text loader">Loading</div>
            </div>
            <div class="ui two column doubling stackable grid">
                <div class="sixteen wide column">
                    <div id="map" class="chartstyle grayscale" style="position: relative;"></div>
                </div>
              <div class="Advocacyslogan" onclick="$(this).css({display: 'none'});">
        <!--<i class="fa fa-exclamation-triangle" aria-hidden="true"></i>-->
                 <i class="fa fa-times-circle" style="position: left;position: absolute;right: 5px;top: 3px;"></i>
					哪些地方蚊子多？ 大家趕快動手清
    </div>
            </div>
        </div>
    </div>
<div class="ui longer modal" id="statistic_table">
  <i class="close icon"></i>
  <div class="header">
        前1週病媒蚊密度達危險級里別列表
  </div>
	<div class="content">
      <div><p id="danger_village"></p></div>
    <!-- Table Markup -->
			<table id="insectTable" class="table table-striped table-bordered"></table>
		  <div><p>備註：</p></div>
		  <div><p>1. 危險級里別：病媒蚊調查誘卵桶陽性率>=60% 或 布氏級數>=3級 或 誘殺桶陽性率>=30%之里別</p></div>
          <div><p>2. 資料來源：各縣市衛生局及國家衛生研究院依監測計畫或疫情需求規劃巡檢之頻率及範圍</p></div>
          <div><p>3. 注意及低風險里別定義請參見「資料說明」頁籤</p></div>
          <div><p>4. （ ）為總調查里數佔全縣市下轄總村里數百分比</p></div>
          <div><p id="total_village"></p></div>
          
		 <!-- <div><p id="danger_village">3. 布氏級數總調查里數：</p></div>
		  <div><p id="statistics_mosquito_color">4. 布氏級數總調查里數：</p></div>
		  <div><p id="statistics_bucket_color">5. 誘卵桶總調查里數：</p></div> -->
		</div>
  <div class="actions">
	<!-- <button class="ui primary button">
	<a href="https://zone.cdc.gov.tw/map/csv/cdcdengueData_test.csv" id="download_btn" download="cdcdengueData.csv" style="color: white;">下載CSV檔(UTF-8格式)</a>
	</button> -->
    <div class="ui black deny button">
      關閉
    </div>
  </div>
</div>

    
</asp:Content>

