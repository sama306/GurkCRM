import { useId } from "react"
import { motion } from "framer-motion"
import {
  Users,
  Kanban,
  CheckSquare,
  BarChart3,
  Shield,
  Search,
  type LucideIcon,
} from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from "@/components/ui/card"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Users,
    title: "Gestión de Clientes",
    description:
      "Administra contactos, empresas y clientes con campos personalizados, historial y segmentación avanzada.",
  },
  {
    icon: Kanban,
    title: "Pipeline de Oportunidades",
    description:
      "Visualiza tu proceso comercial con un Kanban drag & drop. Mueve deals entre etapas y nunca pierdas una venta.",
  },
  {
    icon: CheckSquare,
    title: "Tareas y Calendario",
    description:
      "Organiza tareas, asigna responsables y gestiona deadlines. Todo sincronizado con tu equipo.",
  },
  {
    icon: BarChart3,
    title: "Dashboard con Analytics",
    description:
      "Métricas clave en tiempo real: clientes activos, oportunidades abiertas, ventas del mes y más.",
  },
  {
    icon: Shield,
    title: "Roles y Permisos",
    description:
      "Define quién ve y hace qué. Roles Owner, Admin, Sales y Viewer para mantener el control.",
  },
  {
    icon: Search,
    title: "Búsqueda Global",
    description:
      "Encuentra cualquier cliente, empresa, deal o tarea al instante desde un solo buscador.",
  },
]

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

export default function Features() {
  const id = useId()

  return (
    <section id="features" className="px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Todo lo que necesitas para vender más
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un CRM completo, sin la complejidad de los sistemas enterprise.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <motion.div key={`${id}-${feature.title}`} variants={itemVariants}>
                <Card className="h-full">
                  <CardContent className="flex flex-col gap-4 pt-6">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                      <Icon className="size-5 text-primary" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}
