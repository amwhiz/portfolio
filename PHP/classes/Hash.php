<?php

class Hash {

    public static function make($string, $salt = '') {
        return hash('sha256', $string . $salt);
    }

    public static function salt($length) {
        return mcrypt_create_iv($length);
    }

    public static function unique() {
        return self::make(uniqid());
    }

    public static function generateKey() {    	
    	$uniqid = rand();
		$key = MD5($uniqid . '~' . $_SERVER['REQUEST_SCHEME'] . $_SERVER['HTTP_HOST']);
		return ['key' => $key, 'uid' => $uniqid];
    }

    public static function validateKey() {    	
    	$key = Input::get('k');
    	$uid = Input::get('v');    	    	
    	$hash = MD5($uid . '~' .$_SERVER['REQUEST_SCHEME'] . $_SERVER['HTTP_HOST']);
    	if($key === $hash) {
    		return true;
    	}
    	return false;
    }

}
