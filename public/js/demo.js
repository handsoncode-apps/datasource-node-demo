function showLog(data) {
  var $log = $("#log");
  var reqDiv = '<div class="request request--' + data.request.method.toLowerCase() + '">' +
              '<div class="method">' + data.request.method + '</div>' +
              '<div class="url">' + data.request.url + '</div>' +
              '<div class="data">' +
                '<div class="req-body payload">' +
                  '<i class="toggle-data fal fa-minus-square"></i>' +
                  '<p>Request</p>' +
                  '<div class="json">'+
                    '<div class="headers"></div>' +
                    '<div class="req-json-placeholder"></div>' +
                    '</div>' +
                  '</div>' +
                  '<div class="res-body">' +
                    '<i class="toggle-data fal fa-minus-square"></i>' +
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
    if ($(this).siblings('.json').css('display') !== 'none' ) {
      $(this).siblings('.json').fadeOut(100)
    } else {
      $(this).siblings('.json').fadeIn(100)
    }
  });
}
