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

// Gestion des modales
document.addEventListener('DOMContentLoaded', function() {
    const loginLink = document.getElementById('loginLink');
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const closeButtons = document.querySelectorAll('.close');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    if (loginLink) {
        loginLink.addEventListener('click', function(e) {
            e.preventDefault();
            loginModal.style.display = 'block';
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
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            // Fonction pour afficher une notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
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
            // Envoyer les données à Firebase
            database.ref('contacts').push({
                name: name,
                email: email,
                message: message,
                timestamp: firebase.database.ServerValue.TIMESTAMP
            }).then(() => {
                alert('Message envoyé avec succès !');
                contactForm.reset();
            }).catch(error => {
                console.error('Erreur:', error);
                alert('Une erreur est survenue. Veuillez réessayer.');
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
                    // Connexion réussie
                    alert('Connexion réussie !');
                    loginModal.style.display = 'none';
                    loginForm.reset();
                })
                .catch((error) => {
                    console.error('Erreur de connexion:', error);
                    alert('Erreur de connexion: ' + error.message);
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
                alert('Les mots de passe ne correspondent pas.');
                return;
            }
            // Remplacer l'alerte existante par :
showNotification('Inscription réussie ! Vous êtes maintenant connecté.');
registerModal.style.display = 'none';
registerForm.reset();
            
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
                    alert('Inscription réussie ! Vous êtes maintenant connecté.');
                    registerModal.style.display = 'none';
                    registerForm.reset();
                })
                .catch((error) => {
                    console.error('Erreur d\'inscription:', error);
                    alert('Erreur d\'inscription: ' + error.message);
                });
        });
    }

    // Vérifier l'état d'authentification
    auth.onAuthStateChanged((user) => {
        if (user) {
            // Utilisateur connecté
            const loginLink = document.getElementById('loginLink');
            if (loginLink) {
                loginLink.textContent = 'Mon compte';
                // Vous pouvez ajouter ici un lien vers le tableau de bord utilisateur
            }
        } else {
            // Utilisateur déconnecté
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
