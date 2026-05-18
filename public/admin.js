// Initialize Firebase Auth
let currentUser = null;
let db = null;
let auth = null;

// Initialize when Firebase is ready
document.addEventListener('DOMContentLoaded', function() {
    // Wait for Firebase to initialize
    if (typeof firebase !== 'undefined') {
        initializeApp();
    } else {
        setTimeout(initializeApp, 1000);
    }
});

function initializeApp() {
    auth = firebase.auth();
    db = firebase.firestore();
    
    // Listen to auth state changes
    auth.onAuthStateChanged(async (user) => {
        if (user) {
            currentUser = user;
            
            // Check if user is authorized admin
            const isAdmin = await checkIfAdmin(user.email);
            
            if (isAdmin) {
                showAdminPanel(user.email);
            } else {
                showAuthSection('Not Authorized', `Your email (${user.email}) is not authorized as an admin. Contact arnold.darwin@gmail.com for access.`);
                auth.signOut();
            }
        } else {
            // Not logged in
            showAuthSection();
        }
    });
}

/**
 * Check if user email is in admin_users collection
 */
async function checkIfAdmin(email) {
    try {
        const adminRef = db.collection('admin_users').doc('users');
        const doc = await adminRef.get();
        
        if (doc.exists) {
            const emails = doc.data().emails || [];
            // Include super admin by default
            if (email === 'arnold.darwin@gmail.com' || emails.includes(email)) {
                return true;
            }
        } else {
            // If document doesn't exist and user is super admin, they're authorized
            return email === 'arnold.darwin@gmail.com';
        }
    } catch (error) {
        console.error('Error checking admin status:', error);
    }
    return false;
}

/**
 * Show auth section (login required)
 */
function showAuthSection(title = null, message = null) {
    document.getElementById('authSection').classList.add('show');
    document.getElementById('content').classList.remove('show');
    document.getElementById('userInfo').style.display = 'none';
    
    if (title && message) {
        document.getElementById('authSection').querySelector('h2').textContent = title;
        document.getElementById('authSection').querySelector('p:first-of-type').textContent = message;
    }
}

/**
 * Show admin panel content
 */
function showAdminPanel(email) {
    document.getElementById('authSection').classList.remove('show');
    document.getElementById('content').classList.add('show');
    
    const userInfo = document.getElementById('userInfo');
    userInfo.style.display = 'inline-block';
    document.getElementById('userEmail').textContent = `Logged in as: ${email}`;
    
    // Load initial data
    loadAdminList();
    loadChannels();
}

/**
 * Google login
 */
async function loginWithGoogle() {
    try {
        const provider = new firebase.auth.GoogleAuthProvider();
        await auth.signInWithPopup(provider);
    } catch (error) {
        showAlert('Login failed: ' + error.message, 'error');
    }
}

/**
 * Logout
 */
async function logout() {
    try {
        await auth.signOut();
        currentUser = null;
        showAuthSection();
    } catch (error) {
        showAlert('Logout failed: ' + error.message, 'error');
    }
}

/**
 * Load and display admin list
 */
async function loadAdminList() {
    try {
        const adminRef = db.collection('admin_users').doc('users');
        const doc = await adminRef.get();
        
        let adminEmails = doc.exists && doc.data().emails ? doc.data().emails : [];
        
        // Always include super admin
        if (!adminEmails.includes('arnold.darwin@gmail.com')) {
            adminEmails = ['arnold.darwin@gmail.com', ...adminEmails];
        }
        
        const adminList = document.getElementById('adminList');
        
        if (adminEmails.length === 0) {
            adminList.innerHTML = '<div class="empty-state"><p>No admin users yet.</p></div>';
            return;
        }
        
        adminList.innerHTML = adminEmails.map(email => `
            <li class="admin-item">
                <div class="admin-item-info">
                    <div class="admin-item-email">
                        ${email}
                        ${email === 'arnold.darwin@gmail.com' ? '<span class="admin-item-super">SUPER ADMIN</span>' : ''}
                    </div>
                </div>
                ${email !== 'arnold.darwin@gmail.com' && currentUser && currentUser.email === 'arnold.darwin@gmail.com' ? 
                    `<button class="btn btn-danger" onclick="removeAdmin('${email}')" style="margin-left: 10px;">Remove</button>` 
                    : ''}
            </li>
        `).join('');
    } catch (error) {
        showAlert('Failed to load admin list: ' + error.message, 'error');
    }
}

/**
 * Add new admin
 */
