<?php

class User {

    private $_db;
    private $_data;
    private $_sessionName;
    private $_cookieName;
    private $_isLoggedIn;
    private $_isAdmin;

    public function __construct($user = null) {
        $this->_db = DB::getInstance();
        $this->_sessionName = Config::get('session/session_name');
        $this->_cookieName = Config::get('remember/cookie_name');

        if (!$user) {
            if (Session::exists($this->_sessionName)) {
                $user = Session::get($this->_sessionName);

                if ($this->find($user)) {
                    $this->_isLoggedIn = true;
                } else {
                    // logout
                }
            }
        } else {
            $this->find($user);
        }
    }

    public function create($fields = array()) {
        if (!$this->_db->insert('tbl_user', $fields)) {
            throw new Exception('There was a problem creating an account.');
        }
    }

    public function find($user = null) {
        if ($user) {
            $field = is_numeric($user) ? 'user_id' : 'username';
            $data = $this->_db->get('tbl_user', [$field, '=', $user]);

            if ($data->count()) {
                $this->_data = $data->first();
                return true;
            }
        }
        return false;
    }

    public function login($username = null, $password = null, $remember = false) {
        $user = $this->find($username);

        if (!$username && !$password && $this->exists()) {
            Session::put($this->_sessionName, $this->data()->user_id);
        } else {
            if ($user) {
                if (true) {
                    Session::put($this->_sessionName, $this->data()->user_id);
                    if ($remember) {
                        $hash = Hash::unique();
                        $hashCheck = $this->_db->get('tbl_user_session', [
                            'user_id', '=', $this->data()->user_id
                        ]);
                        if (!$hashCheck->count()) {
                            $this->_db->insert('user_session', [
                                'user_id' => $this->data()->user_id,
                                'hash' => $hash
                            ]);
                        } else {
                            $hash = $hashCheck->first()->hash;
                        }

                        Cookie::put($this->_cookieName, $hash, Config::get('remember/cookie_expiry'));
                    }
                    return true;
                }
            }
        }
        return false;
    }

    public function logout() {
        $this->_db->delete('tbl_user_session', ['user_id', '=', $this->data()->user_id]);
        Session::delete($this->_sessionName);
        Cookie::delete($this->_cookieName);
    }

    public function data() {
        return $this->_data;
    }

    public function isLoggedIn() {
        return $this->_isLoggedIn;
    }

    public function exists() {
        return (!empty($this->_data)) ? true : false;
    }

    public function hasAdmin() {
        $this->_isAdmin = true;
        return $this->_isAdmin;
    }

    public function getAllUser($sort = 'ASC', $offset = 0, $limit = 100, $filter = 'username') {
        if($this->hasAdmin()) {
            $sql = "SELECT u.user_id, u.username, u.email, u.first_name, u.last_name, u.status, u.joined, r.name, r.code FROM tbl_user u LEFT JOIN tbl_role r ON u.role_id = r.role_id ORDER BY {$filter} {$sort} LIMIT {$offset}, {$limit}";            
            $data = $this->_db->query($sql);
            if ($data->count()) {
                return $data->results();
            }
        } else {
            return false;
        }
    }

    public function checkUserName($value) {
        if($this->hasAdmin()) {            
            $data = $this->_db->get('tbl_user', ['username', '=', $value]);            
            if(!$data->count()) {
                return true;
            }
            return false;
        }
        return false;
    }

    public function removeUser($id) {
        if($this->hasAdmin()) {
            $data = $this->_db->delete('tbl_user', ['user_id', '=', $id]);            
            if($data->count()) {
                return true;
            }
            return false;
        }
        return false;
    }

    public function getUserById($id) {
        $data = $this->_db->get('tbl_user', ['user_id', '=', $id]);
        if($data->count()) {
            return $data->first();
        }
        return false;
    }

}
