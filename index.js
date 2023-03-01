const agent = require('superagent');
let fs = require ('fs');

function fallthrough(){
    let fileContents = null;
    fs.readFileSync("cached/cached.json", "utf-8", function(err, data){
        fileContents = data;
        if(err){
            error(err);
        }
    });
    if(fileContents !== null){
        return fileContents;
    }else{
        return error("No Cached File");
    }
}

const fileManager = {
    fileContents : null,
    isOpen : false,
    fileStatus : function(){
        //This here because I've built similar things in the past and
        //ran into issues with timing of stuff
        return this.isOpen;
    },
    readFile : function(fileName){
        this.isOpen = true;
        this.fileContents = null;
        try{
            this.fileContents = fs.readFileSync(fileName, 'utf-8');
            if(this.fileContents !== null){
                this.isOpen = false;
                return this.fileContents;
            }
        }catch(e){
            error("File Manager Read Error: " + e);
        }
    },
    writeFile : function(fileName, data){
        this.fileContents = null;
        this.isOpen = true;
        try{
            fs.writeFileSync(fileName, data, 'utf-8');
            this.isOpen = false;
        } catch(e){
            error("File Manager Write Error: " + e);
        }
    }
};

console.log(fileManager.readFile("cached/cached.json"));
fileManager.writeFile('cached/testing.txt', 'I <3 Node JS');
console.log(fileManager.readFile('cached/testing.txt'));

function error(message){
    return JSON.stringify({'error' : message});
}

