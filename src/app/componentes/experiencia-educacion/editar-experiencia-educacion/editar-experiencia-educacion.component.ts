import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ExperienciaEducacion } from 'src/app/modelos/experiencia-educacion';
import { ConsultaDBService } from 'src/app/servicios/consulta-db.service';


import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { SubirArchivoService } from 'src/app/servicios/subir-archivo.service';

@Component({
  selector: 'app-editar-experiencia-educacion',
  templateUrl: './editar-experiencia-educacion.component.html',
  styleUrls: ['./editar-experiencia-educacion.component.css']
})
export class EditarExperienciaEducacionComponent implements OnInit {

  //parametros
  //accion: Agregar || Editar && Experiencia || Educacion
  accion: string;
  id: number

  //propiedades
  titulo: string = "";
  lugar: string = "";
  periodo: string = "";
  texto: string = "";
  url: string;

  //File Input
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  fileInfos: Observable<any>;

  constructor(
    private activatedRoute: ActivatedRoute,
    private servicioDBConsulta: ConsultaDBService,
    private toastr: ToastrService,
    private router: Router,
    private subirArchivoService: SubirArchivoService
  ) { }

  ngOnInit(): void {
    this.accion = this.activatedRoute.snapshot.params.accion;
    this.id = this.activatedRoute.snapshot.params.id;
    if (this.accion.split(' ')[0] === 'Editar')
      this.cargarDatos();
  }

  onSubmit(urlArchivo: string) {
    let nombreArchivo: string = urlArchivo.split("\\")[2];

    console.log("nombreArchivo: " + nombreArchivo);
    if (nombreArchivo !== undefined) {
      this.url = "http://127.0.0.1:8080/imagen/ver?nombre=" + nombreArchivo;
    }


    const agregarEditar = this.accion.split(' ')[1].toLowerCase();
    const experienciaEducacion = new ExperienciaEducacion(this.titulo, this.lugar,
      this.periodo, this.texto, this.url);
    if (this.accion.split(' ')[0] === 'Agregar') {
      this.nuevo(agregarEditar, experienciaEducacion);
    } else if (this.accion.split(' ')[0] === 'Editar') {
      //console.log(this.activatedRoute.snapshot.params.id)
      this.editar(agregarEditar, experienciaEducacion, this.id);
    }

  }

  nuevo(item, experienciaEducacion: ExperienciaEducacion) {
    this.servicioDBConsulta.nuevo(item, experienciaEducacion).subscribe(
      data => {
        this.toastr.success(`${item} creada`, 'OK', {
          timeOut: 3000, positionClass: 'toast-top-center'
        });
        this.router.navigate(['/']);
      },
      err => {
        this.toastr.error(err.error.mensaje, 'Fail', {
          timeOut: 3000, positionClass: 'toast-top-center',
        });
        // this.router.navigate(['/']);
      }
    );
  }

  editar(item, experienciaEducacion: ExperienciaEducacion, id: number) {
    // console.log(item);
    // console.log(experienciaEducacion);
    this.servicioDBConsulta.editar(item, experienciaEducacion, id).subscribe(
      data => {
        this.toastr.success(`${item} actualizado`, 'OK', {
          timeOut: 3000, positionClass: 'toast-top-center'
        });
        this.router.navigate(['/']);
      },
      err => {
        this.toastr.error(err.error.mensaje, 'Fail', {
          timeOut: 3000, positionClass: 'toast-top-center',
        });
      }
    );

  }

  cargarDatos() {
    this.servicioDBConsulta.buscarPorId(this.accion.split(' ')[1].toLowerCase(), this.id).subscribe(
      datos => {
        this.titulo = datos.titulo;
        this.lugar = datos.lugar;
        this.periodo = datos.periodo;
        this.texto = datos.texto;
        this.url = datos.url;
      },
      err => {
        this.toastr.error(err.error.mensaje, 'Fail', {
          timeOut: 3000, positionClass: 'toast-top-center',
        });
      }
    );
  }


  selectFile(event: any) {
    this.selectedFiles = event.target.files;
  }

  upload(urlArchivo: string) {

    // let nombreArchivo: string = urlArchivo.split("\\")[2];
    // this.url = "http://127.0.0.1:8080/imagen/ver?nombre=" + nombreArchivo;
    // console.log(this.url);

    this.progress = 0;
    this.currentFile = this.selectedFiles.item(0) as File;
    this.subirArchivoService.upload(this.currentFile).subscribe(
      event => {
        if (event.type === HttpEventType.UploadProgress) {
          this.progress = Math.round(100 * event.loaded / event.total!);

        } else if (event instanceof HttpResponse) {
          this.message = event.body.message;
          //this.fileInfos = this.subirArchivoService.getFiles();
        }
      },
      err => {
        this.progress = 0;
        this.message = 'Could not upload the file!';
        this.currentFile = undefined!;
      });
    this.selectedFiles = undefined!;
  }


}
