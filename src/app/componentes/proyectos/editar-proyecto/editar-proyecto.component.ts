import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { Proyecto } from 'src/app/modelos/proyecto';
import { ConsultaDBService } from 'src/app/servicios/consulta-db.service';
import { SubirImagenService } from 'src/app/servicios/consulta-db-imagen.service';

@Component({
  selector: 'app-editar-proyecto',
  templateUrl: './editar-proyecto.component.html',
  styleUrls: ['./editar-proyecto.component.css']
})
export class EditarProyectoComponent implements OnInit {
  @ViewChild("inputUrl") inputUrl: ElementRef | undefined;

  //parametros
  //accion: Agregar || Editar && proyecto
  accion: string;
  id: number

  //propiedades
  nombreProyecto: string = "";
  programa: string = "";
  repositorioGit: string = "";
  anio: string = "";
  texto: string = "";
  imagen: any = {
    imagenUrl: "",
    imagenId: ""
  }

  //File Input
  selectedFiles: FileList;
  currentFile: File;
  progress = 0;
  message = '';
  fileInfos: Observable<any>;

  imagenFile: File;
  imgMiniatura: File;

  //edicion
  modoEdicion: boolean = false;

  //objeto
  proyecto: Proyecto;

  constructor(
    private activatedRoute: ActivatedRoute,
    private servicioDBConsulta: ConsultaDBService,
    private toastr: ToastrService,
    private router: Router,
    private subirImagenService: SubirImagenService
  ) { }

  ngOnInit(): void {
    this.accion = this.activatedRoute.snapshot.params.accion;
    this.id = this.activatedRoute.snapshot.params.id;
    if (this.accion.split(' ')[0] === 'Editar') {
      this.modoEdicion = true;
      this.cargarDatos();
    }
  }

  cargarDatos() {
    this.servicioDBConsulta.buscarPorId(this.accion.split(' ')[1].toLowerCase(), this.id).subscribe(
      datos => {
        this.nombreProyecto = datos.nombreProyecto;
        this.programa = datos.programa;
        this.repositorioGit = datos.repositorioGit;
        this.anio = datos.anio;
        this.texto = datos.texto;

        if (datos.imagen.imagenId != null) {
          this.imagen.imagenUrl = datos.imagen.imagenUrl;
          this.imagen.imagenId = datos.imagen.imagenId;
        }
      },
      err => {
        this.toastr.error(err.error.mensaje, 'Fail', {
          timeOut: 3000, positionClass: 'toast-top-center',
        });
      }
    );
  }

  onSubmit() {
    if (this.accion.split(' ')[0] === 'Agregar') {
      this.nuevo();
    } else if (this.accion.split(' ')[0] === 'Editar') {
    }
  }

  nuevo() {
    this.proyecto = new Proyecto(this.nombreProyecto,this.programa,this.repositorioGit,this.anio,this.texto);
    this.subirImagenService.subir('proyecto', this.proyecto, this.imagenFile)
      .subscribe(
        data => {
          this.toastr.success(`Proyecto creado`, 'OK', {
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

  onFileChange(event: any, inputUrl: string) {
    this.selectedFiles = event.target.files;
    //this.subirImagen();
    //-------setear imagen portada
    this.imagenFile = event.target.files[0];
    const fr = new FileReader();
    fr.onload = (evento: any) => {
      this.imgMiniatura = evento.target.result;
    };
    fr.readAsDataURL(this.imagenFile);
  }

  quitarImagen() {
    this.inputUrl.nativeElement.value = "";
    this.imagenFile = undefined;

    this.imagen.imagenUrl = "";
    this.imagen.imagenId = "";

  }

}
