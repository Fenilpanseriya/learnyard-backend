import { createTransport } from "nodemailer"

export const sendEmail=async(to,subject,text)=>{3
    console.log(to);
    console.log(subject);
    console.log(text);
    const transporter=createTransport({
        service: "gmail",
        auth: {
          user: "fenilpanseriya2004@gmail.com",
          pass: "pxvi gtdd nmku xmnw",
        },
      });
      let mailOptions = {
        from: "fenilpanseriya2004@gmail.com",
        to: to,
        subject: subject,
        text: text,
      };

    await transporter.sendMail(mailOptions,function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log("Email sent successfully");
        }
      }
        
    )
}