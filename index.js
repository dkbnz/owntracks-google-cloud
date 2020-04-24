
/**
 * Authenticates user using basic http authentication.
 * If request is lacks authorization header, respond with authorization request
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function authenticate(req, res) {
  if (!req.headers.authorization) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Location Upload"');
    res.status(401).send("Unauthorized");
  } else {
    const base64Credentials =  req.headers.authorization.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    if (credentials !== 'user:pass') {
      res.status(401).send("Unauthorized");
    }
  }
}

/**
 * Retrieve list of locations user has been
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function retrievePoints(req, res) {
  res.status(200).send("Here are the point/s");
}

/**
 * Store location in database
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function storePoints(req, res) {
  res.status(200).send("Thanks for the point/s");
}

/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
  switch(req.method) {
    case 'GET':
      retrievePoints(req, res)
      break;
    case 'POST':
      authenticate(req, res)
      storePoints(req, res)
      break;
    default:
      res.status(501).send('Not Implemented')
  }
