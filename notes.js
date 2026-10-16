// ==========================================
// 1. DOM ELEMANLARI
// ==========================================
const noteTitleInput = document.getElementById('note-title');
const noteContentInput = document.getElementById('note-content');
const addNoteBtn = document.getElementById('add-note-btn');
const notesList = document.getElementById('notes-list');
const searchNoteInput = document.getElementById('search-note');
const notePriorityInput = document.getElementById('note-priority');

// Modal Elemanları
const deleteModal = document.getElementById('delete-modal');
const modalCancelBtn = document.getElementById('modal-cancel-btn');
const modalConfirmBtn = document.getElementById('modal-confirm-btn');

// YENİ: Yedekleme Elemanları
const exportBtn = document.getElementById('export-btn');
const importBtn = document.getElementById('import-btn');
const importFileInput = document.getElementById('import-file');

// ==========================================
// 2. STATE (DURUM) DEĞİŞKENLERİ
// ==========================================
let notesArray = JSON.parse(localStorage.getItem('myNotes')) || [];
let editIndex = -1; 
let searchTerm = ""; 

// Silinecek eleman hafızası
let itemToDeleteIndex = -1; 
let itemToDeleteElement = null;

// ==========================================
// 3. FONKSİYONLAR
// ==========================================
function saveNotesToStorage() { 
    localStorage.setItem('myNotes', JSON.stringify(notesArray)); 
}

function renderNotes() {
    notesList.innerHTML = "";
    let filteredNotes = notesArray;
    
    if (searchTerm !== "") {
        filteredNotes = notesArray.filter(function(noteItem) {
            const term = searchTerm.toLowerCase();
            const titleLower = noteItem.title.toLowerCase();
            const contentLower = noteItem.content.toLowerCase();
            return titleLower.includes(term) || contentLower.includes(term);
        });
    }

    const priorityColors = { low: '#2ecc71', medium: '#f1c40f', high: '#e74c3c' };
    const priorityLabels = { low: 'Düşük', medium: 'Orta', high: 'Yüksek' };

    filteredNotes.forEach(function(noteItem) {
        const originalIndex = notesArray.indexOf(noteItem);
        
        const noteDiv = document.createElement('div');
        noteDiv.classList.add('list-item');
        noteDiv.style.flexDirection = 'column';
        noteDiv.style.alignItems = 'flex-start';
        
        const itemPriority = noteItem.priority || 'medium';
        noteDiv.style.borderLeftColor = priorityColors[itemPriority];

        const h3 = document.createElement('h3');
        h3.textContent = noteItem.title;
        h3.style.marginBottom = '5px';

        const p = document.createElement('p');
        p.textContent = noteItem.content;
        p.style.marginBottom = '5px'; 

        const dateSpan = document.createElement('small');
        dateSpan.textContent = (noteItem.createdAt || "Tarih Yok") + " • " + priorityLabels[itemPriority] + " Öncelik";
        dateSpan.style.color = "#95a5a6";
        dateSpan.style.fontSize = "11px";
        dateSpan.style.marginBottom = "15px"; 

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '5px'; 
        btnGroup.style.alignSelf = 'flex-end'; 

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Düzenle';
        editBtn.classList.add('edit-btn'); 
        
        editBtn.addEventListener('click', function() {
            noteTitleInput.value = noteItem.title;
            noteContentInput.value = noteItem.content;
            notePriorityInput.value = noteItem.priority || 'medium';
            editIndex = originalIndex; 
            addNoteBtn.textContent = "Güncelle"; 
            noteTitleInput.focus(); 
        });

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Sil';
        deleteBtn.classList.add('delete-btn');
        
        deleteBtn.addEventListener('click', function() {
            itemToDeleteIndex = originalIndex;
            itemToDeleteElement = noteDiv;
            deleteModal.classList.add('show');
        });

        btnGroup.appendChild(editBtn);
        btnGroup.appendChild(deleteBtn);
        
        noteDiv.appendChild(h3);
        noteDiv.appendChild(p);
        noteDiv.appendChild(dateSpan);
        noteDiv.appendChild(btnGroup); 
        notesList.appendChild(noteDiv);
    });
}

// ==========================================
// 4. MODAL OLAYLARI (EVET / VAZGEÇ)
// ==========================================
modalCancelBtn.addEventListener('click', function() {
    deleteModal.classList.remove('show');
    itemToDeleteIndex = -1;
    itemToDeleteElement = null;
});

modalConfirmBtn.addEventListener('click', function() {
    if (itemToDeleteIndex > -1 && itemToDeleteElement) {
        deleteModal.classList.remove('show'); 
        itemToDeleteElement.classList.add('fade-out-item');
        
        setTimeout(function() {
            notesArray.splice(itemToDeleteIndex, 1);
            
            if(editIndex === itemToDeleteIndex) {
                editIndex = -1;
                addNoteBtn.textContent = "Notu Kaydet";
                noteTitleInput.value = "";
                noteContentInput.value = "";
                notePriorityInput.value = "medium";
            }
            
            saveNotesToStorage();
            renderNotes();
            showToast("Not kalıcı olarak silindi.", "success");
            
            itemToDeleteIndex = -1;
            itemToDeleteElement = null;
        }, 300);
    }
});

// ==========================================
// 5. DIŞA VE İÇE AKTARMA (EXPORT / IMPORT)
// ==========================================
exportBtn.addEventListener('click', function() {
    if (notesArray.length === 0) {
        showToast("İndirilecek not bulunmuyor!", "error");
        return;
    }

    const dataStr = JSON.stringify(notesArray, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'notlar-yedek.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast("Notlar yedeği başarıyla indirildi!", "success");
});

importBtn.addEventListener('click', function() {
    importFileInput.click();
});

importFileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const importedData = JSON.parse(e.target.result);
            
            if (Array.isArray(importedData)) {
                notesArray = importedData;
                saveNotesToStorage();
                renderNotes();
                showToast("Notlar yedeği başarıyla yüklendi!", "success");
            } else {
                showToast("Geçersiz yedek dosyası formatı!", "error");
            }
        } catch (error) {
            showToast("Dosya okunurken bir hata oluştu!", "error");
        }
        
        importFileInput.value = "";
    };
    
    reader.readAsText(file);
});

// ==========================================
// 6. DİĞER OLAY DİNLEYİCİLERİ
// ==========================================
searchNoteInput.addEventListener('input', function() {
    searchTerm = searchNoteInput.value.trim(); 
    renderNotes(); 
});

addNoteBtn.addEventListener('click', function() {
    const title = noteTitleInput.value.trim();
    const content = noteContentInput.value.trim();
    
    if (title === "" || content === "") {
        showToast("Lütfen hem başlık hem de içerik giriniz!", "error");
        return;
    }

    const selectedPriority = notePriorityInput.value;
    const now = new Date();
    const formattedDate = now.toLocaleDateString('tr-TR') + " " + now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

    if (editIndex > -1) {
        notesArray[editIndex].title = title; 
        notesArray[editIndex].content = content; 
        notesArray[editIndex].priority = selectedPriority;
        editIndex = -1; 
        addNoteBtn.textContent = "Notu Kaydet"; 
        showToast("Not güncellendi!", "success");
    } else {
        notesArray.push({ title: title, content: content, createdAt: formattedDate, priority: selectedPriority });
        showToast("Not başarıyla kaydedildi!", "success");
    }

    saveNotesToStorage();
    searchNoteInput.value = "";
    searchTerm = "";
    renderNotes();
    
    noteTitleInput.value = "";
    noteContentInput.value = "";
    notePriorityInput.value = "medium";
});

renderNotes();