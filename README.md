# Typescript mongodb for ACE 

* Typescript completer for ACE editor, 实现了Method Auto Completer, Parameter Auto Completr, Quick Info, Type Definition(CTRL+mouse hover)
* Mongo Completer for ACE Editor, 实现了 Mongo Modifier Completor 及 Collection Field Completer.

---------------------------------------------
## 安装及依赖 (使用）

* $ npm install 
 
## 安装及依赖 (开发）

* $ git clone git://github.com/noteon/typescript-tools.git
* $ npm install -g electron bower typescript
* $ bower install
* $ npm install --production  //npm i will trigger npm prepublish, it's a bug

## 编译

* $ tsc

## 运行 demo

* $ npm start

## 如何使用

```
    var aceTs=require("ace-typescript-mongo");

    var tsEditor=aceTs.setupAceEditor({
        tsFilePath:"/tmp/guid.ts",
        tsTypings:[__dirname+"/lodash.d.ts"],
        editorTheme:"monokai",
        editorElem:'ts-editor',
        dbFieldsFetcher: function (collectionName){
          return [{
                      fieldName: '_id',
                      collection: "order",
                  },
                  {    
                      fieldName: 'amount',
                      collection: "order",
                  },
  
                  {
                      fieldName: 'user.fname',
                      collection: "order",
                  },
                  
                  {
                      fieldName: 'user.lname',
                      collection: "order",
                  },
                  
                  {
                      fieldName: 'fname',
                      collection: "user",
                  },
                  
                  {
                      fieldName: 'lname',
                      collection: "user",
                  }
                  
                  ].filter(function(it){
                    if (!collectionName) return true
                    return collectionName===it.collection
                  })
  
      }
    });
    
```

参见 ./bin/ace.html  