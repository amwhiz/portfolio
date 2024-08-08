<?php
require_once 'core/init.php';

if (Input::exists()) {
    if (Token::check(Input::get('token'))) {
        try {
            $user = new User();

            $salt = Hash::salt(32);
            $user->create([
                'username' => Input::get('username'),
                'email' => Input::get('email'),
                'password' => Hash::make(Input::get('password'), $salt),
                'salt' => $salt,
                'first_name' => Input::get('first_name'),
                'last_name' => Input::get('last_name')
            ]);
            Session::flash('home', 'You have been registered and can now log in!');
            Redirect::to('index.php');
        } catch (Exception $ex) {
            die($ex->getMessage());
        }
    }
}
?>
<form action="" method="post">
    <input type="text" name="username" id="username" value="" autocomplete="off">
    <input type="text" name="email" id="email" value="" autocomplete="off">
    <input type="password" name="password" id="password">
    <input type="text" name="first_name" id="first_name" value="">
    <input type="text" name="last_name" id="last_name" value="">
    <input type="hidden" value="<?php echo Token::generate(); ?>" name="token">
    <input type="submit" value="register">
</form>

