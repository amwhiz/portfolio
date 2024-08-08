<?php

require_once 'core/init.php';
// echo Config::get('mysql/host');exit;
if (Session::exists('home')) {
    echo Session::flash('home');
}
$user = new User();
if ($user->isLoggedIn()) {
	$user->getAllUser();
    ?>
    <?php
	    echo escape($user->data()->username);
	    echo '<br><a href="logout.php">Logout</a>';
    ?>
    <?php
}
?>