import { transporter} from "../config/nodemailer.config.js"

export const sendTicketConfirmationEmail = async (to, userName, eventTitle, ticketCode) => {
	try {
		await transporter.sendMail({
				from: process.env.MAIL_FROM,
				to,
				subject: "Confirmación de reserva de ticket",
				html: `
					<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
						<div style="background-color: #4a90e2; padding: 20px; text-align: center; border-radius: 5px 5px 0 0;">
							<h1 style="color: white; margin: 0;">Confirmación de Reserva</h1>
						</div>
						<div style="background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; border-top: none; border-radius: 0 0 5px 5px;">
							<p style="font-size: 16px; color: #333;">Hola <strong>${userName}</strong>,</p>
							<p style="font-size: 16px; color: #333;">¡Gracias por tu reserva! Te confirmamos que has adquirido un ticket para el siguiente evento:</p>
							
							<div style="background-color: white; padding: 20px; border-left: 4px solid #4a90e2; margin: 20px 0;">
								<h2 style="color: #4a90e2; margin-top: 0;">${eventTitle}</h2>
								<p style="font-size: 14px; color: #666; margin: 5px 0;"><strong>Código del ticket:</strong> <span style="font-family: monospace; font-size: 16px; background-color: #e8f4ff; padding: 5px 10px; border-radius: 3px;">${ticketCode}</span></p>
							</div>

							<p style="font-size: 14px; color: #666;">Por favor, guarda este código. Lo necesitarás para acceder al evento.</p>
							
							<div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; text-align: center;">
								<p style="font-size: 12px; color: #999;">Este es un mensaje automático, por favor no respondas.</p>
							</div>
						</div>
					</div>
				`
		})


	} catch (error) {
		console.error("Error al enviar email:", error)
	}

}