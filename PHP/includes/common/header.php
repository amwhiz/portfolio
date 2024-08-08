<?php
require_once 'core/init.php';
$user = new User();
if(!$user->isLoggedIn()) {
  $url =  $_SERVER['REQUEST_SCHEME'] . '://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
  Redirect::to('login.php?continue=' . $url);
}
?>