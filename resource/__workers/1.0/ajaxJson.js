function postJsonAjax(url, sentdata, success) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
    xhr.onload = function () {
        if (xhr.status === 200) {
            return success(xhr.responseText);
        }
    }
    // use JSON.stringify to transform json object into the string data type
    //xhr.send(JSON.stringify(sentdata));
    xhr.send("{ citycode: '05', immigration: '0' }");
}

function getJsonAjax(url, sentdata, success) {
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url);
	xhr.setRequestHeader('Content-Type', 'application/json; charset=utf-8');
	xhr.onload = function () {
		if (xhr.status === 200) {
			return success(xhr.responseText);
		}
	}
	// use JSON.stringify to transform json object into the string data type
	//xhr.send(JSON.stringify(sentdata));
	xhr.send("{ citycode: '05', immigration: '0' }");
}