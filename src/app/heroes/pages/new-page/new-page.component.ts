import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Hero, Publisher } from '../../interfaces/hero.interface';
import { HeroesService } from '../../services/heroes.service';
import { ActivatedRoute, Router } from '@angular/router';
import { filter, switchMap, tap } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-new-page',
  templateUrl: './new-page.component.html',
  styles: ``
})
export class NewPageComponent implements OnInit {

  public heroForm = new FormGroup({
    id: new FormControl<string>(''),
    superhero: new FormControl<string>('', { nonNullable: true }),
    publisher: new FormControl<Publisher>( Publisher.DCComics ),
    alter_ego: new FormControl(''),
    first_appearance: new FormControl(''),
    characters: new FormControl(''),
    alt_img: new FormControl('')
  });

  public publishers = [
    { id: 'DC Comics', desc: 'DC - Comics' },
    { id: 'Marvel Comics', desc: 'Marvel - Comics'}
  ];

  constructor (
    private heroesService: HeroesService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    if( !this.router.url.includes('edit') ) return;
    this.activatedRoute.params
      .pipe(
        switchMap( ({ id }) => this.heroesService.getHeroById(id) ))
      .subscribe( hero => {
        if( !hero ) return this.router.navigateByUrl('/');
        this.heroForm.reset(hero);
        return;
      })
  }

  get currentHero(): Hero{
    const hero = this.heroForm.value as Hero;
    return hero;
  }

  onSubmit(): void {
    if( !this.heroForm.valid ) return;

    if( this.currentHero.id ) {
      this.heroesService.updateHero( this.currentHero )
        .subscribe( hero => {
          this.showSnackBar(`¡${ hero.superhero } actualizado!`);
        });
      return;
    }

    this.heroesService.addHero( this.currentHero )
      .subscribe( hero => {
        //mostrar snackbar y navegar a heroes/edit/hero_id
        this.showSnackBar(`¡${ hero.superhero } agregado!`);
        this.router.navigateByUrl(`/heroes/edit/${hero.id}`);
      })
    //this.heroesService.updateHero( this.heroForm.value );
  }

  onDeleteHero(): void {
    if( !this.currentHero.id ) throw Error('El id es requerido');

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: this.heroForm.value,
    });

    dialogRef.afterClosed()
    .pipe(
      filter( ( result: boolean ) => result ), // Filtra si el resultado es verdadero
      switchMap( () => this.heroesService.deleteHeroById(this.currentHero.id)),
      filter((wasDeleted: boolean) => wasDeleted)
    )
    .subscribe( () =>
      this.router.navigate(['/heroes'])
    );

    // dialogRef.afterClosed().subscribe(result => {
    //   if( !result ) return;
    //   this.heroesService.deleteHeroById(this.currentHero.id)
    //     .subscribe( wasDeleted =>{
    //       if( wasDeleted )
    //         this.router.navigate(['/heroes']);
    //     } );
    //   ;
    // });
    //this.heroesService.deleteHeroById(this.currentHero.id).subscribe()
  }

  showSnackBar( message: string ):void {
    this.snackBar.open( message, 'ok', {
      duration: 2500,

     })
  }
}
