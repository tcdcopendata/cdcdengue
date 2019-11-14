<%@ Page Title="" Language="C#" MasterPageFile="~/MasterPage.Master" AutoEventWireup="true" CodeBehind="DengueCluster.aspx.cs" Inherits="Dengue_Info.DengueCluster" %>
<asp:Content ID="Content1" ContentPlaceHolderID="head" runat="server">
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.css" />
    <link rel="stylesheet" href="resource/leaflet/0.7.7/leaflet.label.css" />
    <link rel="stylesheet" href="resource/__customized/1.0/DengueCluster.css"  />
    <script src="resource/leaflet/0.7.7/leaflet.js"></script>
    <script src="resource/leaflet/0.7.7/leaflet.label.js"></script>
    <script src="resource/highcharts/4.2.5/highcharts.js"></script>
    <script src="resource/highcharts/4.2.5/heatmap.js"></script>
    <script src="resource/highcharts/4.2.5/treemap.js"></script>
    <script src="resource/highcharts/4.2.5/exporting.js"></script> 
    <script src="resource/Semantic-UI/2.0.3/semantic.min.js"></script>
    <script src="resource/lzstring/1.4.4/lz-string.js"></script> 
    <script src="resource/__customized/1.0/DengueCluster.js"></script>
    <script src="resource/__customized/1.0/area.js"></script>
    <script src="resource/__customized/1.0/ns1hosp.js"></script>
</asp:Content>
<asp:Content ID="Content2" ContentPlaceHolderID="ContentPlaceHolder1" runat="server">
    <div class="ui text container">
        <div id="pagemessage" class="ui message">
            <div id="MapLoader1" class="ui active inverted dimmer">
                <div class="ui large  text loader">Loading</div>
            </div>
            <div class="ui two column doubling stackable grid">
                <div class="eleven wide column">
                    <div id="map" class="chartstyle grayscale" style="height: 650px;"></div>
                </div>
                <div class="five wide column">
                    <div id="treemap" style="height: 650px;"></div>
                    <div id="msg"></div>
                </div>
            </div>
        </div>
    </div>  
     
</asp:Content>
