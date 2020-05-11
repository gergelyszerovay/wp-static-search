<?php
/**
 * Plugin Name: WP Static Search
 * Plugin URI: https://github.com/gergelyszerovay/wp-static-search
 * Description: Static search plugin for Wordpress static websites
 * Version: 1.0
 * Requires at least: 5.2
 * Requires PHP: 7.2
 * Author: Gergely Szerovay
 * Author URI: https://gergely.szerovay.hu
 * License: GPL2+ / Apache 2
 */

require_once('classes.php');

add_action('wp_head', 'ss_head');
add_action('admin_head', 'ss_admin_head');

function ss_head() {
    $siteUrl = get_site_url();
    $wpNonce = "'" . wp_create_nonce('wp_rest') . "'";

    $dir = __DIR__ . '/../../lunr-index';
    $version = 1;
    if (is_file($dir . '/lunr-index.ver')) {
        $version = file_get_contents($dir . '/lunr-index.ver');
    }

    $output = <<< ENDH
<script>
appStaticSearch = {
    siteUrl: "{$siteUrl}",
    maxSearchResults: 50,
    indexVersion: {$version}
};
</script>
ENDH;
    echo $output;
}


function ss_admin_head() {
    $siteUrl = get_site_url();
    $wpNonce = "'" . wp_create_nonce('wp_rest') . "'";

    $dir = __DIR__ . '/../../lunr-index';
    $version = 1;
    if (is_file($dir . '/lunr-index.ver')) {
        $version = file_get_contents($dir . '/lunr-index.ver');
    }

    $output = <<< ENDH
<script>
appStaticSearch = {
    siteUrl: "{$siteUrl}",
    wpNonce: {$wpNonce},
    postsPerQuery: 25,
    pagesPerQuery: 25,
    indexVersion: {$version}
};
</script>
ENDH;
    echo $output;
}

add_action('wp_enqueue_scripts', 'ss_enqueue_scripts');
add_action('admin_enqueue_scripts', 'ss_enqueue_scripts');

function ss_enqueue_scripts() {
    wp_register_script('ss_js_lunr', plugin_dir_url(__FILE__) . '3rdparty-css-js/lunr-2.3.8.min.js', array(), '2.3.8');

    wp_register_script('ss_js_admin', plugin_dir_url(__FILE__) . 'js/admin.js', array(), '0.0.1');
    wp_register_style('ss_css_admin', plugin_dir_url(__FILE__) . 'css/admin.css', array(), '0.0.1');

    wp_register_script('ss_js_search', plugin_dir_url(__FILE__) . 'js/search.js', array(), '0.0.1');
    wp_register_style('ss_css_search', plugin_dir_url(__FILE__) . 'css/search.css', array(), '0.0.1');
}

add_action('admin_menu', 'ss_admin_menu');

function ss_admin_menu() {
    add_menu_page('Static search', 'Static search', 'manage_options', 'static_search_admin_dashboard');

    new TWPAdminPageSSDasboard(null, 'static_search_admin_dashboard', 'Static search', 'Reindex site', 'manage_options', 'static_search_admin_dashboard');
//    new TWPAdminPageDebug(null, 'static_search_admin_dashboard', 'Debug', 'Debug', 'manage_options', 'static_search_admin_debug');
}

add_shortcode('static_search', 'static_search');
function static_search($atts, $content = null) {
    global $app;

    $shortcode = new TWPShortcodeStaticSearch($app, $atts, $content);
    return $shortcode->Render();

}


add_action('rest_api_init', 'ss_rest_server');

function ss_rest_server() {
    $path = 'static-search/v1';

    register_rest_route($path, '/(?P<_wp_rest_action>[a-zA-Z0-9-_\/]+)', array(
        'methods' => 'POST',
        'callback' => 'ss_rest_handler',
    ));

    register_rest_route($path, '/(?P<_wp_rest_action>[a-zA-Z0-9-_\/]+)', array(
        'methods' => 'GET',
        'callback' => 'ss_rest_handler',
    ));
}

function ss_rest_handler(\WP_REST_Request $request) {
    $url_params = $request->get_url_params();
    $query_params = $request->get_query_params();
    $json_params = $request->get_json_params();

    $params = array();
    if (!empty($url_params)) $params = array_merge($params, $url_params);
    if (!empty($query_params)) $params = array_merge($params, $query_params);
    if (!empty($json_params)) $params = array_merge($params, $json_params);

    header("Content-type:application/json");

    switch ($params['_wp_rest_action']) {
        case 'store-index':
            $dir = __DIR__ . '/../../lunr-index';
            if (!is_dir($dir) && !mkdir($dir, 0755) && !is_dir($dir)) {
                throw new \RuntimeException(sprintf('Directory "%s" was not created', $dir));
            }
            $version = 1;
            if (is_file($dir . '/lunr-index.ver')) {
                $version = file_get_contents($dir . '/lunr-index.ver');
            }
            file_put_contents($dir . '/lunr-index.ver', $version + 1);

            file_put_contents($dir . '/lunr-index.json', $params['serializedIdx']);

            echo '{"status": "done", "action": "' . $params['_wp_rest_action'] . '"}';
            break;
        default:
            echo '{"status": "unknown-action", "action": "' . $params['_wp_rest_action'] . '"}';
    }

}
