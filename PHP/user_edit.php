<?php
include 'includes/common/header.php';
include 'includes/common/title.php';
?>
<link rel="stylesheet" href="assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="assets/css/bootstrap-responsive.min.css" />
<link rel="stylesheet" href="assets/css/uniform.css" />
<link rel="stylesheet" href="assets/css/select2.css" />    
<link rel="stylesheet" href="assets/css/maruti-style.css" />
<link rel="stylesheet" href="assets/css/maruti-media.css" class="skin-color" />
<link rel="stylesheet" href="assets/css/validationEngine.jquery.css" type="text/css"/>
</head>
<body>
<?php
include 'includes/common/header_info.php';
include 'includes/common/nav.php';
?>
<div id="content">
  <?php
  include 'includes/common/breadcrumb.php';  
  ?>
  <div class="container-fluid">
    <div class="row-fluid">
      <div class="span12">
        <div class="alert alert-success alert-block"> <a class="close" data-dismiss="alert" href="#">×</a>
          <h4 class="alert-heading">Success!</h4>
          <p class="message"></p>
        </div>
        <div class="alert alert-error alert-block"> <a class="close" data-dismiss="alert" href="#">×</a>
          <h4 class="alert-heading">Error!</h4>
          <p class="message"></p>
        </div>
      </div>
    </div>
    <div class="row-fluid">      
      <div class="span12">
          <div class="widget-box">
              <div class="widget-title">
                <span class="icon">
                  <i class="icon-align-justify"></i>                  
                </span>
                <h5>Edit User</h5>
              </div>
              <div class="widget-content nopadding">
                <form action="#" method="POST" class="form-horizontal" id="edit_user">
                  <?php
                  $user = new User();
                  $result = $user->getUserById(Input::get('uid'));
                  ?>
                  <div class="control-group">
                    <label class="control-label">First Name :</label>
                    <div class="controls"><input value="<?php echo $result->first_name; ?>" type="text" placeholder="First name" id="first_name" name="first_name" class="validate[required,custom[onlyLetterSp]] text-input span3"/></div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">Last Name :</label>
                    <div class="controls"><input value="<?php echo $result->last_name; ?>" type="text" class="validate[required,custom[onlyLetterSp]] text-input span3" placeholder="Last name" id="last_name" name="last_name" /></div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">User Name :</label>
                    <div class="controls"><input value="<?php echo $result->username; ?>" type="text" class="validate[required,custom[onlyLetterSp]] text-input span3" placeholder="User name" id="user_name" name="user_name" disabled/></div>
                  </div>                  
                  <div class="control-group">
                    <label class="control-label">Email :</label>
                    <div class="controls"><input value="<?php echo $result->email; ?>" type="email" id="email" class="span3 validate[required,custom[email]] text-input" placeholder="Email" name="email" /></div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">Status</label>
                    <div class="controls">
                      <select name="role" id="role" class="validate[required] span2">
                        <option value="">-- Select Status --</option>                       
                        <?php echo displayUserStatus($result->status); ?>
                      </select>
                    </div>
                  </div>
                  <div class="control-group">
                    <label class="control-label">Select Level</label>
                    <div class="controls">
                      <select name="role" id="role" class="validate[required] span2">
                        <option value="">-- Select Level --</option>                       
                        <?php echo displayRoles($result->role_id); ?>
                      </select>
                    </div>
                  </div>
                  <div class="form-actions">
                    <button id="user_update" type="submit" class="btn btn-success">Update</button>
                    <a href="user.php"><button id="cancel" type="button" class="btn btn-primary">Cancel</button></a>
                  </div>
                </form>
              </div>
            </div>        
      </div>
    </div>    
  </div>
</div>
<?php include('includes/common/footer.php'); ?>
<script src="assets/js/jquery.min.js"></script>
<script src="assets/js/jquery.ui.custom.js"></script>
<script src="assets/js/bootstrap.min.js"></script>
<script src="assets/js/jquery.uniform.js"></script>
<script src="assets/js/maruti.js"></script>
<script src="assets/js/jquery.validationEngine-en.js" type="text/javascript" charset="utf-8"></script>
<script src="assets/js/jquery.validationEngine.js" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript">
jQuery(document).ready(function(){
  jQuery("#edit_user").validationEngine();  
});
</script>
</body>
</html>