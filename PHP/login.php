<?php
require_once 'core/init.php';

if (Input::exists()) {
    if (Token::check(Input::get('token'))) {
        $user = new User();
        $login = $user->login(Input::get('username'), Input::get('password'), true);
        if ($login) {
            $continue = Input::get('redirect_uri');            
            Redirect::to('dashboard.php');
        } else {
            Redirect::to('login.php?e=false');
        }
    }
}
?>
<!DOCTYPE html>
<html lang="en">

    <head>
        <title><?php echo Config::get('app/title'); ?></title><meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="stylesheet" href="assets/css/bootstrap.min.css" />
        <link rel="stylesheet" href="assets/css/bootstrap-responsive.min.css" />
        <link rel="stylesheet" href="assets/css/maruti-login.css" />
    </head>
    <body>
        <div id="loginbox">            
            <form id="loginform" class="form-vertical" method="POST" action="">
                <div class="control-group normal_text"><h3>WID-U LOGICS</h3></div>
                <div class="control-group">
                    <div class="controls">
                        <div class="main_input_box">
                            <span class="add-on"><i class="icon-user"></i></span><input id="username" type="text" name="username" placeholder="Username / Email" />
                        </div>
                    </div>
                </div>
                <div class="control-group">
                    <div class="controls">
                        <div class="main_input_box">
                            <span class="add-on"><i class="icon-lock"></i></span><input id="password" type="password" name="password" placeholder="Password" />
                        </div>
                    </div>
                </div>
                <input type="hidden" name="redirect_uri" value="<?php echo (isset($_REQUEST['continue']) ? $_REQUEST['continue'] : ''); ?>" id="redirect">
                <input type="hidden" name="token" value="<?php echo Token::generate(); ?>" id="token">
                <div class="form-actions">
                    <span class="pull-left"><a href="#" class="flip-link btn btn-warning" id="to-recover">Lost password?</a></span>
                    <span class="pull-right"><input type="submit" class="btn btn-success" value="Login" /></span>
                </div>
            </form>
                        <form id="recoverform" action="#" class="form-vertical">
                            <p class="normal_text">Enter your e-mail address below and we will send you instructions <br/><font color="#FF6633">how to recover a password.</font></p>
            
                            <div class="controls">
                                <div class="main_input_box">
                                    <span class="add-on"><i class="icon-envelope"></i></span><input type="text" placeholder="E-mail address" />
                                </div>
                            </div>
            
                            <div class="form-actions">
                                <span class="pull-left"><a href="#" class="flip-link btn btn-warning" id="to-login">&laquo; Back to login</a></span>
                                <span class="pull-right"><input type="submit" class="btn btn-info" value="Recover" /></span>
                            </div>
                        </form>
        </div>

        <script src="assets/js/jquery.min.js"></script>  
        <script src="assets/js/maruti.login.js"></script> 
    </body>

</html>