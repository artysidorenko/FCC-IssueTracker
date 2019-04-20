/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var ObjectId = require('mongodb').ObjectID;

const CONNECTION_STRING = process.env.DB; 

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      const project = req.params.project;
      const query = req.query
      if (query._id) query._id = new ObjectId(query._id)
      if (!project) res.send('no project name entered')
      else {
        MongoClient.connect(CONNECTION_STRING, function (connErr, client) {
          if (connErr) console.log(`GET DB Connection Error: ${connErr}`)
          // console.log('GET DB Connected')
          const db = client.db('test')
          var collection = db.collection(project);
          collection.find(query).toArray(function(findErr, results) {
            if (findErr) console.log(`GET DB Find Error: ${findErr}`)
            res.json(results)
          });
        });
      }
    })
    
    .post(function (req, res){
      const project = req.params.project;
      const newIssue = {
        issue_title: req.body.issue_title,
        issue_text: req.body.issue_text,
        created_by: req.body.created_by,
        assigned_to: req.body.assigned_to || '',
        status_text: req.body.status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      }
      if (!newIssue.issue_title || !newIssue.issue_text || !newIssue.created_by) {
        res.send('missing inputs');
      } else {
        MongoClient.connect(CONNECTION_STRING, function (connErr, client) {
          if (connErr) console.log(`POST DB Connection Error: ${connErr}`)
          // console.log('POST DB Connected')
          const db = client.db('test')
          var collection = db.collection(project);
          collection.insertOne(newIssue, function(insertErr, doc) {
            if (insertErr) console.log(`POST DB Insert Error: ${insertErr}`)
            newIssue._id = doc.ops[0]._id;
            res.json(newIssue)
          });
        });
      }
    })
    
    .put(function (req, res){
      const project = req.params.project;
      const updateIssue = {}
      if (req.body.issue_title) updateIssue.issue_title = req.body.issue_title
      if (req.body.issue_text) updateIssue.issue_text = req.body.issue_text
      if (req.body.created_by) updateIssue.created_by = req.body.created_by
      if (req.body.assigned_to) updateIssue.assigned_to = req.body.assigned_to
      if (req.body.status_text) updateIssue.status_text = req.body.status_text
      if (req.body.open !== null) updateIssue.open = !req.body.open // open===true in form means checkbox is ticked -> close issue
      if (updateIssue.length > 0) updateIssue.updated_on = new Date()
      if (!req.body._id) {
        res.send('missing issue id field');
      } else {
        MongoClient.connect(CONNECTION_STRING, function (connErr, client) {
          if (connErr) console.log(`PUT DB Connection Error: ${connErr}`)
          // console.log('PUT DB Connected')
          const db = client.db('test')
          var collection = db.collection(project);
          console.log(updateIssue)
          collection.updateOne({_id: new ObjectId(req.body._id)}, {$set: updateIssue}, function (updateErr, result) {
            console.log(result.modifiedCount)
            if (updateErr) console.log(`PUT DB Update Error: ${updateErr}`)
            if (result.matchedCount === 0) {
              res.send(`could not find id ${req.body._id}`)
            } else if (result.modifiedCount > 0) res.send('successfully updated')
            else res.send(`could not update ${req.body._id}`)
          });
        });
      }
    })
    
    .delete(function (req, res){
      const project = req.params.project;
      if (!project) res.send('no project name entered')
      else if (!req.body._id) res.send('_id error')
      else {
        const _id = new ObjectId(req.body._id)
        MongoClient.connect(CONNECTION_STRING, function (connErr, client) {
          if (connErr) console.log(`DEL DB Connection Error: ${connErr}`)
          // console.log('DEL DB Connected')
          const db = client.db('test')
          var collection = db.collection(project);
          collection.deleteOne({_id: _id} , function (delErr, results) {
            if (delErr) {
              console.log(`DEL DB Find Error: ${delErr}`)
              res.send('could not delete ' + req.body._id)
            }
            res.send('deleted ' + req.body._id)
          });
        });
      }
    });
    
};
