<?php
ini_set("error_reporting", "true");
error_reporting(E_ALL|E_STRCT);

session_start();
date_default_timezone_set("America/Los_Angeles");
$GLOBALS['config'] = [
    'mysql' => [
        'host' => '127.0.0.1',
        'user' => 'root',
        'pass' => '',
        'name' => 'tracking'
    ],
    'remember' => [
        'cookie_name' => 'hash',
        'cookie_expiry' => 604800
    ],
    'session' => [
        'session_name' => 'user',
        'token_name' => 'tm_token'
    ],
    'app' => [
        'title' => 'WID-U LOGICS'
    ]
];

spl_autoload_register(function($class) {
    require_once 'classes/' . $class . '.php';
});

require_once 'functions/sanitize.php';
require_once 'functions/helper.php';

// if (Cookie::exists(Config::get('remember/cookie_name')) && !Session::exists(Config::get('session/session_name'))) {
//     $hash = Cookie::get(Config::get('remember/cookie_name'));
//     $hashCheck = DB::getInstance()->get('user_session', ['hash', '=', $hash]);
//     if ($hashCheck->count()) {
//         $user = new User($hashCheck->first()->user_id);
//         $user->login();
//     }
// }
