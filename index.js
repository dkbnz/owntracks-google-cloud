const Firestore = require('@google-cloud/firestore');

const PROJECTID = 'owntracks-record';
const COLLECTION_NAME = 'locations';

const database = new Firestore({
  projectId: PROJECTID,
  timestampsInSnapshots: true,
});


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
    const base64Credentials = req.headers.authorization.split(' ')[1];
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
  return database.collection(COLLECTION_NAME).get().then(snapshot => {
    return res.status(200).send({
      "type": "FeatureCollection",
      "features": snapshot.docs.map(doc => doc.data())
    });
  }).catch(err => {
    console.error(err);
    return res.status(404).send({
      error: 'Unable to retrieve the document',
      err
    });
  });
}


/**
 * Store location in database as a GeoJSON feature
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
function storePoints(req, res) {
  data = req.body
  if (data._type !== "location") {
    return res.status(501).send('Not Implemented')
  }
  return database.collection(COLLECTION_NAME)
    .add({
      "type": "Feature",
      "geometry": {
        "type": "Point",
        "coordinates": [Number.parseFloat(data.lon), Number.parseFloat(data.lat)]
      },
      "properties": {
         "tst": Number.parseFloat(data.tst)
      }
    }).then(doc => {
      console.info('Location stored with id', doc.id);
      return res.status(200).send(doc.id);
    }).catch(err => {
      console.error(err);
      return res.status(404).send({
        error: 'Unable to store',
        err
      });
    });
}


/**
 * Responds to any HTTP request.
 *
 * @param {!express:Request} req HTTP request context.
 * @param {!express:Response} res HTTP response context.
 */
exports.main = (req, res) => {
  switch (req.method) {
    case 'GET':
      return retrievePoints(req, res)
      break;
    case 'POST':
      authenticate(req, res)
      return storePoints(req, res)
      break;
    default:
      res.status(501).send('Not Implemented')
  }
}
