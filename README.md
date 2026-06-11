# TP_PREVIO_PARCIAL

PARA QUE LO CLONE CADA UNO EN SU PC:  git clone https://github.com/Tobiasgonzalez223/TP_PREVIO_PARCIAL.git

El flujo correcto para cada uno sería este:

# Antes de ponerse a trabajar (siempre primero)
Traer los últimos cambios de tus compañeros
  git pull origin main

#Mientras trabajás#
Crear una rama para tu tarea (no trabajar directo en main)
  git checkout -b feature/nombre-de-lo-que-haces
  # Ejemplo: git checkout -b feature/login

#Cuando terminás algo
Ver qué archivos cambiaste
  git status

#Agregar los cambios
  git add .

#Guardar con un mensaje descriptivo
  git commit -m "feat: descripción de lo que hiciste"

# Subir tu rama
  git push origin feature/nombre-de-lo-que-haces

En GitHub
Después del push, GitHub te va a mostrar un botón "Compare & pull request". 
Lo abrís, escribís una descripción de lo que hiciste, y un compañero lo revisa y aprueba antes de fusionar a main.
