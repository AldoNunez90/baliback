require('dotenv').config();
const express = require('express');
const {google} = require('googleapis');

const app = express();
const oauth2Client = new google.auth.OAuth2(process.env.CLIENT_ID, process.env.SECRET_ID, process.env.REDIRECT);

app.get('/', (req, res)=>{
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', 
        scope: 'https://www.googleapis.com/auth/calendar.readonly'
    })
    res.redirect(url);
})

app.get('/redirect', (req,res)=>{
    const code = req.query.code;
    oauth2Client.getToken(code, (err,tokens)=>{
        if(err){
             console.error(err);
             res.send('Error')
             return;
        } oauth2Client.setCredentials(tokens);
        res.send('Succesfully logged in')

    })
})

app.get('/calendars',(req,res)=>{
    const calendar = google.calendar({version:'v3', auth:oauth2Client});
    calendar.calendarList.list({},(err,response)=>{
        if(err){
            console.error(err);
            res.end('Error!')
            return
    }
    const calendars = response.data.items;
    res.json(calendars);
    }) 
})

app.get('/events', (req,res)=>{
    const calendarId = req.query.calendar??'primary';
    const calendar = google.calendar({version:'v3', auth:oauth2Client});
    calendar.events.list({
        calendarId,
        timeMin: (new Date()).toISOString(),
        singleEvents: true,
        orderBy: 'startTime'
}, (err, response)=>{
    if(err){
        console.error(err);
        res.end('Error!')
        return;
    }
    const events = response.data.items;
    res.json(events);
})
})

app.listen(3000, ()=>console.log('Server running on port 3000'))