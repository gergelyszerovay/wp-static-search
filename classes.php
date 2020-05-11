<?php
/*
 * Author: Gergely Szerovay, https://github.com/gergelyszerovay/wp-static-search
 * License: GPL2+ / Apache 2
 */

class TWPAdminPage {
    protected $menuRef;
    protected $css;
    protected $js;
    protected $parent_slug;
    protected $menu_slug;

    protected $active_submenu_slug;

    protected $app;

    public function __construct($app, $parent_slug, $page_title, $menu_title, $capability, $menu_slug, $js = [], $css = []) {
        $this->css = $css;
        $this->js = $js;
        $this->parent_slug = $parent_slug;
        $this->menu_slug = $menu_slug;

        $this->app = $app;

        $this->menuRef = add_submenu_page($parent_slug, $page_title, $menu_title, $capability, $menu_slug, array($this, 'render'));
        add_action('admin_enqueue_scripts', array($this, 'admin_enqueue_scripts'));
    }

    public function admin_enqueue_scripts($hook) {
        if ($hook != $this->menuRef) {
            return;
        }

        foreach ($this->css as $k => $v) {
            wp_enqueue_style($v);
        }
        foreach ($this->js as $k => $v) {
            wp_enqueue_script($v);
        }
    }

    public function HideFromSubmenu($active_submenu_slug) {
        $this->active_submenu_slug = $active_submenu_slug;
        add_filter('submenu_file', array($this, 'submenu_file'));
    }

    public function submenu_file($submenu_file) {
        global $plugin_page;

        remove_submenu_page($this->parent_slug, $this->menu_slug);

        if ($plugin_page == $this->menu_slug) return $this->active_submenu_slug;
        return $submenu_file;
    }

    public function render() {
        echo 'TWPAdminPage';
    }

}

class TWPAdminPageDebug extends TWPAdminPage {
    public function __construct($app, $parent_slug, $page_title, $menu_title, $capability, $menu_slug, array $js = [], array $css = []) {
//        $css = ['test.css'];
        parent::__construct($app, $parent_slug, $page_title, $menu_title, $capability, $menu_slug, $js, $css);
    }

    public function render() {
        $current_user_id = '';

        if (is_user_logged_in()) {
            $current_user_id = get_current_user_id();
        }
        ?>
        <div class="wrap">
            <p><strong>User id:</strong> <?= $current_user_id ?></p>
            <p><strong>_wpnonce (wp_rest):</strong> <?= wp_create_nonce('wp_rest') ?></p>
            <p><strong>Cookie:</strong><br> <?php
                foreach ($_COOKIE as $k => $v) {
                    if (strpos($k, 'wordpress_logged_in') === 0) {
                        echo "$k<br>";
                        echo "$v<br>";
                    }
                }
                ?></p>
        </div>
        <?php
    }

}

class TWPAdminPageSSDasboard extends TWPAdminPage {
    public function __construct($app, $parent_slug, $page_title, $menu_title, $capability, $menu_slug, array $js = [], array $css = []) {
        $js = ['ss_js_lunr', 'ss_js_admin'];
        parent::__construct($app, $parent_slug, $page_title, $menu_title, $capability, $menu_slug, $js, $css);
    }

    public function render() {
        echo '<div class="wrap"><h1>Static Search</h1><p><button id="button_ss_update_index" onclick="ssUpdateIndex();">Update Index</button></p><p id="p_ss_progress_page"></p><p id="p_ss_progress_post"></p><p id="p_ss_progress_index"></p></div>';
    }
}

class TWPShortcodeStaticSearch {
    protected $app, $atts, $content;

    function __construct($app, $atts, $content) {
        $this->app = $app;
        $this->atts = $atts;
        $this->content = $content;
    }

    function Render() {
        wp_enqueue_script('ss_js_search');
        wp_enqueue_style('ss_css_search');
        ob_start();
        ?>
        <div>
            <input type="text" placeholder="Search..." id="ss-search-query" title="Type search term here">
        </div>
        <div id="ss-search-results">

        </div>
        <?php
        return ob_get_clean();
    }

}

?>