// Initialisation Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBzMi3F5vLM0bYxTY1KuBJf7eD6Nx96wsQ",
    authDomain: "login-ec53a.firebaseapp.com",
    projectId: "login-ec53a",
    storageBucket: "login-ec53a.appspot.com",
    messagingSenderId: "123644267529",
    appId: "1:123644267529:web:5409efdf896971c655bcd8"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
emailjs.init('LDYR_83BF5t-wB9h2');

function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = `notification ${isSuccess ? '' : 'error'}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function() {
    // Gestion des modales
    const loginLink = document.getElementById('loginLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            if (auth.currentUser) {
                window.location.href = 'moncompte.html';
            } else {
                loginModal.style.display = 'block';
            }
        });
    }

    if (showRegister) showRegister.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.style.display = 'none';
        registerModal.style.display = 'block';
    });

    if (showLogin) showLogin.addEventListener('click', (e) => {
        e.preventDefault();
        registerModal.style.display = 'none';
        loginModal.style.display = 'block';
    });

    closeButtons.forEach(btn => btn.addEventListener('click', () => {
        loginModal.style.display = 'none';
        registerModal.style.display = 'none';
    }));

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.style.display = 'none';
        if (e.target === registerModal) registerModal.style.display = 'none';
    });

    // Formulaire de contact
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const button = document.getElementById('button');
            button.disabled = true;
            button.value = "Envoi en cours...";
            
            // Enregistrement dans Firebase
            database.ref('contacts').push({
                name: contactForm.name.value,
                email: contactForm.email.value,
                message: contactForm.message.value,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                // Envoi par EmailJS
                return emailjs.sendForm('default_service', 'template_nu2qbqm', contactForm);
            }).then(() => {
                showNotification('Message envoyé avec succès !');
                contactForm.reset();
            }).catch(error => {
                console.error('Erreur:', error);
                showNotification("Erreur lors de l'envoi du message", false);
            }).finally(() => {
                button.disabled = false;
                button.value = "Envoyer le message";
            });
        });
    }

    // Connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            auth.signInWithEmailAndPassword(
                loginForm.loginEmail.value, 
                loginForm.loginPassword.value
            ).then(() => {
                showNotification('Connexion réussie !');
                loginModal.style.display = 'none';
                if (loginLink) loginLink.textContent = 'Mon compte';
            }).catch(error => {
                showNotification('Erreur: ' + error.message, false);
            });
        });
    }

    // Inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (registerForm.registerPassword.value !== registerForm.registerConfirmPassword.value) {
                showNotification('Les mots de passe ne correspondent pas', false);
                return;
            }
            
            auth.createUserWithEmailAndPassword(
                registerForm.registerEmail.value,
                registerForm.registerPassword.value
            ).then((userCredential) => {
                return database.ref('users/' + userCredential.user.uid).set({
                    name: registerForm.registerName.value,
                    email: registerForm.registerEmail.value,
                    createdAt: firebase.database.ServerValue.TIMESTAMP
                });
            }).then(() => {
                showNotification('Inscription réussie !');
                registerModal.style.display = 'none';
                if (loginLink) loginLink.textContent = 'Mon compte';
            }).catch(error => {
                showNotification('Erreur: ' + error.message, false);
            });
        });
    }

    // Vérification de l'état d'authentification
    auth.onAuthStateChanged(user => {
        const loginLink = document.getElementById('loginLink');
        if (loginLink) {
            loginLink.textContent = user ? 'Mon compte' : 'Connexion';
        }
    });

    // Navigation fluide
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') !== '#') {
                e.preventDefault();
                document.querySelector(this.getAttribute('href'))?.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});
