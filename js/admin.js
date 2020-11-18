/*
 * Author: Gergely Szerovay, https://github.com/gergelyszerovay/wp-static-search
 * License: GPL2+ / Apache 2
 */


/* global appStaticSearch */

String.prototype.replaceAll = function (search, replacement) {
    search = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Using_special_characters
    return this.replace(new RegExp(search, 'g'), replacement);
};

function stripHTML(html) {
    var doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

function ssUpdateIndex() {
    document.getElementById("button_ss_update_index").disabled = true;
    document.getElementById("p_ss_progress_page").innerHTML = '';
    document.getElementById("p_ss_progress_post").innerHTML = '';
    document.getElementById("p_ss_progress_index").innerHTML = '';

    var updateIndexData = {};

    updateIndexData.post = [];
    updateIndexData.page = [];

    fetchPages(updateIndexData, 1);
}

function fetchPages(updateIndexData, page) {
    fetch(appStaticSearch.siteUrl + '/wp-json/wp/v2/pages?per_page=' + appStaticSearch.pagesPerQuery + '&page=' + page, {headers: {"Content-Type": "application/json; charset=utf-8"}})
        .then(function (response) {
            if (response.status == 200) {
                updateIndexData.totalPages = parseInt(response.headers.get('X-WP-Total'));
            }

            return response.json();
        })
        .then(function (data) {

            if (!Array.isArray(data)) {
                fetchPosts(updateIndexData, 1);
                return;
            }

            data.forEach(function (item) {
                updateIndexData.page.push(item);
            });

            document.getElementById("p_ss_progress_page").innerHTML = "Loaded " + updateIndexData.page.length + " page(s) from " + updateIndexData.totalPages;

            if (data.length == appStaticSearch.pagesPerQuery) {
                fetchPages(updateIndexData, page + 1);
            }
            else {
                fetchPosts(updateIndexData, 1);
            }
        })
        .catch(function (err) {
            console.log(err);
            fetchPosts(updateIndexData, 1);
        });

}

function fetchPosts(updateIndexData, page) {
    fetch(appStaticSearch.siteUrl + '/wp-json/wp/v2/posts?_embed=1&per_page=' + appStaticSearch.postsPerQuery + '&page=' + page, {headers: {"Content-Type": "application/json; charset=utf-8"}})
        .then(function (response) {
            if (response.status == 200) {
                updateIndexData.totalPosts = parseInt(response.headers.get('X-WP-Total'));
            }
            return response.json();
        })
        .then(function (data) {
            if (!Array.isArray(data)) {
                lunrIndex(updateIndexData);
                return;
            }

            data.forEach(function (item) {
                updateIndexData.post.push(item);
            });
            document.getElementById("p_ss_progress_post").innerHTML = "Loaded " + updateIndexData.post.length + " post(s) from " + updateIndexData.totalPosts;

            if (data.length == appStaticSearch.postsPerQuery) {
                fetchPosts(updateIndexData, page + 1);
            }
            else {
                lunrIndex(updateIndexData);
            }
        })
        .catch(function (err) {
            console.log(err);
            lunrIndex(updateIndexData);
        });
}


function indexDocument(lunrThis, updateIndexData, doc) {
    updateIndexData.indexedCount++;
    document.getElementById("p_ss_progress_index").innerHTML = "Indexing finished, indexed " + updateIndexData.indexedCount + " post/pages from " + (updateIndexData.totalPosts + updateIndexData.totalPages);

    if (doc['status'] != "publish") return;
    var url = doc['link'].replaceAll(appStaticSearch.siteUrl, '');

    var featuredMedia = '';
    var tags = [];

    if ('_embedded' in doc) {
        if ('wp:featuredmedia' in doc['_embedded']) {
            featuredMedia = doc['_embedded']['wp:featuredmedia'][0]['source_url'].replaceAll(appStaticSearch.siteUrl, '');
        }
        if ('wp:term' in doc['_embedded']) {
            doc['_embedded']['wp:term'].forEach(function (item) {
                item.forEach(function (item2) {
                    if (item2['taxonomy'] == 'post_tag') tags.push(item2['name']);
                });
            });
        }
    }

    updateIndexData.documents[url] = {
        'title': stripHTML(doc['title']['rendered']),
        'text': stripHTML(doc['excerpt']['rendered']) != '' ? stripHTML(doc['excerpt']['rendered']) : stripHTML(doc['content']['rendered']).substring(0, 200),
        'featuredMedia': featuredMedia,
        'tags': tags
    };

    lunrThis.add({
        'link': url,
        'title': stripHTML(doc['title']['rendered']),
        'text': stripHTML(doc['content']['rendered']),
        'tag': tags.join(' ')
    });

}

function lunrIndex(updateIndexData) {
    updateIndexData.indexedCount = 0;

    var idx = lunr(function () {
        this.ref('link');
        this.field('title');
        this.field('text');
        this.field('tag');

        var lunrThis = this;

        updateIndexData.documents = {};

        updateIndexData.page.forEach(function(item) { indexDocument(lunrThis, updateIndexData, item) });
        updateIndexData.post.forEach(function(item) { indexDocument(lunrThis, updateIndexData, item) });
    });

    var data = {'index': idx, 'documents': updateIndexData.documents};
    storeIndex('var data = '+JSON.stringify(data)+';');

    document.getElementById("button_ss_update_index").disabled = false;

}

function storeIndex(serializedIdx) {
    fetch(appStaticSearch.siteUrl + '/wp-json/static-search/v1/store-index', {
        method: "POST",
        headers: {"Content-Type": "application/json; charset=utf-8"},
        body: JSON.stringify({serializedIdx: serializedIdx})
    })
        .then(function (res) {
            res.json()
        })
        .then(function (response) {
        })
        .catch(function (err) {
            console.log(err)
        });
}