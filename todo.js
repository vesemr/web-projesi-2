// ==========================================
// 1. DOM ELEMANLARI
// ==========================================
const todoInput = document.getElementById('todo-input');
const addTodoBtn = document.getElementById('add-todo-btn');
const todoList = document.getElementById('todo-list');
const filterBtns = document.querySelectorAll('.filter-btn');
const todoPriorityInput = document.getElementById('todo-priority');
const progressFill = document.getElementById('progress-fill');
const progressText = document.getElementById('progress-text');

// YENİ: Modal Elemanları
const deleteModal = document.getElementById('delete-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

// ==========================================
// 2. STATE (DURUM) DEĞİŞKENLERİ
// ==========================================
let todosArray = JSON.parse(localStorage.getItem('myTodos')) || [];
let editIndex = -1; 
let currentFilter = 'all'; 

// YENİ: Silinecek elemanı aklımızda tutacak değişkenler
let itemToDeleteIndex = -1; 
let itemToDeleteElement = null; // Animasyonu uygulamak için HTML elemanını da tutuyoruz

// ==========================================
// 3. FONKSİYONLAR
// ==========================================

function saveTodosToStorage() { 
    localStorage.setItem('myTodos', JSON.stringify(todosArray)); 
}

function updateProgressBar() {
    if (todosArray.length === 0) {
        progressFill.style.width = '0%';
        progressText.textContent = '%0';
        progressFill.style.backgroundColor = '#2ecc71';
        return;
    }
    const completedTasks = todosArray.filter(item => item.isCompleted === true).length;
    const totalTasks = todosArray.length;
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);

    progressFill.style.width = `${progressPercentage}%`;
    progressText.textContent = `%${progressPercentage}`;

    if (progressPercentage === 100) progressFill.style.backgroundColor = '#f1c40f';
    else progressFill.style.backgroundColor = '#2ecc71';
}

function renderTodos() {
    todoList.innerHTML = "";
    
    let filteredArray = todosArray;
    if (currentFilter === 'completed') filteredArray = todosArray.filter(item => item.isCompleted === true);
    else if (currentFilter === 'ongoing') filteredArray = todosArray.filter(item => item.isCompleted === false);

    const priorityColors = { low: '#2ecc71', medium: '#f1c40f', high: '#e74c3c' };
    const priorityLabels = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };

    filteredArray.forEach(function(todoItem) {
        const originalIndex = todosArray.indexOf(todoItem); 
        
        const li = document.createElement('li');
        li.classList.add('list-item');
        
        const itemPriority = todoItem.priority || 'medium'; 
        li.style.borderLeftColor = priorityColors[itemPriority]; 

        const textContainer = document.createElement('div');
        textContainer.style.display = "flex";
        textContainer.style.flexDirection = "column";

        const span = document.createElement('span');
        span.textContent = todoItem.text;
        span.style.cursor = "pointer";
        
        const dateSpan = document.createElement('small');
        dateSpan.textContent = (todoItem.createdAt || "Tarih Yok") + " • " + priorityLabels[itemPriority] + " Öncelik";
        dateSpan.style.color = "#95a5a6";
        dateSpan.style.fontSize = "11px";
        dateSpan.style.marginTop = "4px";

        textContainer.appendChild(span);
        textContainer.appendChild(dateSpan);
        
        if (todoItem.isCompleted) li.classList.add('completed');

        span.addEventListener('click', function() {
            todosArray[originalIndex].isCompleted = !todosArray[originalIndex].isCompleted;
            saveTodosToStorage();
            renderTodos();
        });

        const btnGroup = document.createElement('div');
        
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Düzenle';
        editBtn.classList.add('edit-btn');
        editBtn.addEventListener('click', function() {
            todoInput.value = todoItem.text; 
            todoPriorityInput.value = todoItem.priority || 'medium';
            editIndex = originalIndex; 
            addTodoBtn.textContent = "Güncelle"; 
            todoInput.focus(); 
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Sil';
        deleteBtn.classList.add('delete-btn');
        
        // YENİ: "SİL" BUTONUNA BASINCA MODALI AÇ
        deleteBtn.addEventListener('click', function() {
            // Hangi elemanı sileceğimizi değişkenlere kaydediyoruz
            itemToDeleteIndex = originalIndex;
            itemToDeleteElement = li;
            
            // Modalı ekranda göster (show sınıfını ekleyerek)
            deleteModal.classList.add('show');
        });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);
        
        li.appendChild(textContainer);
        li.appendChild(btnGroup); 
        todoList.appendChild(li);
    });

    updateProgressBar();
}

// ==========================================
// 4. MODAL OLAYLARI (EVET / VAZGEÇ)
// ==========================================

