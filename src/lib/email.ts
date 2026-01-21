import nodemailer from "nodemailer";

export interface EmailData {
  to: string[];
  subject: string;
  html: string;
}

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(data: EmailData) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@support.com",
    to: data.to.join(", "),
    subject: data.subject,
    html: data.html,
  });
}

export function createAssignmentEmail(
  assigneeEmails: string[],
  ticketTitle: string,
  ticketDescription: string,
  isUpdate: boolean = false,
): EmailData {
  const action = isUpdate ? "updated and assigned" : "assigned";

  return {
    to: assigneeEmails,
    subject: `Ticket ${action}: ${ticketTitle}`,
    html: `
      <h2>Support Ticket ${action.charAt(0).toUpperCase() + action.slice(1)}</h2>
      <p>You have been ${action} to the following support ticket:</p>
      
      <div style="border: 1px solid #ddd; padding: 16px; margin: 16px 0; border-radius: 4px;">
        <h3>${ticketTitle}</h3>
        <p><strong>Description:</strong></p>
        <p>${ticketDescription}</p>
      </div>
      
      <p>Please log in to the support system to view and manage this ticket.</p>
    `,
  };
}
