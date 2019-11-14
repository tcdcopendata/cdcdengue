<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="Index.aspx.cs" Inherits="Dengue_Info.Index" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="resource/leaflet/1.0.0-rc1/leaflet.css" />
    <link rel="stylesheet" href="resource/leaflet/1.0.0-rc1/MarkerCluster.css" />
    <link rel="stylesheet" href="resource/leaflet/1.0.0-rc1/MarkerCluster.Default.css" />
    <link rel="stylesheet" href="resource/noUiSlider/8.0.2/nouislider.min.css" />
    <script src="resource/noUiSlider/8.0.2/wNumb.js"></script>
    <script src="resource/noUiSlider/8.0.2/nouislider.min.js"></script>
    <script src="resource/highcharts/4.2.5/highstock.js"></script> 
    <script src="resource/highcharts/4.2.5/exporting.js"></script> 
    <script src="resource/leaflet/0.7.7/leaflet.js"></script>
    <script src="resource/leaflet/0.7.7/heatmap.js"></script>
    <script src="resource/leaflet/0.7.7/leaflet-heatmap.js"></script>
    <script src="resource/leaflet/0.7.7/leaflet.markercluster-src.js"></script>
    <script src="resource/__customized/1.0/epicurve.js"></script> 
    <script src="resource/__customized/1.0/index.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container" "> 
        <div id="pagemessage" class="ui attached message">
            <div class="ui column doubling stackable grid">
                    <div class="left floated six wide column">
                        <div id="search" class="ui big teal labeled icon button">
                            <i class="search icon"></i>查詢
                        </div>
                        <i class="ui big label">
                            <label id="conditstr"></label>
                        </i>
                    </div>
                    <div class="right floated five wide column" style="text-align: right">
                        <div class="ui huge red label">
                            <i class="calendar icon"></i>
                            <span class="example-val" id="event-start"></span>- 
			            <span class="example-val" id="event-end"></span>
                        </div>
                    </div>
            </div>
            <div id="search_list" class="ui small modal">
                <i class="close icon"></i>
                <div class="header">
                    查詢
                </div>
                <div class="content">
                    <div class="ui form">
                        <div class="field">
                            <label>縣市</label>
                            <select id="city_select" class="ui fluid dropdown">
                                <option value="all">全國</option>
                                <option value="11">基隆市</option>
                                <option value="34">宜蘭縣</option>
                                <option value="01">台北市</option>
                                <option value="31">新北市</option>
                                <option value="90">金門縣</option>
                                <option value="91">連江縣</option>
                                <option value="32">桃園市</option>
                                <option value="33">新竹縣</option>
                                <option value="12">新竹市</option>
                                <option value="35">苗栗縣</option>
                                <option value="03">台中市</option>
                                <option value="37">彰化縣</option>
                                <option value="38">南投縣</option>
                                <option value="39">雲林縣</option>
                                <option value="40">嘉義縣</option>
                                <option value="22">嘉義市</option>
                                <option value="05">台南市</option>
                                <option value="07">高雄市</option>
                                <option value="43">屏東縣</option>
                                <option value="44">澎湖縣</option>
                                <option value="45">花蓮縣</option>
                                <option value="46">台東縣</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>時間區間</label>
                            <select id="interval_select" class="ui fluid dropdown">
                                <option value="0">近一年</option>
                                <option value="1">全部年度</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>感染來源</label>
                            <select id="imm_select" class="ui fluid dropdown">
                                <option value="0">本土</option>
                                <option value="1">境外移入</option>
                                <option value="all">本土及境外移入</option>
                            </select>
                        </div>
                        <div class="field">
                            <label>性別</label>
                            <select id="gender_select" class="ui fluid dropdown">
                                <option value="all">男性及女性</option>
                                <option value="M">男性</option>
                                <option value="F">女性</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="actions">
                    <div class="ui black deny button">
                        取消
                    </div>
                    <div id="searchsubmit" class="ui positive right labeled icon button">
                        確定
                  <i class="checkmark icon"></i>
                    </div>
                </div>
            </div>
            <div id="slider-date" style="margin: 10px 0px 10px 0px"></div>
        </div>
        <div class="ui  attached fluid form segment">
            <div id="MapLoader1" class="ui active inverted  dimmer">
                <div class="ui large  text loader">Loading</div>
            </div>
            <div class="ui two column doubling stackable grid">
                <div class="column">
                    <div id="heatmap" class="chartstyle"></div>
                </div>
                <div class="column">
                    <div id="clustermap" class="chartstyle"></div>
                </div>
            </div>
        </div>
        <div class="ui bottom attached fluid form segment">
            <div id="MapLoader2" class="ui active inverted  dimmer">
                    <div class="ui large  text loader">Loading</div>
                </div>
            <div id="chart_div" class="chartstyle"></div>
        </div>
    </div>
</asp:Content>
