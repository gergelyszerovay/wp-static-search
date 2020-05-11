# WP Static Search

This plugin adds a static search engine to your Wordpress site. Static in this context means that it works in the browser without using of server-side queries, so it’s ideal for static [websites generated from a Wordpress site](https://github.com/gergelyszerovay/wp-static-proxy).

Since both the search and the indexing happens in the browser, this plugin is not a good fit for sites that contain hundreds of pages and posts.

## Getting Started

After you are installed the plugin, choose the ”Static Search” option from the left sidebar of the Wordpress admin interface. Press the ”Update Index” button and wait until the indexing is finished. Each time you change the content of the website, you should update the search index manually. 

To insert the search box and the search results into the site, use the [static_search] shortcode. It’s a good practice to create a page called ”Search” with the slug ”/search/” and insert the [static_search] shortcode into this page. To redirect the search widgets to this page, append the following code to the bottom of your .htaccess file:

`RewriteCond %{QUERY_STRING} \\?s=([^&]+) [NC]`

`RewriteRule ^$ /search/?q=%1 [NC,R,END]`


This code redirects the search queries to the /search/ page, then the [static_search] shortcode processes them and shows the search results.

## Built With

[lunar.js](https://lunrjs.com/) - Javascript search engine

## Versioning 

We use SemVer for versioning. For the versions available, see the tags on this repository.

## License

This project is licensed under the Apache 2 and GPL2+ Licenses
Acknowledgments

The frontend search code based on the [MkDocs project’s](https://www.mkdocs.org/) search plugin.

