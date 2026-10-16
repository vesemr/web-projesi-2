const themeToggleBtn = document.getElementById('theme-toggle');
const body = document.body;

// 1. Sayfa yüklendiğinde LocalStorage'dan temanın ne olduğuna bak
const currentTheme = localStorage.getItem('myTheme');

// 2. Eğer kayıtlı tema 'dark' ise, sayfayı karanlık yap ve ikonu Güneş'e çevir
if (currentTheme === 'dark') {
    body.classList.add('dark-mode');
    themeToggleBtn.textContent = '☀️'; 
} else {
    // Aksi halde Ay ikonu kalsın (Varsayılan açık tema)
    themeToggleBtn.textContent = '🌙'; 
}

// 3. Butona tıklandığında çalışacak olay
themeToggleBtn.addEventListener('click', function() {
    // body etiketine 'dark-mode' sınıfını ekle veya varsa çıkar (toggle)
    body.classList.toggle('dark-mode');
    
    // Geçiş yaptıktan sonra şu anki durumu kontrol et
    if (body.classList.contains('dark-mode')) {
        // Karanlık temaya geçildiyse LocalStorage'a kaydet ve ikonu değiştir
        localStorage.setItem('myTheme', 'dark');
        themeToggleBtn.textContent = '☀️';
    } else {
        // Açık temaya dönüldüyse LocalStorage'ı güncelle ve ikonu değiştir
        localStorage.setItem('myTheme', 'light');
        themeToggleBtn.textContent = '🌙';
    }
});