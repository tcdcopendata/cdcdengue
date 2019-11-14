<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="TimeMap.aspx.cs" Inherits="Dengue_Info.TimeMap" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="resource/leaflet/1.0.0-rc1/leaflet.css"  />
    <link rel="stylesheet" href="resource/noUiSlider/8.0.2/nouislider.min.css" />
    <link rel="stylesheet" href="resource/__customized/1.0/timemap.css" />
    <script src="resource/leaflet/1.0.0-rc1/leaflet.js"></script>
    <script src="resource/Semantic-UI/2.0.3/semantic.min.js"></script>
    <script src="resource/lzstring/1.4.4/lz-string.js"></script> 
    <script src="resource/noUiSlider/8.0.2/wNumb.js"></script>
    <script src="resource/noUiSlider/8.0.2/nouislider.min.js"></script>
    <script src="resource/__customized/1.0/main.js"></script> 
    <script src="resource/__customized/1.0/timemap.js"></script>
    <script src="resource/__customized/1.0/area.js"></script>
    <script src="resource/__customized/1.0/ns1hosp.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container">
        <div id="pagemessage" class="ui attached message">
            <div class="ui form">
                <div class="ui column doubling stackable grid">
                    <div class="three wide column">
                        <select id="city_select" class="ui fluid dropdown" onchange="javascript: addNS1Loc('initial');">
                            <option value="all" selected="selected">全國</option>
                            <option value="01-31">台北市、新北市</option>
                            <option value="05-07-43">台南市、高雄市與屏東縣</option>
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
                    <div class="three wide column">
                        <div class="field">
                            <select id="imm_select" class="ui fluid dropdown">
                                <option value="0">本土病例</option>
                                <option value="1">境外移入病例</option>
                                <option value="2">本土及境外移入病例</option>
                            </select>
                        </div>
                    </div>
                    <div class="seven wide column">
                            <i class="big calendar icon" style="margin-top: 5px"></i>
                            <input class="example-val six wide field" id="startdate"></input>
                              _
			                      <input class="example-val six wide field" id="enddate"></input>
                    </div>
                    <div class="two wide column">
                         <div>
                            <div id="loopcheck" class="ui checkbox" style="margin: 10px 0px 15px 0px;">
                                <input type="checkbox" checked="" />
                                <label>迴圈</label>
                            </div>
                        </div>
                    </div>
                </div>

   
                <div class="fields">
                    <div class="two wide field" style="margin-bottom: -5px">
                        <div class="ui two wide  icon buttons">
                            <div id="pause_btn" class="ui  large disable icon button">
                                <i id="pauseicon" class="pause icon"></i>
                            </div>
                            <div id="play_btn" class="ui  large red icon button">
                                <i id="pakyicon" class="play icon"></i>
                            </div>
                        </div>
                    </div>
                    <div class="fourteen wide field">
                        <div id="slider-date" style="margin: 10px 0px 0px 0px; padding-left: 5px;"></div>
                    </div>

                </div>
            </div>

        </div>
        <div class="ui bottom attached fluid form segment">
            <div id="MapLoader1" class="ui  active inverted dimmer">
                <div class="ui large  text loader">Loading</div>
            </div>
            <div class="field">
                <div id="maps">
                    <div id="mappage">
                        <div id="map" class="chartstyle grayscale" style="height: 600px;"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
