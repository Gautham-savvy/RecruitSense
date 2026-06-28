import { Resend } from "resend";

const FROM = "RecruitSense <onboarding@resend.dev>";
function getResend() {
  if (!process.env.RESEND_API_KEY) return null;
  return new Resend(process.env.RESEND_API_KEY);
}

export async function sendApplicationReceived(candidateName: string, candidateEmail: string, jobTitle: string) {
  const resend = getResend();
  if (!resend || !candidateEmail) return;
  await resend.emails.send({
    from: FROM,
    to: candidateEmail,
    subject: `Your application for ${jobTitle} has been received`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f7f4;border-radius:12px">
        <h2 style="color:#291C0E;margin-bottom:8px">Hi ${candidateName},</h2>
        <p style="color:#6E473B;line-height:1.6">
          Thank you for applying for the <strong>${jobTitle}</strong> position.
          We've received your resume and our AI is reviewing it now.
        </p>
        <p style="color:#6E473B;line-height:1.6">
          You'll hear from us soon regarding next steps.
        </p>
        <p style="color:#A78D78;font-size:13px;margin-top:24px">
          — The Hiring Team via RecruitSense
        </p>
      </div>`,
  });
}

export async function sendShortlisted(candidateName: string, candidateEmail: string, jobTitle: string) {
  const resend = getResend();
  if (!resend || !candidateEmail) return;
  await resend.emails.send({
    from: FROM,
    to: candidateEmail,
    subject: `Great news — you've been shortlisted for ${jobTitle}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f9f7f4;border-radius:12px">
        <h2 style="color:#291C0E;margin-bottom:8px">Congratulations, ${candidateName}!</h2>
        <p style="color:#6E473B;line-height:1.6">
          We're pleased to let you know that you've been <strong>shortlisted</strong> for
          the <strong>${jobTitle}</strong> position.
        </p>
        <p style="color:#6E473B;line-height:1.6">
          Our team will be in touch shortly to schedule an interview.
        </p>
        <p style="color:#A78D78;font-size:13px;margin-top:24px">
          — The Hiring Team via RecruitSense
        </p>
      </div>`,
  });
}
