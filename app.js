const demoState = {
  paciente: {
    nombre: "María López",
    edad: 29,
    sexo: "F",
    sintoma: "Dificultad leve para respirar"
  },
  categoriaRapida: "respiratorio",
  horaIngreso: "10:42"
};

function guardarPantallaIngreso() {
  demoState.paciente.nombre = document.getElementById("pacienteNombre").value.trim();
  demoState.paciente.edad = document.getElementById("pacienteEdad").value.trim();
  demoState.paciente.sexo = document.getElementById("pacienteSexo").value;
  demoState.paciente.sintoma = document.getElementById("pacienteSintoma").value.trim();
  demoState.categoriaRapida = document.getElementById("categoriaRapida").value;
  demoState.horaIngreso = document.getElementById("horaIngreso").value.trim();
}

function reiniciarPantallaIngreso() {
  document.getElementById("pacienteNombre").value = "María López";
  document.getElementById("pacienteEdad").value = 29;
  document.getElementById("pacienteSexo").value = "F";
  document.getElementById("pacienteSintoma").value = "Dificultad leve para respirar";
  document.getElementById("categoriaRapida").value = "respiratorio";
  document.getElementById("horaIngreso").value = "10:42";
  guardarPantallaIngreso();
}

function inicializarPantallaIngreso() {
  const btnContinuar = document.getElementById("btnContinuarIngreso");
  const btnReiniciar = document.getElementById("btnReiniciarIngreso");

  if (btnContinuar) {
    btnContinuar.addEventListener("click", function () {
      guardarPantallaIngreso();

      console.log("Pantalla 1 guardada:", demoState);

      /*
        AQUÍ NO GENERAMOS FOLIO.
        En el siguiente paso conectaremos esta acción
        con la Pantalla 2: Filtro de seguridad.
      */

      alert("Pantalla 1 lista. El siguiente paso será el filtro de seguridad.");
    });
  }

  if (btnReiniciar) {
    btnReiniciar.addEventListener("click", function () {
      reiniciarPantallaIngreso();
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  inicializarPantallaIngreso();
});
