// current frontpage : must be the same with Web.config
var defaultPage = "TimeMap.aspx";

// get url
$.extend({
    getUrlVars: function () {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for (var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;
    }
	,
    getUrlVar: function (name) {
        return $.getUrlVars();
    }
});

function checkLinkActive() {
    var activeOrNot = 0;
    var allLinks = $("#mainNavBar a");

    for (var i = 0 ; i < allLinks.length; i++) {
        if ($(allLinks[i]).attr('class').split(" ").indexOf("active") > -1) {
            return 1;
        }
    }
    return 0;
}

function showActivePageItem() {
    if (checkLinkActive() == 1) {
        // one button is already active
        return;
    }

    // only activated on the homepage
    var url = $.getUrlVar()[0];
    var allLinks = $("#mainNavBar a");
    var crtPage = null;
    if ( $.getUrlVar()[0].match(/(\S*)\/(\S*)\.aspx/i) ) {
        crtPage = $.getUrlVar()[0].match(/(\S*)\/(\S*)\.aspx/i)[2] + ".aspx";
    } else if ( $.getUrlVar()[0].match(/(\S*)\/(\S*)/i) ) {
        crtPage = defaultPage;
    }
    for (var i = 0 ; i < allLinks.length; i++) {
        if ($(allLinks[i]).attr('href') == crtPage) {
            $(allLinks[i]).addClass("active");
        }
    }
}

/*
* desc : transfrom a number into a string in a fixed length
* call : DengueCluster.js
* inpt : month <= 12
* oupt : '01', '02', '03' ... '12'
*/
function fixedDateFormat(getMonthDate) {
    if (getMonthDate < 10) {
        return '0' + getMonthDate.toString();
    } else {
        return getMonthDate.toString();
    }
}

/*
* desc : execution after loading
*/

$(document).ready(function () {
    $('.right.menu.open').on("click", function (e) {
        e.preventDefault();
        $('.ui.vertical.menu').toggle();
    });

    // for each page to show current page selected   
    showActivePageItem();
});
