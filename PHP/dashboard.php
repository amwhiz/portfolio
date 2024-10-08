<?php
include 'includes/common/header.php';
include 'includes/common/title.php';
?>
<link rel="stylesheet" href="assets/css/bootstrap.min.css" />
<link rel="stylesheet" href="assets/css/bootstrap-responsive.min.css" />
<link rel="stylesheet" href="assets/css/fullcalendar.css" />
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
        <div class="widget-box">
          <div class="widget-title"><span class="icon"><i class="icon-signal"></i></span>
            <h5>Site Analytics</h5>
            <div class="buttons"><a href="#" class="btn btn-mini"><i class="icon-refresh"></i> Update stats</a></div>
          </div>
          <div class="widget-content">
            <div class="row-fluid">
              <div class="span12">
                <div class="chart"></div>
              </div>
            </div></div></div>
        <div class="row-fluid">
              <div class="span6">
                <div class="widget-box">
                  <div class="widget-title"><span class="icon"><i class="icon-file"></i></span>
                    <h5>Latest Posts</h5>
                    </div>
                  <div class="widget-content nopadding">
                    <ul class="recent-posts">
                      <li>
                        <div class="user-thumb"> <img width="40" height="40" alt="User" src="img/demo/av1.jpg"> </div>
                        <div class="article-post"> <span class="user-info"> By: john Deo / Date: 2 Aug 2012 / Time:09:27 AM </span>
                          <p><a href="#">This is a much longer one that will go on for a few lines.It has multiple paragraphs and is full of waffle to pad out the comment.</a> </p>
                          </div>
                      </li>
                      <li>
                        <div class="user-thumb"> <img width="40" height="40" alt="User" src="img/demo/av2.jpg"> </div>
                        <div class="article-post"> <span class="user-info"> By: john Deo / Date: 2 Aug 2012 / Time:09:27 AM </span>
                          <p><a href="#">This is a much longer one that will go on for a few lines.It has multiple paragraphs and is full of waffle to pad out the comment.</a> </p>
                          </div>
                      </li>
                      <li>
                        <div class="user-thumb"> <img width="40" height="40" alt="User" src="img/demo/av4.jpg"> </div>
                        <div class="article-post"> <span class="user-info"> By: john Deo / Date: 2 Aug 2012 / Time:09:27 AM </span>
                          <p><a href="#">This is a much longer one that will go on for a few lines.Itaffle to pad out the comment.</a> </p>
                          </div>
                         
                     <li><button class="btn btn-warning btn-mini">View All</button></li>
                    </ul> 
                  </div>
                </div>
              </div>
              
              <div class="span6">
                <div class="widget-box">
                  <div class="widget-title"> <span class="icon"> <i class="icon-refresh"></i> </span>
                    <h5>News updates</h5>
                  </div>
                  <div class="widget-content nopadding updates">
                    <div class="new-update clearfix"><i class="icon-ok-sign"></i>
                      <div class="update-done"><a title="" href="#"><strong>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</strong></a> <span>dolor sit amet, consectetur adipiscing eli</span> </div>
                      <div class="update-date"><span class="update-day">20</span>jan</div>
                    </div>
                    <div class="new-update clearfix"> <i class="icon-gift"></i> <span class="update-notice"> <a title="" href="#"><strong>Congratulation Maruti, Happy Birthday </strong></a> <span>many many happy returns of the day</span> </span> <span class="update-date"><span class="update-day">11</span>jan</span> </div>
                    <div class="new-update clearfix"> <i class="icon-move"></i> <span class="update-alert"> <a title="" href="#"><strong>Maruti is a Responsive Admin theme</strong></a> <span>But already everything was solved. It will ...</span> </span> <span class="update-date"><span class="update-day">07</span>Jan</span> </div>
                    <div class="new-update clearfix"> <i class="icon-leaf"></i> <span class="update-done"> <a title="" href="#"><strong>Envato approved Maruti Admin template</strong></a> <span>i am very happy to approved by TF</span> </span> <span class="update-date"><span class="update-day">05</span>jan</span> </div>
                    <div class="new-update clearfix"> <i class="icon-question-sign"></i> <span class="update-notice"> <a title="" href="#"><strong>I am alwayse here if you have any question</strong></a> <span>we glad that you choose our template</span> </span> <span class="update-date"><span class="update-day">01</span>jan</span> </div>
                  </div>
                </div>
              </div>
              
              </div> 
             
          
      </div>
    </div>
    <div class="widget-box">
      <div class="widget-content">
        <div class="row-fluid">
          <div class="span6">
            <div class="alert alert-success">We made chat option here, check out by writing something<a href="#" class="close" data-dismiss="alert">×</a></div>
            <div class="widget-box widget-chat">
              <div class="widget-title"> <span class="icon"> <i class="icon-comment"></i> </span>
                <h5>Chat Option</h5>
              </div>
              <div class="widget-content nopadding">
                <div class="chat-users panel-right2">
                  <div class="panel-title">
                    <h5>Online Users</h5>
                  </div>
                  <div class="panel-content nopadding">
                    <ul class="contact-list">
                      <li id="user-Sunil" class="online"><a href=""><img alt="" src="img/demo/av1.jpg" /> <span>Sunil</span></a></li>
                      <li id="user-Laukik"><a href=""><img alt="" src="img/demo/av2.jpg" /> <span>Laukik</span></a></li>
                      <li id="user-vijay" class="online new"><a href=""><img alt="" src="img/demo/av3.jpg" /> <span>Vijay</span></a><span class="msg-count badge badge-info">3</span></li>
                      <li id="user-Jignesh" class="online"><a href=""><img alt="" src="img/demo/av4.jpg" /> <span>Jignesh</span></a></li>
                      <li id="user-Malay" class="online"><a href=""><img alt="" src="img/demo/av5.jpg" /> <span>Malay</span></a></li>
                    </ul>
                  </div>
                </div>
                <div class="chat-content panel-left2">
                  <div class="chat-messages" id="chat-messages">
                    <div id="chat-messages-inner"></div>
                  </div>
                  <div class="chat-message well">
                    <button class="btn btn-success">Send</button>
                    <span class="input-box">
                    <input type="text" name="msg-box" id="msg-box" />
                    </span> </div>
                </div>
              </div>
            </div>
          </div>
          <div class="span6">
            <div class="accordion" id="collapse-group">
              <div class="accordion-group widget-box">
                <div class="accordion-heading">
                  <div class="widget-title"> <a data-parent="#collapse-group" href="#collapseGOne" data-toggle="collapse"> <span class="icon"><i class="icon-magnet"></i></span>
                    <h5>Accordion Example 1</h5>
                    </a> </div>
                </div>
                <div class="collapse in accordion-body" id="collapseGOne">
                  <div class="widget-content"> It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end. </div>
                </div>
              </div>
              <div class="accordion-group widget-box">
                <div class="accordion-heading">
                  <div class="widget-title"> <a data-parent="#collapse-group" href="#collapseGTwo" data-toggle="collapse"> <span class="icon"><i class="icon-magnet"></i></span>
                    <h5>Accordion Example 2</h5>
                    </a> </div>
                </div>
                <div class="collapse accordion-body" id="collapseGTwo">
                  <div class="widget-content">And is full of waffle to It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.</div>
                </div>
              </div>
              <div class="accordion-group widget-box">
                <div class="accordion-heading">
                  <div class="widget-title"> <a data-parent="#collapse-group" href="#collapseGThree" data-toggle="collapse"> <span class="icon"><i class="icon-magnet"></i></span>
                    <h5>Accordion Example 3</h5>
                    </a> </div>
                </div>
                <div class="collapse accordion-body" id="collapseGThree">
                  <div class="widget-content"> Waffle to It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just </div>
                </div>
              </div>
            </div>
          </div>
          <div class="span6">
            <div class="widget-box">
              <div class="widget-title">
                <ul class="nav nav-tabs">
                  <li class="active"><a data-toggle="tab" href="#tab1">Tab1</a></li>
                  <li><a data-toggle="tab" href="#tab2">Tab2</a></li>
                  <li><a data-toggle="tab" href="#tab3">Tab3</a></li>
                </ul>
              </div>
              <div class="widget-content tab-content">
                <div id="tab1" class="tab-pane active"><p>And is full of waffle to It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end. </p>
                  <img src="img/demo/demo-image1.jpg" alt="demo-image"/></div>
                <div id="tab2" class="tab-pane">
                  <img src="img/demo/demo-image2.jpg" alt="demo-image"/><p>And is full of waffle to It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end. </p></div>
                <div id="tab3" class="tab-pane"><p>And is full of waffle to It has multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end.multiple paragraphs and is full of waffle to pad out the comment. Usually, you just wish these sorts of comments would come to an end. </p>
                  <img src="img/demo/demo-image3.jpg" alt="demo-image"/></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>
