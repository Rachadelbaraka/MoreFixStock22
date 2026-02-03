"use server"

import { z } from "zod"

// Email validation schema
const contactFormSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères" }),
  email: z.string().email({ message: "Adresse email invalide" }),
  phone: z.string().optional(),
  message: z.string().min(10, { message: "Le message doit contenir au moins 10 caractères" }),
  productId: z.number().optional(),
  productName: z.string().optional(),
})

type ContactFormData = z.infer<typeof contactFormSchema>

export async function sendContactEmail(formData: ContactFormData) {
  try {
    // Validate form data
    const validatedData = contactFormSchema.parse(formData)

    // In a real implementation, you would use a service like SendGrid, Mailgun, etc.
    // For demonstration purposes, we'll simulate sending an email

    console.log("Sending email with data:", validatedData)

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate success (in production, check the response from your email service)
    return { success: true, message: "Votre message a été envoyé avec succès!" }
  } catch (error) {
    console.error("Error sending email:", error)

    if (error instanceof z.ZodError) {
      // Return validation errors
      const errorMessages = error.errors.map((err) => err.message).join(", ")
      return { success: false, message: `Erreur de validation: ${errorMessages}` }
    }

    return { success: false, message: "Une erreur est survenue lors de l'envoi du message. Veuillez réessayer." }
  }
}
