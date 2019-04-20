/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

// direct access to database for cleanup ops
// var MongoClient = require('mongodb');
// var ObjectId = require('mongodb').ObjectID;
// const CONNECTION_STRING = process.env.DB; 

chai.use(chaiHttp);

suite('Functional Tests', function() {
  this.timeout(20000)
  
    suite('POST /api/issues/{project} => object with issue data', function() {
      
      test('Every field filled in', function(done) {
        chai.request(server)
        .post('/api/issues/test')
        .send({
          issue_title: 'Title',
          issue_text: 'text',
          created_by: 'Functional Test - Every field filled in',
          assigned_to: 'Chai and Mocha',
          status_text: 'In QA'
        })
        .end(function(err, res){
          if (err) console.log(err)
          assert.equal(res.status, 200)
          assert.property(res.body, 'issue_title')
          assert.equal(res.body.issue_title, 'Title')
          assert.property(res.body, 'issue_text')
          assert.equal(res.body.issue_text, 'text')
          assert.property(res.body, 'created_by')
          assert.equal(res.body.created_by, 'Functional Test - Every field filled in')
          assert.property(res.body, 'assigned_to')
          assert.equal(res.body.assigned_to, 'Chai and Mocha')
          assert.property(res.body, 'status_text')
          assert.equal(res.body.status_text, 'In QA')
          assert.property(res.body, 'created_on')
          assert.property(res.body, 'updated_on')
          
          // clean up by deleting the issue we just created after the test
          chai.request(server)
            .delete('/api/issues/test')
            .send({
              _id: res.body._id
            })
            .end(function (err2, res2) {
              if (err2) console.log(err2)
              done();
            })
        });
      });
      
      test('Required fields filled in', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            issue_text: 'text',
            created_by: 'Functional Test - Required fields filled in',
          })
          .end(function (err, res) {
            if (err) console.log(err)
            assert.equal(res.status, 200)
            assert.property(res.body, 'issue_title')
            assert.equal(res.body.issue_title, 'Title')
            assert.property(res.body, 'issue_text')
            assert.equal(res.body.issue_text, 'text')
            assert.property(res.body, 'created_by')
            assert.equal(res.body.created_by, 'Functional Test - Required fields filled in')
            assert.property(res.body, 'assigned_to')
            assert.equal(res.body.assigned_to, '')
            assert.property(res.body, 'status_text')
            assert.equal(res.body.status_text, '')
            assert.property(res.body, 'created_on')
            assert.property(res.body, 'updated_on')

            // clean up by deleting the issue we just created after the test
            chai.request(server)
              .delete('/api/issues/test')
              .send({
                _id: res.body._id
              })
              .end(function (err2, res2) {
                done();
              })
          });
      });
      
      test('Missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Title',
            created_by: 'Functional Test - Missing Required Fields',
          })
          .end(function (err, res) {
            if (err) console.log(err)
            assert.equal(res.status, 200)
            assert.equal(res.text, 'missing inputs')
            done();
          });
      });
      
    });
    
    suite('PUT /api/issues/{project} => text', function() {

      test('No body', function (done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'PUT test',
            issue_text: 'PUT test',
            created_by: 'Functional Test - PUT',
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: testID
              })
              .end(function (err2, res2) {
                if (err2) console.log(err)
                assert.equal(res2.status, 200)
                assert.equal(res2.text, `could not update ${testID}`)
                // final cleanup by deleting issue
                chai.request(server)
                  .delete('/api/issues/test')
                  .send({
                    _id: testID
                  })
                  .end(function (err3, res3) {
                    if (err3) console.log(err3)
                    done();
                  })
              });
          })
      });

      test('One field to update', function (done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'PUT test',
            issue_text: 'PUT test',
            created_by: 'Functional Test - PUT',
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: testID,
                issue_title: 'New Title1',
                updated_on: new Date
              })
              .end(function (err2, res2) {
                if (err2) console.log(err2)
                assert.equal(res2.status, 200)
                assert.equal(res2.text, 'successfully updated')
                // final cleanup by deleting issue
                chai.request(server)
                  .delete('/api/issues/test')
                  .send({
                    _id: testID
                  })
                  .end(function (err3, res3) {
                    if (err3) console.log(err3)
                    done();
                  })
              });
          })
      });

      test('Multiple fields to update', function (done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'PUT test',
            issue_text: 'PUT test',
            created_by: 'Functional Test - PUT',
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .put('/api/issues/test')
              .send({
                _id: testID,
                issue_title: 'New Title2',
                issue_text: 'New Text2',
                updated_on: new Date
              })
              .end(function (err2, res2) {
                if (err2) console.log(err2)
                assert.equal(res2.status, 200)
                assert.equal(res2.text, 'successfully updated')
                // final cleanup by deleting issue
                chai.request(server)
                  .delete('/api/issues/test')
                  .send({
                    _id: testID
                  })
                  .end(function (err3, res3) {
                    if (err3) console.log(err3)
                    done();
                  })
              });
            })
      })
    })
    
    suite('GET /api/issues/{project} => Array of objects with issue data', function() {
      
      test('No filter', function(done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'GET test',
            issue_text: 'GET test',
            created_by: 'Functional Test - GET',
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
            .get('/api/issues/test')
            .query({})
            .end(function(err2, res2){
              assert.equal(res2.status, 200);
              assert.isArray(res2.body);
              assert.property(res2.body[0], 'issue_title');
              assert.property(res2.body[0], 'issue_text');
              assert.property(res2.body[0], 'created_on');
              assert.property(res2.body[0], 'updated_on');
              assert.property(res2.body[0], 'created_by');
              assert.property(res2.body[0], 'assigned_to');
              assert.property(res2.body[0], 'open');
              assert.property(res2.body[0], 'status_text');
              assert.property(res2.body[0], '_id');
              // final cleanup by deleting issue
              chai.request(server)
                .delete('/api/issues/test')
                .send({
                  _id: testID
                })
                .end(function (err3, res3) {
                  if (err3) console.log(err3)
                  done();
                })
            });
          })
      });
      
      test('One filter', function(done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'GET test',
            issue_text: 'GET test',
            created_by: 'Functional Test - GET',
            status_text: 'In QA'
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .get('/api/issues/test')
              .query({status_text: 'In QA'})
              .end(function (err2, res2) {
                assert.equal(res2.status, 200);
                assert.isArray(res2.body);
                assert.property(res2.body[0], 'issue_title');
                assert.property(res2.body[0], 'issue_text');
                assert.property(res2.body[0], 'created_on');
                assert.property(res2.body[0], 'updated_on');
                assert.property(res2.body[0], 'created_by');
                assert.property(res2.body[0], 'assigned_to');
                assert.property(res2.body[0], 'open');
                assert.property(res2.body[0], 'status_text');
                assert.property(res2.body[0], '_id');
                assert.equal(res2.body[0].status_text, 'In QA')
                // final cleanup by deleting issue
                chai.request(server)
                  .delete('/api/issues/test')
                  .send({
                    _id: testID
                  })
                  .end(function (err3, res3) {
                    if (err3) console.log(err3)
                    done();
                  })
              });
            })
      });
      
      test('Multiple filters (test for multiple fields you know will be in the db for a return)', function(done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'New Title2',
            issue_text: 'New Text2',
            created_by: 'Functional Test - GET',
            status_text: 'In QA'
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .get('/api/issues/test')
              .query({ issue_title: 'New Title2', issue_text: 'New Text2' })
              .end(function (err2, res2) {
                assert.equal(res2.status, 200);
                assert.isArray(res2.body);
                assert.property(res2.body[0], 'issue_title');
                assert.property(res2.body[0], 'issue_text');
                assert.property(res2.body[0], 'created_on');
                assert.property(res2.body[0], 'updated_on');
                assert.property(res2.body[0], 'created_by');
                assert.property(res2.body[0], 'assigned_to');
                assert.property(res2.body[0], 'open');
                assert.property(res2.body[0], 'status_text');
                assert.property(res2.body[0], '_id');
                assert.equal(res2.body[0].issue_title, 'New Title2')
                assert.equal(res2.body[0].issue_text, 'New Text2')
                // final cleanup by deleting issue
                chai.request(server)
                  .delete('/api/issues/test')
                  .send({
                    _id: testID
                  })
                  .end(function (err3, res3) {
                    if (err3) console.log(err3)
                    done();
                  })
              });
          })
      });
      
    });
    
    suite('DELETE /api/issues/{project} => text', function() {
      
      test('No _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function (err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, '_id error')
            done();
          });
      });
      
      test('Valid _id', function(done) {
        // first prepare by creating new issue
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'New Title2',
            issue_text: 'New Text2',
            created_by: 'Functional Test - GET',
            status_text: 'In QA'
          })
          .end(function (err, res) {
            const testID = res.body._id
            chai.request(server)
              .delete('/api/issues/test')
              .send({_id: testID})
              .end(function (err2, res2) {
                assert.equal(res2.status, 200)
                assert.equal(res2.text, `deleted ${testID}`)
                done();
              });
            })
      });
      
    });

});
