import fs from "fs";
import axios from "axios";


export class Busquedas {

  historial = [];
  dbPath = './db/database.json';

  constructor() {
    //TODO: LEER LA BASE DE DATOS SI EXISTE
    this.leerDB();
  }

  get paramsMapbox() {
    return {
      'limit': 5,
      'language': 'es',
      'access_token': process.env.MAPBOX_KEY
    }
  }

  get paramsWeather() {
    return {
      'appid': process.env.OPENWEATHER_KEY,
      'units':'metric',
      'lang': 'es'
    }
  }

  get historialCapitalizado() {
    // capitalizar cada palabra
    return this.historial.map( lugar => {

      let palabras = lugar.split(' ');
      palabras = palabras.map( p => p[0].toUpperCase() + p.substring(1) );

      return  palabras.join(' ');
    });
  }

  async ciudad( lugar = '' ) {
    
    try {
      //peticion http
      const instance = axios.create({
        baseURL: `https://api.mapbox.com/search/geocode/v6/forward?q=${ lugar }`,
        //otros parametros de la url ya que el lugar va directo en el baseurl a consultar
        params: this.paramsMapbox
      })

      const resp = await instance.get();
      return resp.data.features.map( lugar => ({
        id: lugar.id,
        nombre: lugar.properties.full_address,
        lng: lugar.geometry.coordinates[0],
        lat: lugar.geometry.coordinates[1]
      }))

    } catch (error) {
      return []; 
    }

  }

  async tiempoLugar( lat, lon ) {

    try {
      //instancia axios para petición http
      const intance = axios.create({
        baseURL: `https://api.openweathermap.org/data/2.5/weather?lat=${ lat }&lon=${ lon }`,
        params: this.paramsWeather
      })
      //obtener respuesta desde el get de la intancia
      const resp = await intance.get();

      //formetear la respuesta que necesitaré
      return {
        'actual': resp.data.main.temp,
        'minima': resp.data.main.temp_min,
        'maxima': resp.data.main.temp_max,
        'descripcion': resp.data.weather[0].description
      };

    } catch (error) {
      throw new Error(error);
    }

  }

  agregarHistorial( lugar = '' ) {
    
    if( this.historial.includes( lugar.toLowerCase() ) ) {
      return;
    }

    //Mantengo 6 en el historial
    this.historial = this.historial.splice(0, 5);

    this.historial.unshift( lugar.toLowerCase() );
    //Grabar en DB
    this.guardarDB();

  }

  guardarDB() {
    const payload = {
      historial: this.historial
    }

    fs.writeFileSync( this.dbPath, JSON.stringify( payload ) );
  }

  leerDB() {

    // Verificar existencia del archivo
    if( !fs.existsSync( this.dbPath )) {
      return;
    }
    // Traer el archivo con encoding utf-8
    let historialDB = fs.readFileSync( this.dbPath, { encoding: 'utf-8'} );
    historialDB = JSON.parse( historialDB );
    
    // Cargar el historial de la data
    this.historial = [...historialDB.historial]

  }


}
