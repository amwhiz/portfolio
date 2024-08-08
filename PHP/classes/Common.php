<?php

class Common {
	public static function getRoles() {
		$db = DB::getInstance();
		$data = $db->query("SELECT role_id, name FROM tbl_role ORDER BY role_id");
		if($data->count()) {
			return $data->results();
		}
		return false;
	}
}