// "Vazgeç" Butonuna Tıklanınca
modalCancelBtn.addEventListener('click', function() {
    deleteModal.classList.remove('show'); // Modalı gizle
    itemToDeleteIndex = -1; // Hafızayı sıfırla
    itemToDeleteElement = null;
});

// "Evet, Sil" Butonuna Tıklanınca (Asıl silme işlemi burada gerçekleşiyor)
modalConfirmBtn.addEventListener('click', function() {
    if (itemToDeleteIndex > -1 && itemToDeleteElement) {
        
        deleteModal.classList.remove('show'); // Önce modalı kapat
        
        // Elemana kaybolma animasyonunu ekle
        itemToDeleteElement.classList.add('fade-out-item');
        
        // Animasyon bitince (300ms) diziden sil
        setTimeout(function() {
            todosArray.splice(itemToDeleteIndex, 1);
            
            if(editIndex === itemToDeleteIndex) {
                editIndex = -1;
                addTodoBtn.textContent = "Listeye Ekle";
                todoInput.value = "";
                todoPriorityInput.value = "medium";
            }
            
            saveTodosToStorage();
            renderTodos();
            showToast("Görev kalıcı olarak silindi.", "success");
            
            // İşlem bitince hafızayı sıfırla
            itemToDeleteIndex = -1;
            itemToDeleteElement = null;
        }, 300);
    }
});


// ==========================================
// 5. DİĞER OLAY DİNLEYİCİLERİ
// ==========================================

addTodoBtn.addEventListener('click', function() {
    const taskText = todoInput.value.trim();
    if (taskText === "") {
        showToast("Lütfen boş bir görev girmeyin!", "error");
        return;
    }

    const selectedPriority = todoPriorityInput.value;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('tr-TR') + " " + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (editIndex > -1) {
        todosArray[editIndex].text = taskText; 
        todosArray[editIndex].priority = selectedPriority;
        editIndex = -1; 
        addTodoBtn.textContent = "Listeye Ekle"; 
        showToast("Görev güncellendi!", "success");
    } else {
        todosArray.push({ text: taskText, isCompleted: false, createdAt: formattedDate, priority: selectedPriority });
        showToast("Görev başarıyla eklendi!", "success");
    }

    saveTodosToStorage();
    
    currentFilter = 'all';
    const activeBtn = document.querySelector('.filter-btn.active');
    if (activeBtn) activeBtn.classList.remove('active');
    const allFilterBtn = document.querySelector('[data-filter="all"]');
    if (allFilterBtn) allFilterBtn.classList.add('active');

    renderTodos();
    todoInput.value = ""; 
    todoPriorityInput.value = "medium"; 
});

todoInput.addEventListener('keypress', function(event) { 
    if (event.key === "Enter") addTodoBtn.click(); 
});

filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
        const activeBtn = document.querySelector('.filter-btn.active');
        if (activeBtn) activeBtn.classList.remove('active');
        
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter');
        renderTodos(); 
    });
});

renderTodos();
// ==========================================
// 6. VERİLERİ DIŞA VE İÇE AKTARMA (EXPORT / IMPORT)
// ==========================================
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file');

// 1. Dışa Aktarma (JSON Olarak Bilgisayara İndir)
exportBtn.addEventListener('click', function() {
    if (todosArray.length === 0) {
        showToast("İndirilecek kayıt bulunmuyor!", "error");
        return;
    }

    // Diziyi JSON metnine çevir
    const dataStr = JSON.stringify(todosArray, null, 2);
    // Blob oluştur (Dosya nesnesi)
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    // Sanal bir <a> etiketi yaratıp tıklatarak indirmeyi tetikle
    const a = document.createElement('a');
    a.href = url;
    a.download = 'yapilacaklar-yedek.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Yedek başarıyla indirildi!", "success");
});

// 2. İçe Aktarma Butonu Tıklanınca Gizli Dosya Seçiciyi Aç
importBtn.addEventListener('click', function() {
    importFileInput.click();
});

// 3. Dosya Seçildiğinde (Yüklendiğinde) Çalışacak Kod
importFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            // Dosya içeriğini JSON olarak oku
            const importedData = JSON.parse(e.target.result);
            
            if (Array.isArray(importedData)) {
                todosArray = importedData;
                saveTodosToStorage();
                renderTodos();
                showToast("Yedek başarıyla yüklendi!", "success");
            } else {
                showToast("Geçersiz yedek dosyası formatı!", "error");
            }
        } catch (error) {
            showToast("Dosya okunurken bir hata oluştu!", "error");
        }
        
        // Aynı dosyayı tekrar seçebilmek için input değerini sıfırla
        importFileInput.value = "";
    };
    
    reader.readAsText(file);
});