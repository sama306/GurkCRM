import { useId } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { cn } from "@/lib/utils"

/*
  NOTA: Los precios son ilustrativos. Este es un proyecto de portfolio
  y no hay un sistema de cobro real implementado.
*/

interface Plan {
  name: string
  price: string
  description: string
  features: string[]
  highlighted?: boolean
  cta: string
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "Gratis",
    description: "Perfecto para freelancers y negocios que empiezan.",
    features: [
      "Hasta 50 clientes",
      "Pipeline básico",
      "Tareas ilimitadas",
      "1 usuario",
    ],
    cta: "Empezar gratis",
  },
  {
    name: "Business",
    price: "$29/mes",
    description: "Para equipos que necesitan crecer sin límites.",
    features: [
      "Clientes ilimitados",
      "Kanban completo",
      "Dashboard con analytics",
      "Hasta 10 usuarios",
      "Roles y permisos",
    ],
    highlighted: true,
    cta: "Probar gratis",
  },
  {
    name: "Enterprise",
    price: "$99/mes",
    description: "Para empresas que requieren control total.",
    features: [
      "Todo lo de Business",
      "Usuarios ilimitados",
      "API y webhooks",
      "Soporte prioritario",
      "Personalización de campos",
      "Exportación avanzada",
    ],
    cta: "Contactar ventas",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
}

export default function Pricing() {
  const id = useId()

  return (
    <section id="pricing" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Planes simples, sin sorpresas
          </h2>
          <p className="mt-4 text-muted-foreground">
            Elige el plan que mejor se adapte a tu equipo. Siempre puedes cambiarlo después.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-8 lg:grid-cols-3"
        >
          {plans.map((plan) => (
            <motion.div key={`${id}-${plan.name}`} variants={itemVariants}>
              <Card
                className={cn(
                  "relative flex h-full flex-col shadow-sm",
                  plan.highlighted &&
                    "shadow-lg ring-2 ring-primary",
                )}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-0.5 text-xs font-medium text-primary-foreground">
                    Más popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <div className="mt-2">
                    <span className="text-3xl font-bold">{plan.price}</span>
                  </div>
                  <CardDescription className="mt-1">
                    {plan.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={plan.highlighted ? "default" : "outline"}
                  >
                    {plan.cta}
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
