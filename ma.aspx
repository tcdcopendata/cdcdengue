<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="ma.aspx.cs" Inherits="Dengue_Info.ma" %>

<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <!-- must use font-awesome 4.0.0 by cdn due to missing icon issue -->
    <link rel="stylesheet" href="//netdna.bootstrapcdn.com/font-awesome/4.0.0/css/font-awesome.css" />
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.css"  />
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.label.css" />
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.awesome-markers.css" />
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.fullscreen.css" />
    <link rel="stylesheet" href="resource/jquery-ui/1.11.4/jquery.timepicker.css" />
    <link rel="stylesheet" href="resource/__customized/1.0/ma.css" />
    <script src="resource/leaflet/0.7.7/leaflet.js"></script>
    <script src="resource/leaflet/0.7.7/leaflet.label.js"></script>
    <script src="resource/leaflet/0.7.7/Leaflet.fullscreen.js"></script>
    <script src="resource/leaflet/0.7.7/leaflet.awesome-markers.js"></script>
    <script src="resource/highcharts/4.2.5/highstock.js"></script> 
    <script src="resource/highcharts/4.2.5/exporting.js"></script> 
    <script src="resource/Semantic-UI/2.0.3/semantic.min.js"></script>
    <script src="resource/__customized/1.0/loadmalayer.js"></script>
    <script src="resource/__customized/1.0/ma.js"></script>
    <script src="resource/__customized/1.0/main.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container">
        <div id="pagemessage" class="ui attached message">
            <div class="ui form">
                <div class="ui column doubling stackable grid">
                    <div class="three wide column">
                        <select id="city_select" class="ui fluid dropdown">
                            <option value="05">台南市</option>
                            <option value="07">高雄市</option>
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
                        <div id="map" class="chartstyle grayscale" style="height: 650px;"></div>
                    </div>
                </div>
            </div>
        </div>
        <div id="eip_modal" class="ui fullscreen modal">
            <i class="close icon"></i>
            <div class="header">
                <label id="detail_tittle"></label>
            </div>
            <div class="content">
                <div id="MapLoader2" class="ui active inverted  dimmer">
                    <div class="ui large  text loader">Loading</div>
                </div>
                <div id="chart_div" class="chartstyle"></div>
            </div>
        </div>
    </div>
</asp:Content>
