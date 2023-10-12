import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();
interface Emailoptions {
  email: string;
  subject: string;
  template: string;
  data: { [key: string]: any };
}

const sendMail = async (options: Emailoptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const { email, subject, template, data } = options;
  //get the mail template file
  const templatePath = path.join(__dirname, "../mails", template);

  //   render the email template with ejs
  const html = await ejs.renderFile(templatePath, data);
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };
  await transporter.sendMail(mailOptions);
};
export default sendMail;
