import 'dotenv/config'
import { leerInput, inquirerMenu, pausa, listarLugares } from "./helpers/inquirer.js"
import { Busquedas } from "./models/busquedas.js";
import axios from "axios";

const main = async() => {

  const busquedas = new Busquedas();
  let opt;
  
  
  do {

    opt = await inquirerMenu();

    switch ( opt ) {
      case 1:
        //  Mostrar mensaje
        const termino = await leerInput("Ingrese una Ciudad: ");

        //  Buscar los lugares
        const lugares = await busquedas.ciudad( termino );

        //  Seleccionar el lugar
        const id = await listarLugares(lugares);

        if( id === '0') continue;
        const lugarSeleccionado = lugares.find( lugar => lugar.id == id );

        //  Guardar en DB
        busquedas.agregarHistorial( lugarSeleccionado.nombre );

        //  Datos del clima relacionados al lugar
        const tiempoLugar = await busquedas.tiempoLugar( lugarSeleccionado.lat, lugarSeleccionado.lng );

        //  Mostrar resultados
        console.log('\nInformación de la Ciudad:\n'.green);
        console.log('Nombre: ', lugarSeleccionado.nombre);
        console.log('Descripción del día: ', tiempoLugar.descripcion);
        console.log('Lat: ', lugarSeleccionado.lat);
        console.log('Lng: ', lugarSeleccionado.lng);
        console.log('Temperatura: ', tiempoLugar.actual,'°C');
        console.log('Mínima: ', tiempoLugar.minima,'°C');
        console.log('Máxima: ', tiempoLugar.maxima,'°C');

      break;
    
      case 2:

        busquedas.historialCapitalizado.forEach( (lugar, i) => {
          const idx = `${ i + 1 }`.green;
          console.log( `${ idx } ${ lugar }`);
        })

      break;

      case 0:
      break;
    }

    if( opt !== 0) await pausa();
    
  } while ( opt !== 0);

}

main();