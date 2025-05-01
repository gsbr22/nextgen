// Initialisation Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBzMi3F5vLM0bYxTY1KuBJf7eD6Nx96wsQ",
    authDomain: "login-ec53a.firebaseapp.com",
    projectId: "login-ec53a",
    storageBucket: "login-ec53a.appspot.com",
    messagingSenderId: "123644267529",
    appId: "1:123644267529:web:5409efdf896971c655bcd8"
};

// Initialiser Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// Initialisation EmailJS
emailjs.init('LDYR_83BF5t-wB9h2');

// Fonction pour afficher une notification
function showNotification(message, isSuccess = true) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.style.backgroundColor = isSuccess ? '#4CAF50' : '#f44336';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animation d'apparition
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Cliquer n'importe où pour fermer
    document.addEventListener('click', function closeNotification() {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.removeEventListener('click', closeNotification);
        }, 300);
    }, { once: true });
}

// Gestion des modales
document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.getElementById('loginLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    // Gestion de l'affichage des modales
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

    if (showRegister) {
        showRegister.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'none';
            registerModal.style.display = 'block';
        });
    }

    if (showLogin) {
        showLogin.addEventListener('click', function(e) {
            e.preventDefault();
            registerModal.style.display = 'none';
            loginModal.style.display = 'block';
        });
    }

    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            loginModal.style.display = 'none';
            registerModal.style.display = 'none';
        });
    });

    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === registerModal) {
            registerModal.style.display = 'none';
        }
    });

    // Gestion du formulaire de contact
    const contactForm = document.getElementById('contactForm');
    const contactBtn = document.getElementById('button');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(event) {
            event.preventDefault();
            
            // Changement du texte du bouton
            contactBtn.value = "Envoi en cours...";
            contactBtn.disabled = true;
            
            // 1. Enregistrement dans Firebase
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                message: document.getElementById('message').value,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            };
            
            database.ref('contacts').push(formData)
                .then(() => {
                    // 2. Envoi par EmailJS
                    emailjs.sendForm('default_service', 'template_nu2qbqm', contactForm)
                        .then(() => {
                            showNotification('Message envoyé avec succès !');
                            contactForm.reset();
                        })
                        .catch((err) => {
                            console.error('Erreur EmailJS:', err);
                            showNotification("Erreur lors de l'envoi de l'email", false);
                        })
                        .finally(() => {
                            contactBtn.value = "Envoyer le message";
                            contactBtn.disabled = false;
                        });
                })
                .catch(error => {
                    console.error('Erreur Firebase:', error);
                    showNotification('Erreur lors de la sauvegarde', false);
                    contactBtn.value = "Envoyer le message";
                    contactBtn.disabled = false;
                });
        });
    }

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            auth.signInWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    showNotification('Connexion réussie !');
                    loginModal.style.display = 'none';
                    loginForm.reset();
                    
                    // Mettre à jour le lien de connexion
                    if (loginLink) {
                        loginLink.textContent = 'Mon compte';
                    }
                })
                .catch((error) => {
                    console.error('Erreur de connexion:', error);
                    showNotification('Erreur de connexion: ' + error.message, false);
                });
        });
    }

    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('registerName').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                showNotification('Les mots de passe ne correspondent pas.', false);
                return;
            }
            
            auth.createUserWithEmailAndPassword(email, password)
                .then((userCredential) => {
                    // Enregistrement des données utilisateur supplémentaires
                    return database.ref('users/' + userCredential.user.uid).set({
                        name: name,
                        email: email,
                        createdAt: firebase.database.ServerValue.TIMESTAMP
                    });
                })
                .then(() => {
                    showNotification('Inscription réussie ! Vous êtes maintenant connecté.');
                    registerModal.style.display = 'none';
                    registerForm.reset();
                    
                    // Mettre à jour le lien de connexion
                    if (loginLink) {
                        loginLink.textContent = 'Mon compte';
                    }
                })
                .catch((error) => {
                    console.error('Erreur d\'inscription:', error);
                    showNotification('Erreur d\'inscription: ' + error.message, false);
                });
        });
    }

    // Vérifier l'état d'authentification au chargement
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Utilisateur connecté
            const loginLink = document.getElementById('loginLink');
            if (loginLink) {
                loginLink.textContent = 'Mon compte';
            }
        } else {
            // Utilisateur déconnecté
            const loginLink = document.getElementById('loginLink');
            if (loginLink) {
                loginLink.textContent = 'Connexion';
            }
        }
    });
});

// Navigation fluide pour les ancres
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        if (this.getAttribute('href') !== '#') {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        }
    });
});