async function addAdmin() {
    const email = document.getElementById('adminEmail').value.trim();
    
    if (!email) {
        showAlert('Please enter an email address', 'warning');
        return;
    }
    
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        showAlert('Please enter a valid email address', 'warning');
        return;
    }
    
    if (currentUser.email !== 'arnold.darwin@gmail.com') {
        showAlert('Only super admin can add new admins', 'error');
        return;
    }
    
    try {
        document.getElementById('addAdminBtn').disabled = true;
        
        // Get current admins
        const adminRef = db.collection('admin_users').doc('users');
        const doc = await adminRef.get();
        let adminEmails = doc.exists && doc.data().emails ? doc.data().emails : [];
        
        if (adminEmails.includes(email)) {
            showAlert('This email is already an admin', 'warning');
            return;
        }
        
        // Add email
        adminEmails.push(email);
        await adminRef.set({ emails: adminEmails }, { merge: true });
        
        showAlert(`Admin ${email} added successfully`, 'success');
        document.getElementById('adminEmail').value = '';
        await loadAdminList();
    } catch (error) {
        showAlert('Failed to add admin: ' + error.message, 'error');
    } finally {
        document.getElementById('addAdminBtn').disabled = false;
    }
}

/**
 * Remove admin
 */
async function removeAdmin(email) {
    if (!confirm(`Are you sure you want to remove ${email} as an admin?`)) {
        return;
    }
    
    if (currentUser.email !== 'arnold.darwin@gmail.com') {
        showAlert('Only super admin can remove admins', 'error');
        return;
    }
    
    try {
        // Get current admins
        const adminRef = db.collection('admin_users').doc('users');
        const doc = await adminRef.get();
        let adminEmails = doc.exists && doc.data().emails ? doc.data().emails : [];
        
        // Remove email
        adminEmails = adminEmails.filter(e => e !== email);
        await adminRef.set({ emails: adminEmails }, { merge: true });
        
        showAlert(`Admin ${email} removed successfully`, 'success');
        await loadAdminList();
    } catch (error) {
        showAlert('Failed to remove admin: ' + error.message, 'error');
    }
}

/**
 * Load and display channels
 */
async function loadChannels() {
    try {
        const snapshot = await db.collection('telegram_channels').get();
        const channelList = document.getElementById('channelList');
        
        if (snapshot.empty) {
            channelList.innerHTML = '<div class="empty-state"><p>No channels added yet. Add your first channel above.</p></div>';
            return;
        }
        
        channelList.innerHTML = snapshot.docs.map(doc => {
            const data = doc.data();
            const lastScraped = data.lastScrapedDate ? new Date(data.lastScrapedDate.toDate()).toLocaleString() : 'Never';
            
            return `
                <li class="channel-item">
                    <div class="channel-item-info">
                        <div class="channel-item-name">${data.channelUrl.split('/').pop()}</div>
                        <div class="channel-item-url">${data.channelUrl}</div>
                        <div class="channel-item-meta">
                            Messages: ${data.totalMessages || 0} | Last scraped: ${lastScraped}
                        </div>
                    </div>
                    <div class="channel-item-actions">
                        <button class="btn btn-danger" onclick="deleteChannel('${doc.id}')">Delete</button>
                    </div>
                </li>
            `;
        }).join('');
    } catch (error) {
        showAlert('Failed to load channels: ' + error.message, 'error');
    }
}

/**
 * Add new channel
 */
async function addChannel() {
    const url = document.getElementById('channelUrl').value.trim();
    const name = document.getElementById('channelName').value.trim();
    
    if (!url) {
        showAlert('Please enter a channel URL', 'warning');
        return;
    }
    
    if (!url.startsWith('https://t.me/s/')) {
        showAlert('Please enter a valid Telegram channel URL (https://t.me/s/...)', 'warning');
        return;
    }
    
    try {
        document.getElementById('addChannelBtn').disabled = true;
        
        const channelId = url.split('/').pop() || `channel_${Date.now()}`;
        
        await db.collection('telegram_channels').doc(channelId).set({
            channelUrl: url,
            channelName: name || channelId,
            createdDate: new Date(),
            totalMessages: 0
        });
        
        showAlert('Channel added successfully', 'success');
        document.getElementById('channelUrl').value = '';
        document.getElementById('channelName').value = '';
        await loadChannels();
    } catch (error) {
        showAlert('Failed to add channel: ' + error.message, 'error');
    } finally {
        document.getElementById('addChannelBtn').disabled = false;
    }
}

/**
 * Delete a channel
 */
async function deleteChannel(channelId) {
    if (!confirm('Are you sure you want to delete this channel? Posts will remain but the channel will be removed from the list.')) {
        return;
    }
    
    try {
        await db.collection('telegram_channels').doc(channelId).delete();
        showAlert('Channel deleted successfully', 'success');
        await loadChannels();
    } catch (error) {
        showAlert('Failed to delete channel: ' + error.message, 'error');
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'info') {
    const alertsContainer = document.getElementById('alerts');
    const alertId = 'alert_' + Date.now();
    
    const alertDiv = document.createElement('div');
    alertDiv.id = alertId;
    alertDiv.className = `alert alert-${type} show`;
    alertDiv.textContent = message;
    
    alertsContainer.appendChild(alertDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        const elem = document.getElementById(alertId);
        if (elem) {
            elem.classList.remove('show');
            setTimeout(() => elem.remove(), 300);
        }
    }, 5000);
}
