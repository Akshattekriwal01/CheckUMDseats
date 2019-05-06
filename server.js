var express = require('express')
var app     = express()
var request = require('request')
var cheerio = require('cheerio')
var prog    = require('cli-progress')
const { exec } = require('child_process');
const bar1 = new prog.Bar({format: '{bar} {percentage}% | {duration}s | ETA: {eta}s | {value}/{total}'}, prog.Presets.shades_grey);

var parsedData

var server  = app.listen(3004);
app.set("view engine", "ejs");

var subjectArr =["CMSC320","STAT410","CMSC330","CMSC451","math410","stat401","bmgt430","math475"]
subjectArr = subjectArr.map((x)=>x.toUpperCase())
subjectArr.sort()
var subjects = ""
    subjectArr.forEach(element => {
        subjects += element+","
    })
//gives the JSON 
bar1.start(100, 0);
var a
var i 
request("https://api.umd.io/v0/courses/"+subjects+"?expand=sections",(error,response,body)=>{
    if(!error){
        parsedData= JSON.parse(body);
    }  
   i = -1
   a = function myloop () {
            setTimeout(()=>{
        //==================
            i++
            //console.log(i)
            bar1.update((i+1)*(100/subjectArr.length))
            //console.log("pulling latest data")
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
                  //console.log("value in of i ="+i)
                    parsedData[i].sections[j].open_seats = os 

                    parsedData[i].sections[j].seats = ts
                
                    parsedData[i].sections[j].waitlist = ws
                        j++ ;                      
                       })        
                }        
            })

        //==================
            // console.log("value in ===== i======  ="+i)
                if(i<(subjectArr.length)-1){
                myloop()
                }
                else{
                        bar1.stop();
                    console.log("pulling data done")
                    console.log("opening browser")
                   setTimeout(()=>{
                    exec('open -a "Google Chrome" http://localhost:3004', (err, stdout, stderr) => {
                        if (err) {
                        // node couldn't execute the command
                        return;
                        }
                    })
                   }
                     ,2000)
                }
            },2000)

  }
 a();
 // stop the progress bar
 
})

app.get("/", (req,res) => {
     
    res.render("root",{data:parsedData})

})

app.get("/refresh", (req,res) => {
    i = -1 
    a();
    //the reason I dont need this below is because a() will open the browser via "/" route
    // setTimeout(() => 
    // {res.render("root",{data:parsedData}) },
    
    // subjectArr.length*1100)

})
//console.log("Hope there are enough seats")