<?php include('includes/common/footer.php'); ?>
<script src="assets/js/excanvas.min.js"></script> 
<script src="assets/js/jquery.min.js"></script> 
<script src="assets/js/jquery.ui.custom.js"></script> 
<script src="assets/js/bootstrap.min.js"></script> 
<script src="assets/js/jquery.flot.min.js"></script> 
<script src="assets/js/jquery.flot.resize.min.js"></script> 
<script src="assets/js/jquery.peity.min.js"></script> 
<script src="assets/js/fullcalendar.min.js"></script> 
<script src="assets/js/maruti.js"></script> 
<script src="assets/js/maruti.dashboard.js"></script> 
<script src="assets/js/maruti.chat.js"></script> 
<script type="text/javascript">
  // This function is called from the pop-up menus to transfer to
  // a different page. Ignore if the value returned is a null string:
  function goPage (newURL) {

      // if url is empty, skip the menu dividers and reset the menu selection to default
      if (newURL != "") {
      
          // if url is "-", it is this page -- reset the menu:
          if (newURL == "-" ) {
              resetMenu();            
          } 
          // else, send page to designated URL            
          else {  
            document.location.href = newURL;
          }
      }
  }

// resets the menu selection upon entry to this page:
function resetMenu() {
   document.gomenu.selector.selectedIndex = 2;
}
</script>
</body>
</html>


