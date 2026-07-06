import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Project {

  constructor(
    private readonly http: HttpClient
  ){}

  catalogo_sap(param: String){
    return this.http.get(
      'https://h6120959l8.execute-api.us-east-1.amazonaws.com/v1/catalogosap?material=' + param,
      {responseType: 'json'}
    );
  }

  catalogo_texto(param: String){
    return this.http.get(
      'https://h6120959l8.execute-api.us-east-1.amazonaws.com/v1/catalogotexto?descripcion_sap=' + param,
      {responseType: 'json'}
    );
  }

  elementos_maquina(param: String){
    return this.http.get(
      'https://h6120959l8.execute-api.us-east-1.amazonaws.com/v1/getelementos?maquina=' + param,
      {responseType: 'json'}
    );
  }
  repuestos_maquina(param1: String, param2: String){
    return this.http.get(
      'https://h6120959l8.execute-api.us-east-1.amazonaws.com/v1/getrepuestosmaq?maquina=' + param1 + '&elemento=' + param2,
      {responseType: 'json'}
    );
  }
}
