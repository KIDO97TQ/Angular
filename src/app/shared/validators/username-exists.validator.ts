import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap, catchError, first } from 'rxjs/operators';
import { UserService } from '../../Core/services/user';

export function usernameExistsValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        if (!control.value || control.value.length < 3) {
            return of(null);
        }

        return userService.checkUsername(control.value).pipe(
            map((response: any) => {
                return response.exists ? { usernameTaken: true } : null;
            }),
            catchError(() => of(null)),
            first()
        );
    };
}