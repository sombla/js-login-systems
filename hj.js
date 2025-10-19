// إدارة المستخدمين
class UserManager {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        const users = localStorage.getItem('users');
        return users ? JSON.parse(users) : [];
    }

    saveUsers() {
        localStorage.setItem('users', JSON.stringify(this.users));
    }

    registerUser(email, password) {
        // التحقق من وجود المستخدم مسبقاً
        if (this.users.find(user => user.email === email)) {
            return { success: false, message: 'البريد الإلكتروني مسجل مسبقاً' };
        }

        // إضافة المستخدم الجديد
        const newUser = {
            email: email,
            password: password, // في التطبيق الحقيقي يجب تشفير كلمة المرور
            registerDate: new Date().toLocaleString('ar-EG')
        };

        this.users.push(newUser);
        this.saveUsers();

        return { success: true, message: 'تم إنشاء الحساب بنجاح' };
    }

    loginUser(email, password) {
        const user = this.users.find(user => user.email === email && user.password === password);
        
        if (user) {
            // حفظ بيانات الجلسة
            sessionStorage.setItem('currentUser', JSON.stringify({
                email: user.email,
                loginTime: new Date().toLocaleString('ar-EG')
            }));
            return { success: true, message: 'تم تسجيل الدخول بنجاح' };
        } else {
            return { success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' };
        }
    }

    getCurrentUser() {
        return JSON.parse(sessionStorage.getItem('currentUser'));
    }

    logout() {
        sessionStorage.removeItem('currentUser');
    }

    getAllUsers() {
        return this.users;
    }
}

// إنشاء كائن مدير المستخدمين
const userManager = new UserManager();

// دوال التحكم في الواجهة
function showRegister() {
    document.getElementById('login-form').parentElement.style.display = 'none';
    document.getElementById('register-box').style.display = 'block';
    clearMessages();
}

function showLogin() {
    document.getElementById('register-box').style.display = 'none';
    document.getElementById('login-form').parentElement.style.display = 'block';
    clearMessages();
}

function clearMessages() {
    document.querySelectorAll('.error-message, .success-message').forEach(el => {
        el.textContent = '';
        el.style.display = 'none';
    });
}

function showMessage(element, message, isError = true) {
    element.textContent = message;
    element.style.display = 'block';
    element.style.color = isError ? '#c62828' : '#2e7d32';
    element.style.backgroundColor = isError ? '#ffebee' : '#e8f5e8';
    element.style.borderRightColor = isError ? '#c62828' : '#2e7d32';
}

// معالجة تسجيل الدخول
if (document.getElementById('login-form')) {
    document.getElementById('login-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const errorElement = document.getElementById('error-message');
        const successElement = document.getElementById('success-message');

        clearMessages();

        if (!email || !password) {
            showMessage(errorElement, 'جميع الحقول مطلوبة');
            return;
        }

        const result = userManager.loginUser(email, password);
        
        if (result.success) {
            showMessage(successElement, result.message, false);
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showMessage(errorElement, result.message);
        }
    });
}

// معالجة إنشاء الحساب
if (document.getElementById('register-form')) {
    document.getElementById('register-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = document.getElementById('new-email').value;
        const password = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const errorElement = document.getElementById('register-error');
        const successElement = document.getElementById('register-success');

        clearMessages();

        if (!email || !password || !confirmPassword) {
            showMessage(errorElement, 'جميع الحقول مطلوبة');
            return;
        }

        if (password !== confirmPassword) {
            showMessage(errorElement, 'كلمات المرور غير متطابقة');
            return;
        }

        if (password.length < 6) {
            showMessage(errorElement, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
            return;
        }

        const result = userManager.registerUser(email, password);
        
        if (result.success) {
            showMessage(successElement, result.message, false);
            document.getElementById('register-form').reset();
            setTimeout(() => {
                showLogin();
            }, 2000);
        } else {
            showMessage(errorElement, result.message);
        }
    });
}

// لوحة التحكم
if (document.getElementById('user-email')) {
    const currentUser = userManager.getCurrentUser();
    
    if (!currentUser) {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('user-email').textContent = currentUser.email;
    document.getElementById('login-time').textContent = currentUser.loginTime;
}

function viewUsers() {
    const usersList = document.getElementById('users-list');
    const usersContent = document.getElementById('users-content');
    
    if (usersList.style.display === 'none') {
        const users = userManager.getAllUsers();
        
        if (users.length === 0) {
            usersContent.innerHTML = '<p>لا يوجد مستخدمين مسجلين</p>';
        } else {
            usersContent.innerHTML = users.map(user => `
                <div class="user-item">
                    <strong>البريد الإلكتروني:</strong> ${user.email}<br>
                    <strong>تاريخ التسجيل:</strong> ${user.registerDate}
                </div>
            `).join('');
        }
        
        usersList.style.display = 'block';
    } else {
        usersList.style.display = 'none';
    }
}

function logout() {
    userManager.logout();
    window.location.href = 'index.html';
}

// التحقق من حالة المستخدم عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.pathname.includes('dashboard.html')) {
        const currentUser = userManager.getCurrentUser();
        if (!currentUser) {
            window.location.href = 'index.html';
        }
    }
});
