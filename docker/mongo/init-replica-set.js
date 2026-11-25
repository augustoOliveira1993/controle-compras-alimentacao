const status = db.adminCommand({ replSetGetStatus: 1 });
if (status.codeName === 'NotYetInitialized') {
  rs.initiate({ _id: 'rs0', members: [{ _id: 0, host: 'mongo:27017' }] });
}
quit(db.hello().isWritablePrimary ? 0 : 1);
