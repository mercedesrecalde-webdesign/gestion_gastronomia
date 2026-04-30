const CAMPUS_DATA = {
  modules: [
    {
      id: "mod1",
      title: "I. Clasificación de Costos",
      icon: "📊",
      theory: {
        intro: "Entender la diferencia entre costos y gastos es el primer paso para una gestión gastronómica exitosa.",
        sections: [
          {
            title: "Costo Fijo vs. Costo Variable",
            content: `
              <ul>
                <li><strong>Costo Fijo:</strong> Es aquel que permanece constante independientemente de si vendes 1 o 1000 platos. Ejemplo: Alquiler, Internet, Seguros.</li>
                <li><strong>Costo Variable:</strong> Fluctúa en proporción directa a la producción. Si no cocinas, no gastas. Ejemplo: Materia Prima (harina, carne), Descartables.</li>
              </ul>
            `,
            proTip: "El alquiler es el ejemplo más clásico de Costo Fijo. La empresa debe pagarlo atienda 10 o 200 cubiertos."
          }
        ]
      },
      practice: {
        title: "Identificador de Costos",
        description: "Clasifica los elementos según su naturaleza.",
        type: "info"
      },
      exercises: "BLOQUE I"
    },
    {
      id: "mod2",
      title: "II. Comportamiento de Costos",
      icon: "📈",
      theory: {
        intro: "A medida que la producción cambia, los costos se comportan de formas distintas.",
        sections: [
          {
            title: "Costo Fijo Unitario (CFU)",
            content: "El Costo Fijo Unitario disminuye a medida que produces más unidades, ya que el mismo costo fijo se reparte entre más platos.",
            proTip: "¡A mayor volumen, menor es el impacto de tu alquiler en cada plato!"
          }
        ]
      },
      practice: {
        title: "Análisis de Escala",
        type: "scale_analysis"
      },
      exercises: "BLOQUE II"
    },
    {
      id: "mod3",
      title: "III. Punto de Equilibrio",
      icon: "⚖️",
      theory: {
        intro: "El Punto de Equilibrio (PE) es tu umbral de supervivencia.",
        sections: [
          {
            title: "La Contribución Marginal",
            content: "CMu = Precio de Venta - Costo Variable Unitario. Es lo que 'sobra' para pagar los fijos.",
            proTip: "Si tu CMu es negativa, estás perdiendo dinero con cada plato que vendes."
          }
        ]
      },
      practice: {
        title: "Simulador de PE",
        type: "calculator",
        defaultValues: { cf: 1000000, pv: 8000, cvu: 3000 }
      },
      exercises: "BLOQUE III"
    },
    {
      id: "mod4",
      title: "IV. Rentabilidad & Food Cost",
      icon: "💎",
      theory: {
        intro: "Optimiza tus precios para maximizar la ganancia.",
        sections: [
          {
            title: "Food Cost objetivo",
            content: "El Food Cost % mide la relación entre el costo de insumos y el precio de venta.",
            proTip: "Un Food Cost del 30% significa que por cada $100 que cobras, $30 se fueron en mercadería."
          }
        ]
      },
      practice: {
        title: "Calculadora de Food Cost",
        type: "calculator",
        defaultValues: { cf: 500000, pv: 5000, cvu: 1500 }
      },
      exercises: "BLOQUE IV"
    }
  ]
};
