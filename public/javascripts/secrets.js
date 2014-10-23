$(document).on('click', '#submit-new-secret', function(evt) {
  // YOUR CODE HERE (part 2)
  var content = $('#new-secret-input').val();
  if (content.trim().length === 0) {
    alert('Input must not be empty');
    return;
  }
  $.post(
    '/secrets',
    {content: content}
  ).done(function(response) {
    loadHomePage();
  }).fail(function(jqxhr) {
    var response = $.parseJSON(jqxhr.responseText);
    $('.error').text(response.err);
  });
});

$(document).on('click', '.delete-secret', function(evt) {
  // YOUR CODE HERE (part 2)
  var item = $(this).parent();
  var id = item.data('secret-id');
  $.ajax({
    url: '/secrets/' + id,
    type: 'DELETE'
  }).done(function(response) {
    item.remove();
  }).fail(function(jqxhr) {
    alert('An unknown error occurred.');
  });
});

$(document).on('click', '.edit-secret', function(evt) {
  // YOUR CODE HERE (part 2)
});

$(document).on('click', '.reset-button', function(evt) {
  // YOUR CODE HERE (part 2)
});

$(document).on('click', '.edit-button', function(evt) {
  // YOUR CODE HERE (part 2)
});
