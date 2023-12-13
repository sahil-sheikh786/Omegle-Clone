const mongoose = require("mongoose");
var UserDB = require("../model/model");
const { use } = require("../routes/router");

exports.create = (req, res) => {
    const user = new UserDB({
        active:"yes",
        status:"0",
    });

    user.save()
    .then((data) => {
       res.send(data); 
    })
    .catch((err) => {
        res.status(500).send({
            message:
            err.message ||
            "Some error occured while creating a create opertaion", 
        });
    });
};
exports.leavingUserUpdate = (req, res) => {
    const userid = req.params.id;
    console.log("leaving userid is: ", userid);

    UserDB.updateOne({ _id: userid }, {$set:{active: "no", status:0}})
    .then((data)=>{
        if(!data){
            res.status(404).send({
                message: `Cannot update user with ${userid} Maybe user not found!`,
            });
        }else{
            res.send("1 document updated");
        }
    })
    .catch((err) => {
        res.status(500).send({ message: "Error update user information"});
    });
};
exports.newUserUpdate = (req, res) => {
    const userid = req.params.id;
    console.log("Revisited userid is: ", userid);

    UserDB.updateOne({ _id: userid }, {$set:{active:"yes", status:0}})
    .then((data)=>{
        if(!data){
            res.status(404).send({
                message: `Cannot update user with ${userid} Maybe user not found!`,
            });
        }else{
            res.send("1 document updated");
        }
    })
    .catch((err) => {
        res.status(500).send({ message: "Error update user information"});
    });
};
exports.updateOnEngagement = (req, res) => {
    const userid = req.params.id;
    console.log("Revisited userid is: ", userid);

    UserDB.updateOne({ _id: userid }, { $set: { status: "1"} })
    .then((data)=>{
        if(!data){
            res.status(404).send({
                message: `Cannot update user with ${userid} Maybe user not found!`,
            });
        }else{
            res.send("1 document updated");
        }
    })
    .catch((err) => {
        res.status(500).send({ message: "Error update user information"});
    });
};
exports.updateOnNext = (req, res) => {
    const userid = req.params.id;
    console.log("Revisited userid is: ", userid);

    UserDB.updateOne({ _id: userid }, { $set: { status: "0"} })
    .then((data)=>{
        if(!data){
            res.status(404).send({
                message: `Cannot update user with ${userid} Maybe user not found!`,
            });
        }else{
            res.send("1 document updated");
        }
    })
    .catch((err) => {
        res.status(500).send({ message: "Error update user information"});
    });
};
exports.remoteUserFind = (req, res) => {
    const omeID = req.body.omeID;
    console.log('Received omeID:', omeID);
    if (!mongoose.Types.ObjectId.isValid(omeID)) {
        console.log('Invalid omeID format');
        return res.status(400).send({ message: "Invalid omeID format" });
    }
    UserDB.aggregate([
        {
            $match:{
                _id: {$ne: new mongoose.Types.ObjectId(omeID)},
                active:"yes",
                status:"0",
            },
        },
        {$sample:{size:1}},
    ])
    .limit(1)
    .then((data) => {
        console.log('Found remote user:', data);
        res.send(data);
    })
    .catch((err) => {
        console.error('Error while retrieving user information:', err);
        res.status(500).send({
            message: err.message || "Error occured while retriving user information",
        });
    });

};
exports.getNextUser = (req, res) => {
    const omeID = req.body.omeID;
    const remoteUser = req.body.remoteUser;
    let excludedIds = [omeID, remoteUser];

    UserDB.aggregate([
        {
            $match:{
                _id: { $min: excludedIds.map((id) => new mongoose.Types.ObjectId(id))},
                active: "yes",
                status: "0",
            },
        },
        {$sample: { size: 1 } },
    ])
    .then((data)=>{
        res.send(data);
    })
    .catch((err) => {
        res.status(500).send({
            message: err.message || "Error occured while retriving user information",
        });
    });
};
