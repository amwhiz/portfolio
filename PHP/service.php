<?php
require_once 'core/init.php';
$type = Input::get('fieldId');
$value = Input::get('fieldValue');

switch ($type) {
	case 'user_name':
		$result = userAvailable($value);		
		$data[0] = $type;
		$data[1] = false;
		if($result) {
			$data[1] = true;			
		}
		echo json_encode($data);
		break;

	case 'new_user':
		echo newUser();
		break;	
	default:
		
		break;
}
?>