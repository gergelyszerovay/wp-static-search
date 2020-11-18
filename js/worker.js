// based on mkdocs: https://github.com/mkdocs/mkdocs/blob/afa18ae2c0f2bbfc8c8a021c4e9042526fa783f3/mkdocs/contrib/search/templates/search/worker.js , 2505a90
// mkdocs has 2 clause BSD License, Copyright © 2014, Tom Christie. All rights reserved.
// Modificaions made by Gergely Szerovay, licensed under the Apache 2 or GPL 2+ license
// File contents commented out by Paul Trafford following changes to search.js

/*
var base_path = 'function' === typeof importScripts ? '.' : '../../lunr-index/';
var allowSearch = false;
var index;
var documents = {};
var lang = ['en'];
var data;

function affixScriptToHead(url, onloadFunction) {
    var newScript = document.createElement("script");
    newScript.onerror = loadError;
    if (onloadFunction) { newScript.onload = function() {
        setTimeout(onloadFunction, 0);
    }; }
    document.head.appendChild(newScript);
    newScript.src = url;
}

function getScript(script, callback) {
    console.log('Loading script: ' + script);
    affixScriptToHead(base_path + script).done(function () {
        callback();
    }).fail(function (jqxhr, settings, exception) {
        console.log('Error: ' + exception);
    });
}

function getScriptsInOrder(scripts, callback) {
    if (scripts.length === 0) {
        callback();
        return;
    }
    getScript(scripts[0], function () {
        getScriptsInOrder(scripts.slice(1), callback);
    });
}

function loadScripts(urls, callback) {
    if ('function' === typeof importScripts) {
        importScripts.apply(null, urls);
        callback();
    } else {
        getScriptsInOrder(urls, callback);
    }
}

function onJSONLoaded() {
    data = JSON.parse(this.responseText);
    var scriptsToLoad = ['../3rdparty-css-js/lunr-2.3.8.min.js'];
    // if (data.config && data.config.lang && data.config.lang.length) {
    //     lang = data.config.lang;
    // }
    // if (lang.length > 1 || lang[0] !== "en") {
    //     scriptsToLoad.push('lunr.stemmer.support.js');
    //     if (lang.length > 1) {
    //         scriptsToLoad.push('lunr.multi.js');
    //     }
    //     for (var i=0; i < lang.length; i++) {
    //         if (lang[i] != 'en') {
    //             scriptsToLoad.push(['lunr', lang[i], 'js'].join('.'));
    //         }
    //     }
    // }
    loadScripts(scriptsToLoad, onScriptsLoaded);
}

function onScriptsLoaded() {
    index = lunr.Index.load(data['index']);
    documents = data['documents'];
    console.log('Lunr pre-built index loaded, search ready');

    // console.log('All search scripts loaded, building Lunr index...');
    // if (data.config && data.config.separator && data.config.separator.length) {
    //     lunr.tokenizer.separator = new RegExp(data.config.separator);
    // }
    //
    // if (data.index) {
    //     index = lunr.Index.load(data.index);
    //     data.docs.forEach(function (doc) {
    //         documents[doc.location] = doc;
    //     });
    //     console.log('Lunr pre-built index loaded, search ready');
    // } else {
    //     index = lunr(function () {
    //         if (lang.length === 1 && lang[0] !== "en" && lunr[lang[0]]) {
    //             this.use(lunr[lang[0]]);
    //         } else if (lang.length > 1) {
    //             this.use(lunr.multiLanguage.apply(null, lang));  // spread operator not supported in all browsers: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_operator#Browser_compatibility
    //         }
    //         this.field('title');
    //         this.field('text');
    //         this.ref('location');
    //
    //         for (var i=0; i < data.docs.length; i++) {
    //             var doc = data.docs[i];
    //             this.add(doc);
    //             documents[doc.location] = doc;
    //         }
    //     });
    //     console.log('Lunr index built, search ready');
    // }
    allowSearch = true;
    // postMessage({config: data.config});
    postMessage({config: {}});
    postMessage({allowSearch: allowSearch});
}

function init(version) {
    var oReq = new XMLHttpRequest();
    oReq.addEventListener("load", onJSONLoaded);
    var index_path = base_path + '/lunr-index.json';
    if ('function' === typeof importScripts) {
        index_path = '../../../lunr-index/' + 'lunr-index.json?version=' + version;
    }
    oReq.open("GET", index_path);
    oReq.send();
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
        doc.location = result.ref;
        resultDocuments.push(doc);
    }
    return resultDocuments;
}

if ('function' === typeof importScripts) {
    onmessage = function (e) {
        if (e.data.init) {
            init(e.data.init.version);
        } else if (e.data.query) {
            postMessage({results: search(e.data.query)});
        } else {
            console.error("Worker - Unrecognized message: " + e);
        }
    };
}
*/