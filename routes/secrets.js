var express = require('express');
var router = express.Router();
var db = require('../data/db');
var utils = require('../utils/utils');

var secrets = db.get('secrets');
var users = db.get('users');

/*
  Require authentication on ALL access to /secrets/*
  Clients which are not logged in will receive a 403 error code
*/
var requireAuthentication = function(req, res, next) {
  if (!req.currentUser) {
    utils.sendErrResponse(res, 403, 'Must be logged in to use this feature.');
  } else {
    next();
  }
};

/*
  Require ownership whenever accessing a particular secret
  This means that the client accessing the resource must be logged in
  as the user that originally created the secret.
  Clients which are not owners of this particular resource will receive a 404

  Why 404? We dont' want to distinguish between secrets that don't exist at all
  and secrets that exist but don't belong to the client. This way a malicious client
  that is brute-forcing urls should not gain any information
*/
var requireOwnership = function(req, res, next) {
  if (!req.currentUser._id.equals(req.secret.creator)) {
    utils.sendErrResponse(res, 404, 'Resource not found.');
  } else {
    next();
  }
};

/*
  For create and edit requests, require that the request body
  contains a 'content' field. Send error code 400 if not
*/
var requireContent = function(req, res, next) {
  if (!req.body.content) {
    utils.sendErrResponse(res, 400, 'Content required in request.');
  } else {
    next();
  }
};

/*
  Parse the secret id out of the URL
*/
router.param('secret', function(req, res, next, secretId) {
  secrets.findOne({
    _id: secretId
  }, function(err, secret) {
    if (secret) {
      req.secret = secret;
      next();
    } else {
      utils.sendErrResponse(res, 404, 'Resource not found.');
    }
  });
});

router.all('*', requireAuthentication);
router.all('/:secret', requireOwnership);
router.post('*', requireContent);

/*
  At this point, all requests are authenticated and checked:
  1. Clients must be logged into some account
  2. If accessing or modifying a specific resource, the client must own that secret
  3. Requests are well-formed
*/

/*
  GET /secrets
  No request parameters
  Response:
    - success: true if the server succeeded in getting the user's secrets
    - content: on success, an object with a single field 'secrets', which contains a list of the
    user's secrets
    - err: on failure, an error message
*/
router.get('/', function(req, res) {
  secrets.find( { _id: { $in: req.currentUser.secrets } }, function(err, secrets) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res, { secrets: secrets });
    }
  });
});

/*
  GET /secrets/:secret_id
  Request parameters:
    - secret_id: a String representation of the MongoDB _id of the secret
  Response:
    - success: true if the server succeeded in getting the user's secrets
    - content: on success, the secret object with _id equal to the secret_id passed into the URL
    - err: on failure, an error message
*/
router.get('/:secret', function(req, res) {
  utils.sendSuccessResponse(res, req.secret);
});

/*
  POST /secrets
  Request body:
    - content: the content of the secret
  Response:
    - success: true if the server succeeded in recording the user's secret
    - err: on failure, an error message
*/
router.post('/', function(req, res) {
  secrets.insert({
    content: req.body.content,
    creator: req.currentUser._id
  }, function(err, secret) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      users.update({ _id: req.currentUser._id }, {
        $addToSet: {
          secrets: secret._id
        }
      });
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  POST /secrets/:secret_id
  Request parameters:
    - secret_id: a String representation of the MongoDB _id of the secret
  Response:
    - success: true if the server succeeded in recording the user's secret
    - err: on failure, an error message
*/
router.post('/:secret', function(req, res) {
  secrets.update( { _id: req.secret._id }, {
    $set: {
      content: req.body.content
    }
  }, function(err) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

/*
  DELETE /secrets/:secret_id
  Request parameters:
    - secret_id: a String representation of the MongoDB _id of the secret
  Response:
    - success: true if the server succeeded in deleting the user's secret
    - err: on failure, an error message
*/
router.delete('/:secret', function(req, res) {
  secrets.remove({ _id: req.secret._id }, function(err, result) {
    if (err) {
      utils.sendErrResponse(res, 500, 'An unknown error occurred.');
    } else {
      utils.sendSuccessResponse(res);
    }
  });
});

module.exports = router;
