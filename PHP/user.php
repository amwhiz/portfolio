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
  <div class="quick-actions_homepage">
    <ul class="quick-actions">
          <li> <a href="dashboard.php"> <i class="icon-dashboard"></i> My Dashboard </a> </li>
          <li> <a href="order.php"> <i class="icon-shopping-bag"></i> Manage Orders</a> </li>
          <li> <a href="track.php"> <i class="icon-web"></i> Manage Tracks </a> </li>
          <li> <a href="user.php"> <i class="icon-people"></i> Manage Users </a> </li>
          <li> <a href="event.php"> <i class="icon-calendar"></i> Manage Events </a> </li>
    </ul>
  </div>
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
            <span class="icon"><i class="icon-th-large"></i></span> 
            <h5>Manage Users</h5>
            <div class="add-plus"><a href="user_action.php?action=new"><span class="icon"><i class="icon-plus"></i> New User</span></a></div>
          </div>
          <div class="widget-content nopadding">
            <table class="table table-bordered data-table" id="user_list">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Joined</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <?php                  
                    echo displayAllUser();                                  
                ?>
              </tbody>
            </table>
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
<script src="assets/js/select2.min.js"></script> 
<script src="assets/js/jquery.dataTables.min.js"></script> 
<script src="assets/js/maruti.js"></script> 
<script src="assets/js/maruti.tables.js"></script>
</body>
</html>


