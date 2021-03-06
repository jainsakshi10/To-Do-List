//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _= require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sakshi:Test123@cluster0.ttvp0.mongodb.net/todolistDB", {
  useUnifiedTopology: true,
  useNewUrlParser: true,
  useFindAndModify: false
});

const itemsSchema = {
  name: String
};
const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Welcome to your todo list!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item."
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err, results) {

    if (results.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err)
          console.log(err);
        else
          console.log("Added Succesfully!");
      })
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        newListItems: results
      });
    }
  })
});

app.get("/:customListName", function(req, res) {
  const customListName =_.capitalize(req.params.customListName);
  List.findOne({
    name: customListName
  }, function(err, results) {
    if (!err) {
      if (!results) {
        const list = new List({
          name: customListName,
          items: defaultItems
        })
        list.save();
        res.redirect("/"+customListName);
      } else {
        res.render("list", {
          listTitle: customListName,
          newListItems: results.items
        });
      }
    }

  })

})

app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName= req.body.list;
  const item = new Item({
    name: itemName
  });

  if(listName=="Today")
  {
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name: listName}, function(err, results)
  {
    results.items.push(item);
    results.save();
    res.redirect("/"+listName)
  })
  }


});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  if(listName==="Today")
  {
    Item.findByIdAndRemove(checkedItemId, function(err) {
      if (!err)
        console.log("Succesfully deleted checked item!");
      res.redirect("/");
    })
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}, function(err)
  {
    if(!err)
      res.redirect("/"+listName);
  })
  }


})

app.get("/work", function(req, res) {
  res.render("list", {
    listTitle: "Work List",
    newListItems: workItems
  });
});

app.get("/about", function(req, res) {
  res.render("about");
});

let port= process.env.PORT;
if(port==null || port=="")
  post=3000;

app.listen(port, function() {
  console.log("Server has started successfully");
});
