$(document).on('submit', '#signin-form', function(evt) {
  evt.preventDefault();
  $.post(
    '/users/login',
    helpers.getFormData(this)
  ).done(function(response) {
    currentUser = response.content.user;
    loadHomePage();
  }).fail(function(jqxhr) {
    var response = $.parseJSON(jqxhr.responseText);
    loadPage('signin', {error: response.err});
  });
});

$(document).on('submit', '#register-form', function(evt) {
  evt.preventDefault();
  var formData = helpers.getFormData(this);
  if (formData.password !== formData.confirm) {
    $('.error').text('Password and confirmation do not match!');
    return;
  }
  delete formData['confirm'];
  $.post(
    '/users',
    formData
  ).done(function(response) {
    loadHomePage();
  }).fail(function(jqxhr) {
    var response = $.parseJSON(jqxhr.responseText);
    loadPage('register', {error: response.err});
  });
});

$(document).on('click', '#logout-link', function(evt) {
  evt.preventDefault();
  $.post(
    '/users/logout'
  ).done(function(response) {
    currentUser = undefined;
    loadHomePage();
  }).fail(function(jqxhr) {
    var response = $.parseJSON(jqxhr.responseText);
    loadSecretsPage({error: response.err});
  });
});
