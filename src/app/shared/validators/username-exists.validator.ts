import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { map, debounceTime, switchMap, catchError, first } from 'rxjs/operators';
import { UserService } from '../../Core/services/user';

export function usernameExistsValidator(userService: UserService): AsyncValidatorFn {
    return (control: AbstractControl): Observable<ValidationErrors | null> => {
        // Nếu input rỗng hoặc quá ngắn, không check
        if (!control.value || control.value.length < 3) {
            return of(null);
        }

        return of(control.value).pipe(
            debounceTime(500), // Chờ 500ms sau khi user ngừng gõ
            switchMap(username =>
                userService.checkUsername(username).pipe(
                    map((response: any) => {
                        // Nếu username đã tồn tại, trả về error
                        return response.exists ? { usernameTaken: true } : null;
                    }),
                    catchError(() => {
                        // Nếu API lỗi, không block form
                        return of(null);
                    })
                )
            ),
            first() // Chỉ lấy giá trị đầu tiên
        );
    };
}