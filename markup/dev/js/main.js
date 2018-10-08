$(document).ready(function() {
    
  // MODAL WINDOWS
  
  $('.modal-opener').on('click', function () {
    var modalname = $(this).data('modal');
    if (modalname.length != 0) {
      $('body').addClass('body-no-scroll');
      $('.page-wrapper').addClass('page-wrapper_blur');
      $('.modal-container').addClass('modal-container_visible');
      $('.' + modalname + '-modal').addClass('modal_visible');
    }
  });

  $(document).on('click', function(e) {
    var clickTarget = $(e.target);
    if (clickTarget.hasClass('modal-container_visible')) {
      $('.modal').removeClass('modal_visible');
      $('.modal-container').removeClass('modal-container_visible');
      $('body').removeClass('body-no-scroll');
      $('.page-wrapper').removeClass('page-wrapper_blur');
    } else if (clickTarget.hasClass('modal-close')) {
      $('.modal').removeClass('modal_visible');
      $('.modal-container').removeClass('modal-container_visible');
      $('body').removeClass('body-no-scroll');
      $('.page-wrapper').removeClass('page-wrapper_blur');
    }
  });

  $(document).keydown(function(e) {
    if (e.keyCode === 27) {
      $('.modal').removeClass('modal_visible');
      $('.modal-container').removeClass('modal-container_visible');
      $('body').removeClass('body-no-scroll');
      $('.page-wrapper').removeClass('page-wrapper_blur');
      $('.header__reserve').removeClass('header__reserve_clicked');
    }
  });
  
  $('.mobile-nav-opener').on('click', function() {
    $('body').addClass('body-no-scroll');
    $('.header').addClass('header_opened');
  });

});