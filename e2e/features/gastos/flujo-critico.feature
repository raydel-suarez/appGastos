# language: es

Característica: Flujo crítico de gestión de gastos
  Como usuario de appGastos
  Quiero registrar, ver, eliminar gastos y verificar totales
  Para llevar un control efectivo de mis finanzas

  Escenario: Registrar un nuevo gasto
    Dado que estoy en el dashboard de appGastos
    Cuando registro un gasto de "1500" en categoría "Alimentación" con descripción "Almuerzo"
    Entonces el gasto aparece en la tabla con monto "1,500.00"

  Escenario: Ver el gasto registrado en la tabla
    Dado que existe un gasto de "1500" en categoría "Alimentación"
    Cuando observo la tabla de gastos
    Entonces la tabla muestra al menos un gasto con categoría "Alimentación"

  Escenario: Eliminar un gasto existente
    Dado que existe un gasto de "1500" en categoría "Alimentación"
    Cuando elimino el gasto de la tabla
    Entonces la tabla no muestra el gasto eliminado

  Escenario: Verificar totales en el dashboard
    Dado que existe un gasto de "1500" en categoría "Alimentación"
    Cuando observo el panel de totales
    Entonces el total del período refleja el monto "1500"
