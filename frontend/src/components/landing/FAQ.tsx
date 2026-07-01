import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "¿Necesito tarjeta de crédito para empezar?",
    answer:
      "No. El plan Starter es completamente gratuito y no requiere ningún método de pago. Puedes usarlo el tiempo que quieras y actualizar a un plan pago cuando lo necesites.",
  },
  {
    question: "¿Puedo cambiar de plan en cualquier momento?",
    answer:
      "Sí. Puedes subir o bajar de plan cuando quieras. Si actualizas, los cambios son inmediatos. Si reduces, el nuevo plan se aplica al siguiente ciclo de facturación.",
  },
  {
    question: "¿Mis datos están seguros?",
    answer:
      "Absolutamente. Usamos encriptación SSL/TLS en todas las comunicaciones y los datos se almacenan en servidores seguros. Además, implementamos autenticación JWT con refresh tokens y roles de usuario para mantener el control de acceso.",
  },
  {
    question: "¿Hay límite de usuarios?",
    answer:
      "Depende del plan. Starter incluye 1 usuario, Business hasta 10, y Enterprise no tiene límite. Todos los planes permiten asignar roles y permisos personalizados a cada usuario.",
  },
  {
    question: "¿Puedo exportar mis datos si decido irme?",
    answer:
      "Sí. Puedes exportar tus clientes, empresas, contactos y oportunidades en formato CSV en cualquier momento. No creemos en cobrar por liberar tus datos.",
  },
  {
    question: "¿Ofrecen soporte técnico?",
    answer:
      "Los planes Business y Enterprise incluyen soporte prioritario. Starter tiene acceso a nuestra documentación y comunidad. Siempre puedes contactarnos a través del formulario de la página.",
  },
]

export default function FAQ() {
  return (
    <section id="faq" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Preguntas frecuentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Todo lo que necesitas saber antes de empezar.
          </p>
        </div>

        <div className="mt-12">
          <Accordion type="single" collapsible>
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-base">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  )
}
