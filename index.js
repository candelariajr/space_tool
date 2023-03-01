const agent = require('superagent');
let fs = require ('fs');
let http = require('http');


let errorHandler = {
    outerTarget : null,
    // This echos directly to the client. It should only be used
    // for serious fuck-ups!
    echo : function(message){
        return JSON.stringify({'error' : message});
    },
    // These are errors that don't break functionality that the client can handle
    appendTarget: function(added_key, value){
        if(this.outerTarget === null){
            this.outerTarget = {};
            this.outerTarget[added_key] = value;
        }else{
            this.outerTarget[added_key] = value;
        }
    },
    // See if an outer target is present and if so, return it in Object form to be
    // added to client JSON
    getOuterTarget: function(){
        if(this.outerTarget === null){
            return false;
        }else{
            return this.outerTarget;
        }
    },
    // Clear Target (Any time a successful API call is made and cache is updated
    // all outer target cache should be cleared
    removeTarget: function(){
        this.outerTarget = null;
    }
};


const fileManager = {
    fileContents : null,
    isOpen : false,
    fileStatus : function(){
        //This here because I've built similar things in the past and
        //ran into issues with timing of stuff
        return this.isOpen;
    },
    readFile : function(fileName){
        if(!this.fileStatus()){
            this.isOpen = true;
            this.fileContents = null;
            try{
                this.fileContents = fs.readFileSync(fileName, 'utf-8');
                if(this.fileContents !== null){
                    this.isOpen = false;
                    // Moved: Keep data manipulation close to object
                    // return JSON.parse(this.fileContents);
                    return this.fileContents;
                }
            }catch(e){
                this.error(e);
            }
        }
    },
    writeFile : function(fileName, data){
        this.fileContents = null;
        this.isOpen = true;
        try{
            fs.writeFileSync(fileName, data, 'utf-8');
            this.isOpen = false;
        } catch(e){
            this.error(e)
        }
    },
    error: function(error){
        errorHandler.appendTarget('File Manager Error ', error)
    }
};

console.log(fileManager.readFile("cached/cached.json"));
fileManager.writeFile('cached/testing.txt', 'I <3 Node JS');
console.log(fileManager.readFile('cached/testing.txt'));


let configService = {
    cachePod : 'cached/cached.json'
}

const eventSpool = {

};

const webHandler = {
    httpObject : http,
    cachePod: null,
    start: function(){
        let cacheName = configService.cachePod;
        this.cachePod = fileManager.readFile(cacheName);
        this.httpObject.createServer(function(request, response){
            webHandler.listen(request, response);
        }).listen(8080);
    },
    listen: function(request, response){
        response.write(JSON.stringify({'test' : 'Hello World', 'cachePod' : webHandler.cachePod}));
        response.end();
    }
};

webHandler.start();
