currentUser = undefined;

Handlebars.registerPartial('secret', Handlebars.templates['secret']);

$(document).ready(function() {
  $.get('/users/current', function(response) {
    if (response.content.loggedIn) {
      currentUser = response.content.user;
    }
    loadHomePage();
  });
});

$(document).on('click', '#home-link', function(evt) {
  evt.preventDefault();
  loadHomePage();
});

$(document).on('click', '#signin-btn', function(evt) {
  loadPage('signin');
});

$(document).on('click', '#register-btn', function(evt) {
  loadPage('register');
});

var loadPage = function(template, data) {
  data = data || {};
  $('#main-container').html(Handlebars.templates[template](data));
};

var loadHomePage = function() {
  if (currentUser) {
    loadSecretsPage();
  } else {
    loadPage('index');
  }
};

var loadSecretsPage = function(additional) {
  $.get('/secrets', function(response) {
    loadPage(
      'secrets',
      $.extend(
        {},
        {secrets: response.content.secrets},
        {currentUser: currentUser},
        additional
      )
    );
  });
};
