const sengMail = require('@sendgrid/mail')

//set spi
sengMail.setApiKey(process.env.SEND_GRID_API);

//send mail
// sengMail.send({
//     to:'surajpanker82@gmail.com',
//     from:'be25103.16@bitmesra.ac.in',
//     subject:"Testing Email service",
//     text:"This is my firdt email"
// })
const sendWelcomeEmail = (email,name)=>{

    sengMail.send({
            to:email,
            from:'be25103.16@bitmesra.ac.in',
            subject:"Welcome in My App",
            text:`Greetings ${name} , I hope you are safe so lets start new journey`
    
    })

}

const sendcancealEmail = (email,name)=>{

  sengMail.send({
    to:email,
    from:'be25103.16@bitmesra.ac.in',
    subject:"Canceal Email",
    text:`Goodbye ${name} ,Thank you for joining us ,see you next time`
  })

}
module.exports={
    sendWelcomeEmail,
    sendcancealEmail
}