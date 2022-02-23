const {Pool} = require('pg');
const express = require('express');
const app = express();
var rand = require("generate-key");

const pool = new Pool({
    // To Do : Connection string needs to be in a variable for prod use.
    connectionString: "postgres://qhgomctuujzvlc:08256e3da5bc83c8f2cb08feec189089d74275f0c29ab37aeb79beca9a4dafa6@ec2-54-228-97-176.eu-west-1.compute.amazonaws.com:5432/d80ano56lpbm6v",
    ssl: {
        rejectUnauthorized: false
    }
});

app.listen(3300, ()=>{
    console.log("Sever is now listening at port 3300");
})

app.get('/auth/:uname/:passwd', (req, res)=>{
    var uname = req.params.uname;
    var passwd = req.params.passwd;
    var kunji = rand.generateKey(10);
    console.log(' Usernamne is ' + uname+' Password is ' + passwd + ' Random Key is ' +kunji); 
    //To do - key can be longer and encryption to be added
    pool.query(`Select Username,password__c from arch.user where Username = '`+ uname+`' And password__c = '`+ passwd +`' `, (err, result)=>{
        if(!err && Number(result.rows.length)>0){
            console.log(result.rows.length);
            let updateQuery = `update arch.user
                    set sessionId__c = '${kunji}'
                    where Username = '${uname}'`;
            pool.query(updateQuery, (err, result)=>{
                if(!err){
                    res.send('{"StatusCode":"200","kunji":"'+kunji+'"}');
                }
                else{ 
                    //console.log(err.message); 
                    res.send('{"StatusCode":"400","kunji":""}');
                }
            })     
        } else {
            console.log("Error - Failed to find user");
            //console.log(err);
            res.send('{"StatusCode":"400","kunji":""}');
        }
    });
    pool.end;
})

app.get('/sessioncheck/:kunji', (req, res)=>{
    var kunji = req.params.kunji;
    console.log(' Session Id  is ' +kunji); 
    //To do - key can be longer and encryption to be added
    pool.query(`Select Username,password__c from arch.user where sessionId__c = '`+ kunji+`' `, (err, result)=>{
        console.log(' result.rows >>> '+result.rows);
        if(!err && result.rows != ''){
            res.send('{"StatusCode":"200","kunji":"'+kunji+'"}');
        } else {
            console.log("Error - Failed to find user");
            console.log(err);
            res.send('{"StatusCode":"400","kunji":""}');
        }
    });
    pool.end;
})

pool.connect();