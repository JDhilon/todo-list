# To Do List

## Introduction

> This is a todo list developed using Node.js and MongoDB for creating and storing todo lists. You can see the finished product at https://degrassi-crown-28579.herokuapp.com/

> Custom lists can be created by simply navigating to https://degrassi-crown-28579.herokuapp.com/CUSTOMLISTNAME

> This app was developed as part of a [Udemy course on Web Development](https://www.udemy.com/course/the-complete-web-development-bootcamp/)

## Code Samples

> In order to handle custom lists, there is a get route built to handle any list name as input. It will capitalize the list name, and then see if it exists. If it does, the list will be rendered, else a new list will be created with the provided list name. 

```javascript
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
```

>To add items to a list, the list title and task information is retrieved from the request. It will then update the list with the provided item and re-render the page.

```javascript
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
```

>For deleting, if the list is the default one, a simple findByIdAndRemove will delete the item. For custom lists, a pull query is run to edit the list.

```javascript
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
```

## Installation

 - Clone the repository
```
git clone  https://github.com/JDhilon/todo-list.git todo-list
```

- Install dependencies
```
cd todo-list
npm install
```

- Build and run the project
```
npm start
```
Navigate to `http://localhost:3000`
