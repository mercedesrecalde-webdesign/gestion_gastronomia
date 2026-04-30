const CAMPUS_DATA = {
  modules: [
    {
      id: "mod1",
      title: "I. Clasificación de Costos",
      icon: "📊",
      pdf_url: "Apunte costos y presupuestos unidad 1 eje 1.pdf",
      practice: {
        examples: [
          {
            case: "¿El sueldo del delivery propio de la hamburguesería es un costo o un gasto?",
            solution: "Es un Gasto de Comercialización.",
            reason: "Porque el delivery ayuda a vender y entregar el producto, pero no interviene en la producción (cocina) de la hamburguesa."
          },
          {
            case: "Si compro 50kg de carne para las hamburguesas, ¿es costo fijo o variable?",
            solution: "Es un Costo Variable.",
            reason: "Porque la cantidad de carne necesaria depende directamente de cuántas hamburguesas planees vender. Si vendes más, el costo total de carne aumenta."
          }
        ]
      },
      exercises: "BLOQUE I"
    },
    {
      id: "mod2",
      title: "II. Comportamiento de Costos",
      icon: "📈",
      pdf_url: "presentacion eje 1.pptx",
      exercises: "BLOQUE II"
    },
    {
      id: "mod3",
      title: "III. Punto de Equilibrio",
      icon: "⚖️",
      pdf_url: "PE.pdf",
      practice: {
        type: "calculator",
        defaultValues: { cf: 1000000, pv: 8000, cvu: 3000 }
      },
      exercises: "BLOQUE III"
    },
    {
      id: "mod4",
      title: "IV. Rentabilidad & Food Cost",
      icon: "💎",
      pdf_url: "Costos-Precios-Contribucion-y-Presupuesto.pptx",
      exercises: "BLOQUE IV"
    }
  ]
};
