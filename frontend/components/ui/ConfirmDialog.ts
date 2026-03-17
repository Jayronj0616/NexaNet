import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

interface ConfirmOptions {
    title?: string;
    text?: string;
    icon?: SweetAlertIcon;
    confirmButtonText?: string;
    cancelButtonText?: string;
}

export const confirmDialog = async (options: ConfirmOptions = {}): Promise<boolean> => {
    const defaultOptions = {
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning' as SweetAlertIcon,
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, proceed',
        cancelButtonText: 'Cancel'
    };

    const finalOptions = { ...defaultOptions, ...options };

    const result: SweetAlertResult = await Swal.fire(finalOptions);

    return result.isConfirmed;
};

export const toast = (title: string, icon: SweetAlertIcon = 'success') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    });

    Toast.fire({
        icon,
        title
    });
};
