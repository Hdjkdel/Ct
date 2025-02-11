// Firebase yapılandırması
const firebaseConfig = {
    apiKey: "AIzaSyAUbog1XdIucX7g3bvU44j9x1zIQeTmboY",
    authDomain: "crypto-uygulama-key.firebaseapp.com",
    databaseURL: "https://crypto-uygulama-key-default-rtdb.firebaseio.com",
    projectId: "crypto-uygulama-key",
    storageBucket: "crypto-uygulama-key.firebasestorage.app",
    messagingSenderId: "995263381585",
    appId: "1:995263381585:web:c876e8e9807f5f479a3870"
};

// Firebase başlat
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Kullanıcı adı değişkeni
let kullaniciAdi = "";

// Sayfa yüklendiğinde kullanıcı adı kontrolü
window.onload = function () {
    const kayitliKullaniciAdi = localStorage.getItem("kullaniciAdi");
    if (kayitliKullaniciAdi) {
        kullaniciAdi = kayitliKullaniciAdi;
        sohbetEkraniniAc();
    }

    // 📢 Kullanıcıdan bildirim izni al
    bildirimIzniIste();
};

// Kullanıcı girişini kaydetme
function uyeKaydet() {
    const girilenKadi = document.getElementById("kadi").value.trim();
    if (girilenKadi === "") {
        alert("Lütfen bir kullanıcı adı giriniz.");
        return;
    }

    kullaniciAdi = girilenKadi;
    localStorage.setItem("kullaniciAdi", kullaniciAdi);
    sohbetEkraniniAc();
}

// Sohbet ekranını açan fonksiyon
function sohbetEkraniniAc() {
    document.getElementById("girisEkrani").style.display = "none";
    document.getElementById("chatEkrani").style.display = "block";
    mesajlariYukle();
}

// Mesaj gönderme
function mesajGonder() {
    const mesajInput = document.getElementById("mesaj");
    const mesaj = mesajInput.value.trim();
    if (mesaj === "") {
        alert("Lütfen bir mesaj yazınız.");
        return;
    }

    const mesajData = {
        kullanici: kullaniciAdi,
        mesaj: mesaj,
        tarih: new Date().toLocaleString()
    };

    const yeniMesajRef = database.ref("mesajlar").push();
    yeniMesajRef.set(mesajData);  // Firebase'e mesajı ekle

    mesajInput.value = "";
}

// Mesajları listeleme
function mesajlariYukle() {
    const mesajAlani = document.getElementById("mesajAlani");
    mesajAlani.innerHTML = ""; // Önceki mesajları temizle

    database.ref("mesajlar").on("child_added", function (snapshot) {
        const mesaj = snapshot.val();
        mesajlariGoster(mesaj, snapshot.key); // Firebase anahtarını da al
    });
}

// Mesajları ekrana ekleme ve bildirim gönderme
function mesajlariGoster(mesaj, mesajKey) {
    const mesajAlani = document.getElementById("mesajAlani");
    const mesajDiv = document.createElement("div");

    mesajDiv.style.display = "flex";
    mesajDiv.style.alignItems = "center";
    mesajDiv.style.padding = "10px 15px";
    mesajDiv.style.marginBottom = "15px";
    mesajDiv.style.borderRadius = "15px";
    mesajDiv.style.transition = "all 0.3s ease-in-out";
    mesajDiv.style.position = "relative";

    if (mesaj.kullanici === kullaniciAdi) {
        mesajDiv.style.backgroundColor = "#3f51b5";
        mesajDiv.style.marginLeft = "auto";
        mesajDiv.style.borderTopLeftRadius = "0";
        mesajDiv.style.borderTopRightRadius = "15px";
        mesajDiv.style.boxShadow = "0 2px 10px rgba(0, 0, 0, 0.1)";
    } else {
        mesajDiv.style.backgroundColor = "#444";
        mesajDiv.style.marginRight = "auto";
        mesajDiv.style.borderTopRightRadius = "0";
        mesajDiv.style.borderTopLeftRadius = "15px";
    }

    const profilResmi = document.createElement("img");
    profilResmi.src = "https://i.imgur.com/McIgHAz.png";
    profilResmi.alt = "Profil Resmi";
    profilResmi.style.width = "40px";
    profilResmi.style.height = "40px";
    profilResmi.style.borderRadius = "50%";
    profilResmi.style.marginRight = "10px";

    const mesajMetni = document.createElement("div");
    mesajMetni.innerHTML = `
        <strong style="font-size: 0.9rem; color: #fff;">${mesaj.kullanici}:</strong>
        <p style="font-size: 1rem; color: #fff;">${mesaj.mesaj}</p>
        <br>
        <small style="font-size: 0.8rem; color: #ccc;">${mesaj.tarih}</small>
    `;

    mesajDiv.appendChild(profilResmi);
    mesajDiv.appendChild(mesajMetni);

    // 🔴 **Sil Butonu** (Sadece kendi mesajlarında görünsün)
    if (mesaj.kullanici === kullaniciAdi) {
        const silButonu = document.createElement("button");
        silButonu.innerHTML = "🗑️";
        silButonu.style.position = "absolute";
        silButonu.style.top = "5px";
        silButonu.style.right = "10px";
        silButonu.style.background = "red";
        silButonu.style.border = "none";
        silButonu.style.color = "white";
        silButonu.style.padding = "5px 10px";
        silButonu.style.borderRadius = "5px";
        silButonu.style.cursor = "pointer";

        silButonu.onclick = function () {
            mesajSil(mesajKey);
        };

        mesajDiv.appendChild(silButonu);
    }

    mesajAlani.appendChild(mesajDiv);
    mesajAlani.scrollTop = mesajAlani.scrollHeight;
}

// **Mesajı Firebase'den Silme**
function mesajSil(mesajKey) {
    if (confirm("Bu mesajı silmek istediğinize emin misiniz?")) {
        database.ref("mesajlar").child(mesajKey).remove()
            .then(() => {
                alert("Mesaj silindi.");
                mesajlariYukle(); // Sayfayı güncelle
            })
            .catch(error => {
                console.error("Mesaj silinirken hata oluştu:", error);
            });
    }
}
