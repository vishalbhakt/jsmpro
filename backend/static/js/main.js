window.addEventListener('load', function() {
    setTimeout(function() {
        let loader = document.getElementById('loading-screen');
        if (loader) {
            loader.style.opacity = 0;
            setTimeout(function() {
                loader.style.display = 'none';
            }, 500);
        }
    }, 300);
});

// Close toast helper function
function closeToast(toastElement) {
    if (!toastElement) return;
    toastElement.style.opacity = '0';
    toastElement.style.transform = 'scale(0.9) translateX(50px)';
    setTimeout(() => {
        toastElement.remove();
    }, 400);
}

// Initialize auto-dismiss for toasts
document.addEventListener("DOMContentLoaded", function() {
    const toasts = document.querySelectorAll('.toast-card');
    toasts.forEach(toast => {
        setTimeout(() => {
            closeToast(toast);
        }, 4000);
    });
});
