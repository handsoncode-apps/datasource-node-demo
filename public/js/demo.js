
$(document).ready(function() {
  $('.clear-logs').on('click', function() {
    $('#log').empty()
  })

  $('.toggle-logs').on('click', function() {
    $('.data').toggle();
    $('.fa-plus-square, .fa-minus-square').toggleClass('fa-minus-square fa-plus-square')
  })
})

function showLog(data) {
  var $log = $("#log");
  var reqDiv = '<div class="request request--' + data.request.method.toLowerCase() + '">' +
              '<i class="toggle-data fal fa-plus-square"></i>' +
              '<div class="method">' + data.request.method + '</div>' +
              '<div class="url">' + data.request.url + '</div>' +
              '<div class="data">' +
                '<div class="req-body payload">' +
                  '<p>Request</p>' +
                  '<div class="json">'+
                    '<div class="headers"></div>' +
                    '<div class="req-json-placeholder"></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="res-body">' +
                    '<p>Response</p>' +
                    '<div class="res-json-placeholder json"></div>' +
                  '</div>' +
                '</div>' +
              '</div>' +
            '</div>'
  $(reqDiv).hide().prependTo($log).fadeIn(500)
  if (data.request.body){
    jsonTree.create(JSON.parse(data.request.body), $log.find('.req-json-placeholder:first')[0]);
  }

  $.each(data.request.headers,function(key, value){
    $log.find('.headers:first').append("<span>" + key +": </span><span>" + value + "</span><br>");
  });

  jsonTree.create(data.response, $log.find('.res-json-placeholder:first')[0]);

  $('.request:first .toggle-data').on('click', function() {
    if ($(this).siblings('.data').css('display') !== 'none' ) {
      $(this).removeClass('fa-minus-square').addClass('fa-plus-square').siblings('.data').fadeOut(100)
    } else {
      $(this).removeClass('fa-plus-square').addClass('fa-minus-square').siblings('.data').fadeIn(100)
    }
  });
}
