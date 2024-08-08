<?php
require_once 'core/init.php';

if(Input::exists('get') || Input::exists()) {	
	if(Input::get('action') != 'new') {
		if(Hash::validateKey()) {
			switch (Input::get('action')) {
				case 'edit':
					editUser();
					break;
				case 'delete':
					echo deleteUser();
					break;
				
				default:
					# code...
					break;
			}
		}
	} else {
		addNewUser();
	}
} else {
	Redirect::to(403);
}

function addNewUser() {
	Redirect::to('user_new.php');
}

function editUser() {
	Redirect::to('user_edit.php?uid=' . Input::get('user_id'));
}

function deleteUser() {
	$user = new User();
	if($user->removeUser(Input::get('user_id'))) {
		$result = ['message' => 'User deleted successfully!'];
        header('HTTP/1.0 200 Ok');
        return json_encode($result);
	} else {
		$result = ['message' => 'Unable to delete user, Please Try again!'];
    	header('HTTP/1.0 500 Internal server error');
        return json_encode($result);
	}
}
?>