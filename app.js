//jshint esversion:6
const mongoose = require("mongoose");
const express = require("express");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-jashan:Test123@learningcluster.wjwhi.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = new mongoose.Schema({
    task: {
        type: String,
        required: true
    }
});

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
    task: "Welcome to your todolist!"
});

const item2 = new Item({
    task: "Hit + to add a new item."
});

const item3 = new Item({
    task: "<-- Hit this to complete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
    name: String,
    items: [itemSchema]
});

const List = mongoose.model("List", listSchema);

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

app.get("/", function(req, res) {

    // const day = date.getDate();
    Item.find({}, function(err, results){
        if(err){
            console.log(err);
        } 
        // Add default items if none exist
        else if(results.length === 0) {
            Item.insertMany(defaultItems, function(err){
                if(err){
                    console.log(err);
                }
            });
            res.redirect("/");
        } 
        else {
            res.render("list", {listTitle: "Today", items: results});
        }
    });
});

app.get("/:customListName", function(req,res){
    const listName = _.capitalize(req.params.customListName);

    List.findOne({name: listName}, function(err, result){
        if(err){
            console.log(err);
        } else {
            if(!result){
                const list = new List({
                    name: listName,
                    items: defaultItems
                });
            
                list.save();
                res.redirect("/" + listName);
            }
            else {
                res.render("list", {listTitle: result.name, items: result.items});
            }

        }
    });
    
});

app.post("/", function(req, res){

    const item = new Item({
        task: req.body.newItem
    });
    const listTitle = req.body.list;

    if(listTitle === "Today"){
        item.save();
        res.redirect("/");
    }
    else {
        List.updateOne({name: listTitle}, {$addToSet: {items: item}}, function(err, result){
            console.log(item);
            if (err) {
                console.log(err);
            }
            res.redirect("/" + listTitle);
        });
    }
    
});

app.post("/delete", function(req, res){
    const itemID = req.body.checkbox;
    const listTitle = req.body.listTitle;
    if(listTitle === "Today"){
        Item.findByIdAndRemove(itemID, {useFindAndModify: false}, function(err){
            if(err){
                console.log(err);
            }
        });
        res.redirect("/");
    }
    else {
        List.findOneAndUpdate({name: listTitle}, {$pull: {items: {_id: itemID}}}, {useFindAndModify: false}, function(err, result){
            if(err){
                console.log(err);
            }
            res.redirect("/" + listTitle);
        });
    }
});

app.get("/about", function(req, res){
    res.render("about");
});

let port = process.env.PORT;
if(port == null || port ==""){
    port = 3000;
}

app.listen(port, function() {
    console.log("Server started");
});
