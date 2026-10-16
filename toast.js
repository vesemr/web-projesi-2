// Sayfaya bildirimleri tutacak bir ana kapsayıcı (container) ekliyoruz
const toastContainer = document.createElement('div');
toastContainer.id = 'toast-container';
document.body.appendChild(toastContainer);

// Bildirim gösterme fonksiyonumuz
function showToast(message, type = 'success') {
    // Yeni bir div oluştur
    const toast = document.createElement('div');
    toast.classList.add('toast', type); // .toast ve duruma göre .error veya .success sınıfı ekler
    
    // Türüne göre emoji seç
    let icon = type === 'success' ? '✅' : '⚠️';
    toast.textContent = `${icon} ${message}`;

    // Kapsayıcıya ekle (Ekranda görünür)
    toastContainer.appendChild(toast);

    // 3 Saniye (3000 ms) sonra kaybolma animasyonunu başlat
    setTimeout(function() {
        toast.classList.add('fade-out');
        
        // Animasyon bitince (0.3sn) elementi HTML'den tamamen sil
        setTimeout(function() {
            toast.remove();
        }, 300);
        
    }, 3000);
}