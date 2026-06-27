Feature: Flujo crítico de gestión de gastos
  As a user of appGastos
  I want to register, view, delete expenses and verify totals
  So that I can effectively manage my finances

  Scenario: Registrar un nuevo gasto
    Given que estoy en el dashboard de appGastos
    When registro un gasto de "1500" en categoría "Alimentación" con descripción "Almuerzo"
    Then el gasto aparece en la tabla con monto "1,500.00"

  Scenario: Ver el gasto registrado en la tabla
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When observo la tabla de gastos
    Then la tabla muestra al menos un gasto con categoría "Alimentación"

  Scenario: Eliminar un gasto existente
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When elimino el gasto de la tabla
    Then la tabla no muestra el gasto eliminado

  Scenario: Verificar totales en el dashboard
    Given que existe un gasto de "1500" en categoría "Alimentación"
    When observo el panel de totales
    Then el total del período refleja el monto "1500"
