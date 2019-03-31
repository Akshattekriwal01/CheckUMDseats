var express = require('express')
var app     = express()
var request = require('request')
var cheerio = require('cheerio')
const { exec } = require('child_process');


var parsedData

var server  = app.listen(3004);
app.set("view engine", "ejs");


var subjectArr =["CMSC320","STAT410","CMSC216","CMSC330","CMSC351","CMSC451"]
subjectArr.sort()
var subjects = ""
    subjectArr.forEach(element => {
        subjects += element+","
    })

//gives the JSON 
request("https://api.umd.io/v0/courses/"+subjects+"?expand=sections",(error,response,body)=>{
    if(!error){
        parsedData= JSON.parse(body);
    }
          
  var i = -1
  function myloop () {
      setTimeout(()=>{
//==================
      i++
      console.log("pulling latest data")
//console.log("value of i before request ="+i)
request("https://app.testudo.umd.edu/soc/search?courseId="+subjectArr[i]+"&sectionId=&termId=201908&_openSectionsOnly=on&creditCompare=&credits=&courseLevelFilter=ALL&instructor=&_facetoface=on&_blended=on&_online=on&courseStartCompare=&courseStartHour=&courseStartMin=&courseStartAM=&courseEndHour=&courseEndMin=&courseEndAM=&teachingCenter=ALL&_classDay1=on&_classDay2=on&_classDay3=on&_classDay4=on&_classDay5=on",(error,response,body)=>{
        
    if(!error && response.statusCode==200){
        const $ = cheerio.load(body)
        var j = 0
      //  console.log("api success")
      //  console.log("value in of i ="+i)
        parsedData[i].sections.forEach(e => {
            var os =  $('.open-seats-count').eq(j).text()
            var ts =  $('.total-seats-count').eq(j).text()
            var ws =  $('.waitlist-count').eq(j).text()
         //   console.log("value in of i ="+i)
            parsedData[i].sections[j].open_seats = os 
            parsedData[i].sections[j].seats = ts
            parsedData[i].sections[j].waitlist = ws
                j++
            
        })

        
        }
        
    })

//==================

       // console.log("value in ===== i======  ="+i)
        if(i<(subjectArr.length)-1){
        myloop()
        }
        else{
            console.log("pulling data done")
            console.log("opening browser")
            exec('open http://localhost:3004', (err, stdout, stderr) => {
                if (err) {
                  // node couldn't execute the command
                  return;
                }
              });

        }
      },1000)

  }
 
  myloop();
        
})

app.get("/", (req,res) => {
     
    res.render("root",{data:parsedData})

})
console.log("server is running bitch")