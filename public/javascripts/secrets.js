$(document).on('click', '#submit-new-secret', function(evt) {
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
  var item = $(this).parent();
  item.after(Handlebars.templates['edit-secret']({
    id: item.data('secret-id'),
    existingText: item.find('p').text()
  }));
  item.hide();
});

$(document).on('click', '.reset-button', function(evt) {
  var item = $(this).parent();
  item.prev().show();
  item.remove();
});

$(document).on('click', '.edit-button', function(evt) {
  var item = $(this).parent();
  var id = item.data('secret-id');
  var content = item.find('input').val();
  if (content.trim().length === 0) {
    alert('Input must not be empty');
    return;
  }
  $.post(
    '/secrets/' + id,
    {content: content}
  ).done(function(response) {
    item.after(Handlebars.templates['secret']({
      _id: id,
      content: content
    }));
    item.prev().remove();
    item.remove();
  }).fail(function(jqxhr) {
    alert('An unknown error occurred.');
  });
});
