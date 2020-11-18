// based on mkdocs: https://github.com/mkdocs/mkdocs/blob/master/mkdocs/contrib/search/templates/search/main.js , 2505a90
// mkdocs has 2 clause BSD License, Copyright © 2014, Tom Christie. All rights reserved.
// Modifications made by Gergely Szerovay and Paul Trafford, licensed under the Apache 2 or GPL 2+ license

/*
var searchWorker;
var min_search_length = 3;
*/

console.log('Starting static search...');
doSearch();

function loadError(oError) {
  throw new URIError("The script " + oError.target.src + " didn't load correctly.");
}

function affixScriptToHead(url, onloadFunction) {
    var newScript = document.createElement("script");
    newScript.onerror = loadError;
    if (onloadFunction) { newScript.onload = function() {
        setTimeout(onloadFunction, 0);
    }; }
    document.head.appendChild(newScript);
    newScript.src = url;
}

/*
function getSearchTermFromLocation() {
    var sPageURL = window.location.search.substring(1);
    var sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++) {
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == 'q') {
            return decodeURIComponent(sParameterName[1].replace(/\+/g, '%20'));
        }
    }
}
*/

function formatResult(result) {
     html = '' +
    '<div class="ss-article">' +
    '<a href="..'+ result.location + result_suffix + '" class="ss-image-link">';
     if (result.featuredMedia != '') {
         html += '<img src="' + result.featuredMedia + '" class="ss-image">';
     }
    html += '</a>'+
    '<div class="ss-text">'+
    '<h3><a href="..' + result.location + result_suffix + '">' + result.title + '</a></h3>'+
    '<p>' + result.summary + '</p>'+
    '</div>'+ // .ss-text
    '</div>'; // .ss-article

    return html;
}

function displayResults(results) {
    var search_results = document.getElementById("ss-search-results");
    while (search_results.firstChild) {
        search_results.removeChild(search_results.firstChild);
    }
    if (results.length > 0) {
        for (var i = 0; i < results.length; i++) {
            var result = results[i];
            // console.log(result);
            var html = formatResult(result);
            search_results.insertAdjacentHTML('beforeend', html);
        }
    } else {
        search_results.insertAdjacentHTML('beforeend', "<p>No results found</p>");
    }
}

function search(query) {
    if (!allowSearch) {
        console.error('Assets for search still loading');
        return;
    }
    var resultDocuments = [];
    var results = index.search(query);
    for (var i = 0; i < results.length; i++) {
        var result = results[i];
        var doc = documents[result.ref];
        doc.summary = doc.text.substring(0, 200);
        var n=doc.summary.split(" ");
        n.pop();
        doc.summary = n.join(' ') + ' ...';
        doc.location = result.ref;
        resultDocuments.push(doc);
    }
    return resultDocuments;
}

function doSearch() {
    affixScriptToHead("../wp-content/lunr-index/lunr-index.js");
     affixScriptToHead("../wp-content/plugins/wp-static-search/3rdparty-css-js/lunr-2.3.8.min.js");
    
    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('q'))
	{
	  	query=urlParams.get('q');
	  	document.getElementById('ss-search-query').value=query;
  		allowSearch = true;
		if( document.readyState !== 'loading' ) {
    		console.log( 'document is already ready for the search' );
    		searchAndDisplay();
		} else {
    		window.addEventListener('load', function () {
        		console.log( 'document is now ready for the search' );
        		searchAndDisplay();
    		});
		}
	}
    
    var staticSearchQuery = document.getElementById('ss-search-query');    
    staticSearchQuery.addEventListener("keyup", function(event) {
  	{
    	event.preventDefault();
    	query=staticSearchQuery.value;
		allowSearch = true;
    	searchAndDisplay();
  	}
  });
}

function searchAndDisplay(){
	onScriptsLoaded();
    if ((typeof window.location.hostname !== 'undefined') && (window.location.hostname!==''))
	{
		result_suffix='';
	}
	else
	{
   		result_suffix='index.html';
	}
	displayResults(search(query));
}

function onScriptsLoaded() {
    index = lunr.Index.load(data['index']);
    documents = data['documents'];
    console.log('Lunr pre-built index loaded, search ready');
}

/*
function initSearch() {
    var search_input = document.getElementById('ss-search-query');
    if (search_input) {
        search_input.addEventListener("keyup", doSearch);
    }
    var term = getSearchTermFromLocation();
    if (term) {
        search_input.value = term;
        doSearch();
    }
}

function onWorkerMessage(e) {
    if (e.data.allowSearch) {
        initSearch();
    } else if (e.data.results) {
        var results = e.data.results;
        displayResults(results);
    } else if (e.data.config) {
        // min_search_length = e.data.config.min_search_length-1;
    }
}

if (!window.Worker) {
    console.log('Web Worker API not supported');
    // load index in main thread
    affixScriptToHead(appStaticSearch.siteUrl + "/wp-content/plugins/wp-static-search/js/worker.js?ver=0.0.1").done(function () {
        console.log('Loaded worker');
        init(appStaticSearch.indexVersion);
        window.postMessage = function (msg) {
            onWorkerMessage({data: msg});
        };
    }).fail(function (jqxhr, settings, exception) {
        console.error('Could not load worker.js');
    });
} else {
    // Wrap search in a web worker
    searchWorker = new Worker(appStaticSearch.siteUrl + "/wp-content/plugins/wp-static-search/js/worker.js?ver=0.0.1");
    searchWorker.postMessage({init: {version: appStaticSearch.indexVersion}});
    searchWorker.onmessage = onWorkerMessage;
}

*/
