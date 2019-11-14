<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="Imported.aspx.cs" Inherits="Dengue_Info.Imported" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <!-- 1. mapbox 2.2.2 meet with leaflet 0.7.7 -->
    <!-- 2. mapbox prefer to API access -->
    <link rel='stylesheet' href='//api.mapbox.com/mapbox.js/v2.2.2/mapbox.css' />
    <link rel='stylesheet' href="resource/leaflet/0.7.7/leaflet.fullscreen.css" />
    <link rel='stylesheet' href='resource/jquery-ui/1.10.9/jquery.dataTables.min.css' />
    <link rel='stylesheet' href='resource/__customized/1.0/imported.css' />
    <script src='//api.mapbox.com/mapbox.js/v2.2.2/mapbox.js'></script>
    <script src="resource/leaflet/0.7.7/Leaflet.fullscreen.js"></script>
    <script src="resource/highcharts/4.2.5/highstock.js"></script> 
    <script src="resource/highcharts/4.2.5/exporting.js"></script> 
    <script src="resource/jquery-ui/1.10.9/jquery.dataTables.min.js"></script>
    <script src="resource/Semantic-UI/2.0.3/semantic.min.js"></script>
    <script src="resource/Semantic-UI/2.0.3/pathmap.js"></script>
    <script src='//api.mapbox.com/mapbox.js/plugins/arc.js/v0.1.0/arc.js'></script>
    <script src='resource/__customized/1.0/imported.js'></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container">
        <div id="pagemessage"  class="ui message">
            <div id="MapLoader1" class="ui  active inverted dimmer">
                <div class="ui large  text loader">Loading</div>
            </div>
            <div class="field">
                <div id="maps">
                    <div id="mappage">
                        <div id="map" class="chartstyle"></div>
                    </div>
                </div>
            </div>
            <div id="import_detail" class="ui fullscreen modal">
                <i class="close icon"></i>
                <div class="header">
                    <label id="detail_tittle"></label>
                </div>
                <div class="content">
                    <div id="tabs">
                        <ul>
                            <li><a href="#first">該國境外移入趨勢</a></li>
                            <li><a href="#second">該國重要疫情資訊</a></li>
                        </ul>
                        <div id="first">
                            <div id="chart_div" class="chartstyle"></div>
                        </div>
                        <div id="second">
                            <div id="MapLoader2" class="ui  active inverted dimmer">
                                <div class="ui large  text loader">Loading</div>
                            </div>
                            <div id="result_tb"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</asp:Content>
