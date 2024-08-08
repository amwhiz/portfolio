<?php
function getStatusCode($status) {
	switch ($status) {
		case 1:
			return '<span class="btn btn-mini btn-success">Active</span>';
			break;

		case 0:
			return '<span class="btn btn-mini btn-warning">Pending</span>';
			break;

		case -1:
			return '<span class="btn btn-mini btn-danger">Inactive</span>';
			break;		
		
		default:
			return 'Invalid Option';
			break;
	}
}

function displayAllUser() {
	$user = new User();
    $userDetails = $user->getAllUser();
    $table = '';
    foreach ($userDetails as $key => $value) {
		$code = isset($value->code) ? $value->code : '--';        
        $table .= "<tr class='gradeX'>";
        $table .= "<td>" . $value->username . "</td>";
        $table .= "<td>" . $value->email . "</td>";
        $table .= "<td>" . $value->first_name . "</td>";
        $table .= "<td>" . $value->last_name . "</td>";
        $table .= "<td class='center'>" . date("M d, Y", strtotime($value->joined)) . "</td>";
        $table .= "<td class='center'><span class='tip-top' data-original-title='".$value->name."'>" . $code . "</span></td>";
        $table .= "<td class='center'>" . getStatusCode($value->status) . "</td>";
        $table .= "<td class='center action'>" . generateLink($value, 'user_id', 'user_action') . "</td>";
        $table .= "</tr>";
	}
	return $table;
}

function generateLink($value, $key, $to) {
	$auth = Hash::generateKey();
	$link = '';
	$link .= "<a href='" . $to . ".php?action=edit&" . $key . "=" . $value->$key . "&k=" . $auth['key'] . "&v=" . $auth['uid'] ."'><i class='icon icon-edit'></i></a>";
	$link .= "<a id='user_remove' href='javascript:;' data-url='" . $to . ".php?action=delete&" . $key . "=" . $value->$key . "&k=" . $auth['key'] . "&v=" . $auth['uid'] ."'><i class='icon icon-trash'></i></a>";
	return $link;
}

function displayRoles($role_id = null) {
	$roles = Common::getRoles();
	$option = '';
	foreach ($roles as $key => $value) {
		$selected = ($role_id == $value->role_id ) ? 'selected="selected"' : '';
		$option .= "<option value='" . $value->role_id . "'" . $selected .">" . $value->name . "</option>";
	}
	return $option;
}

function displayUserStatus($v) {
	$status = [
		0 => ['key' => 1, 'value' => 'Active'],
		1 => ['key' => 0, 'value' => 'Pending'],
		2 => ['key' => -1, 'value' => 'Inactive']
		];	
	$option = '';
	foreach ($status as $key => $value) {
		$selected = ($v == $value['key'] ) ? 'selected="selected"' : '';
		$option .= "<option value='" . $value['key'] . "'" . $selected .">" . $value['value'] . "</option>";
	}
	return $option;    
}

function userAvailable($value) {
	$user = new User();
	$result = $user->checkUserName($value);
	if($result) {
		return true;
	}
	return false;
}

function newUser() {
	try {
        $user = new User();
        $salt = Hash::salt(32);
        $user->create([
            'username' => Input::get('user_name'),
            'email' => Input::get('email'),
            'password' => Hash::make(Input::get('password'), $salt),
  	        'salt' => $salt,
            'first_name' => Input::get('first_name'),
            'last_name' => Input::get('last_name'),
            'role_id' => Input::get('role')
        ]);
        $result = ['message' => 'New user added successfully!'];
        header('HTTP/1.0 200 Ok');
        return json_encode($result);        
    } catch (Exception $ex) {
    	$result = ['message' => 'Unable to add new user Please Try again'];
    	header('HTTP/1.0 500 Internal server error');
        return json_encode($result);
    }
}
?>