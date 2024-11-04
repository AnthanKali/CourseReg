// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyCBktT-auE0S-bKloOo1dFaJWi6D9X4qI4",
    authDomain: "reschedule-org.firebaseapp.com",
    projectId: "reschedule-org",
    storageBucket: "reschedule-org.appspot.com",
    messagingSenderId: "499514507171",
    appId: "1:499514507171:web:c6762b93a03ecff2de2416",
    measurementId: "G-Y8YSYT49NE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get Firebase services
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

let currentUser = null;
let isAdmin = false;

// Mock data (will be replaced with Firebase data)
let mockCourses = [
    { id: 1, name: "Introduction to Computer Science", code: "CS101", credits: 3, enrolled: true },
    { id: 2, name: "Data Structures and Algorithms", code: "CS201", credits: 4, enrolled: false },
    { id: 3, name: "Web Development", code: "CS301", credits: 3, enrolled: true },
    { id: 4, name: "Database Systems", code: "CS401", credits: 4, enrolled: false },
    { id: 5, name: "Artificial Intelligence", code: "CS501", credits: 3, enrolled: false },
    { id: 6, name: "Machine Learning", code: "CS601", credits: 4, enrolled: false },
    { id: 7, name: "Computer Networks", code: "CS701", credits: 3, enrolled: false },
    { id: 8, name: "Operating Systems", code: "CS801", credits: 4, enrolled: false },
    { id: 9, name: "Software Engineering", code: "CS901", credits: 3, enrolled: false },
    { id: 10, name: "Cybersecurity", code: "CS1001", credits: 4, enrolled: false },
];

let mockUsers = [
    { id: 1, name: "John Doe", email: "john@example.com", role: "student" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", role: "student" },
    { id: 3, name: "Admin User", email: "admin@system", role: "admin" }
];

const mockSchedule = [
    { day: "Monday", time: "10:00 AM - 11:30 AM", course: "CS101" },
    { day: "Monday", time: "2:00 PM - 3:30 PM", course: "CS301" },
    { day: "Wednesday", time: "10:00 AM - 11:30 AM", course: "CS101" },
    { day: "Wednesday", time: "2:00 PM - 3:30 PM", course: "CS301" },
    { day: "Friday", time: "10:00 AM - 11:30 AM", course: "CS101" },
];

const mockGrades = [
    { course: "CS101", grade: "A", credits: 3 },
    { course: "CS301", grade: "B+", credits: 3 },
];

// Helper functions
function calculateGPA() {
    const gradePoints = {
        'A': 4.0, 'A-': 3.7, 'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7, 'D+': 1.3, 'D': 1.0, 'F': 0.0
    };
    const totalPoints = mockGrades.reduce((sum, grade) => sum + gradePoints[grade.grade] * grade.credits, 0);
    const totalCredits = mockGrades.reduce((sum, grade) => sum + grade.credits, 0);
    return (totalPoints / totalCredits).toFixed(2);
}

function getTotalCredits() {
    return mockCourses.filter(course => course.enrolled).reduce((sum, course) => sum + course.credits, 0);
}

// DOM manipulation functions
function updateUserInfo() {
    if (currentUser) {
        document.getElementById('userName').textContent = currentUser.displayName || currentUser.email;
        if (currentUser.photoURL) {
            document.getElementById('userAvatar').src = currentUser.photoURL;
        }
    }
}

function adminLogin(password) {
    if (password === "admin@login") {
        isAdmin = true;
        currentUser = mockUsers.find(user => user.role === "admin");
        document.getElementById('adminTab').style.display = 'block';
        closeModal('adminLoginModal');
        showNotification("Logged in as admin successfully");
        updateUserInfo();
        showTab('admin');
    } else {
        alert("Incorrect admin password. Please try again.");
    }
}

function createOverviewTab() {
    const enrolledCourses = mockCourses.filter(course => course.enrolled);
    const content = `
        <div class="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="card">
                <div class="card-title">Total Enrolled Courses</div>
                <div class="text-2xl font-bold">${enrolledCourses.length}</div>
            </div>
            <div class="card">
                <div class="card-title">Total Credits</div>
                <div class="text-2xl font-bold">${getTotalCredits()}</div>
            </div>
            <div class="card">
                <div class="card-title">Current GPA</div>
                <div class="text-2xl font-bold">${calculateGPA()}</div>
            </div>
            <div class="card">
                <div class="card-title">Next Class</div>
                <div class="text-2xl font-bold">CS101</div>
                <p class="text-xs text-muted-foreground">Today at 10:00 AM</p>
            </div>
        </div>
        <div class="mt-8 grid md:grid-cols-2 gap-8">
            <div class="card">
                <div class="card-title">Course Progress</div>
                <div class="chart-container">
                    <canvas id="courseProgressChart"></canvas>
                </div>
            </div>
            <div class="card">
                <div class="card-title">Grade Distribution</div>
                <div class="chart-container">
                    <canvas id="gradeDistributionChart"></canvas>
                </div>
            </div>
        </div>
        <div class="mt-8 card">
            <div class="card-title">Recent Activity</div>
            <div class="activity-log">
                <div class="activity-item">Enrolled in CS101 - Introduction to Computer Science</div>
                <div class="activity-item">Completed assignment for CS301 - Web Development</div>
                <div class="activity-item">Viewed course materials for CS201 - Data Structures and Algorithms</div>
                <div class="activity-item">Updated profile information</div>
                <div class="activity-item">Submitted course evaluation for CS101</div>
            </div>
        </div>
    `;
    return content;
}

function createCoursesTab() {
    const courseRows = mockCourses.map(course => `
        <tr>
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>
                <button class="btn ${course.enrolled ? 'btn-danger' : 'btn-primary'}" 
                        onclick="toggleEnrollment(${course.id})">
                    ${course.enrolled ? 'Unenroll' : 'Enroll'}
                </button>
            </td>
        </tr>
    `).join('');

    const content = `
        <div class="card">
            <div class="card-title">Available Courses</div>
            <div class="form-group">
                <label for="search" class="form-label">Search Courses</label>
                <input id="search" class="form-input" placeholder="Search by course name or code" oninput="filterCourses()">
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Course Code</th>
                        <th>Course Name</th>
                        <th>Credits</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="courseTableBody">
                    ${courseRows}
                </tbody>
            </table>
        </div>
    `;
    return content;
}

function createScheduleTab() {
    const scheduleRows = mockSchedule.map(item => `
        <tr>
            <td>${item.day}</td>
            <td>${item.time}</td>
            <td>${item.course}</td>
        </tr>
    `).join('');

    const content = `
        <div class="card">
            <div class="card-title">Weekly Schedule</div>
            <table>
                <thead>
                    <tr>
                        <th>Day</th>
                        <th>Time</th>
                        <th>Course</th>
                    </tr>
                </thead>
                <tbody>
                    ${scheduleRows}
                </tbody>
            </table>
        </div>
    `;
    return content;
}

function createGradesTab() {
    const gradeRows = mockGrades.map(grade => `
        <tr>
            <td>${grade.course}</td>
            <td>${grade.grade}</td>
            <td>${grade.credits}</td>
        </tr>
    `).join('');

    const content = `
        <div class="card">
            <div class="card-title">Grades</div>
            <table>
                <thead>
                    <tr>
                        <th>Course</th>
                        <th>Grade</th>
                        <th>Credits</th>
                    </tr>
                </thead>
                <tbody>
                    ${gradeRows}
                </tbody>
            </table>
            <div class="mt-4">
                <strong>Current GPA: ${calculateGPA()}</strong>
            </div>
        </div>
    `;
    return content;
}

function createAdminTab() {
    const content = `
        <div class="admin-controls">
            <div class="admin-card">
                <h3>User Management</h3>
                <button class="btn btn-primary" onclick="showUserManagement()">Manage Users</button>
            </div>
            <div class="admin-card">
                <h3>Course Management</h3>
                <button class="btn btn-primary" onclick="showCourseManagement()">Manage Courses</button>
            </div>
            <div class="admin-card">
                <h3>System Settings</h3>
                <button class="btn btn-primary" onclick="showSystemSettings()">Manage Settings</button>
            </div>
        </div>
        <div id="adminContent"></div>
    `;
    return content;
}

function showTab(tabName) {
    const tabContent = document.getElementById('tabContent');
    switch (tabName) {
        case 'overview':
            tabContent.innerHTML = createOverviewTab();
            initializeCharts();
            break;
        case 'courses':
            tabContent.innerHTML = createCoursesTab();
            break;
        case 'schedule':
            tabContent.innerHTML = createScheduleTab();
            break;
        case 'grades':
            tabContent.innerHTML = createGradesTab();
            break;
        case 'admin':
            if (isAdmin) {
                tabContent.innerHTML = createAdminTab();
            } else {
                tabContent.innerHTML = '<p>You do not have permission to access this page.</p>';
            }
            break;
    }
}

function toggleEnrollment(courseId) {
    const course = mockCourses.find(c => c.id === courseId);
    if (course) {
        course.enrolled = !course.enrolled;
        showTab('courses');
        showNotification(`You have ${course.enrolled ? 'enrolled in' : 'unenrolled from'} ${course.name}.`);
    }
}

function filterCourses() {
    const searchTerm = document.getElementById('search').value.toLowerCase();
    const filteredCourses = mockCourses.filter(course =>
        course.name.toLowerCase().includes(searchTerm) ||
        course.code.toLowerCase().includes(searchTerm)
    );
    const courseTableBody = document.getElementById('courseTableBody');
    courseTableBody.innerHTML = filteredCourses.map(course => `
        <tr>
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>
                <button class="btn ${course.enrolled ? 'btn-danger' : 'btn-primary'}" 
                        onclick="toggleEnrollment(${course.id})">
                    ${course.enrolled ? 'Unenroll' : 'Enroll'}
                </button>
            </td>
        </tr>
    `).join('');
}

function showNotification(message) {
    const notificationDropdown = document.getElementById('notificationDropdown');
    const newNotification = document.createElement('a');
    newNotification.href = '#';
    newNotification.classList.add('notification-item');
    newNotification.textContent = message;
    notificationDropdown.insertBefore(newNotification, notificationDropdown.firstChild.nextSibling.nextSibling);
    
    const badge = document.getElementById('notificationBadge');
    badge.textContent = parseInt(badge.textContent) + 1;
    badge.style.display = 'inline-block';
}

function showUserManagement() {
    const userRows = mockUsers.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editUser(${user.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser(${user.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    const content = `
        <div class="card mt-4">
            <div class="card-title">User Management</div>
            <button class="btn btn-primary mb-2" onclick="showAddUserForm()">Add New User</button>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${userRows}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('adminContent').innerHTML = content;
}

function showAddUserForm() {
    const form = `
        <div class="card mt-4">
            <div class="card-title">Add New User</div>
            <form id="addUserForm">
                <div class="form-group">
                    <label for="userName">Name:</label>
                    <input type="text" id="userName" required>
                </div>
                <div class="form-group">
                    <label for="userEmail">Email:</label>
                    <input type="email" id="userEmail" required>
                </div>
                <div class="form-group">
                    <label for="userRole">Role:</label>
                    <select id="userRole">
                        <option value="student">Student</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
                <button type="submit" class="btn btn-primary">Add User</button>
            </form>
        </div>
    `;
    document.getElementById('adminContent').innerHTML = form;
    document.getElementById('addUserForm').addEventListener('submit', addUser);
}

function addUser(e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const email = document.getElementById('userEmail').value;
    const role = document.getElementById('userRole').value;
    const newUser = {
        id: mockUsers.length + 1,
        name: name,
        email: email,
        role: role
    };
    mockUsers.push(newUser);
    showNotification(`New user ${name} added successfully`);
    showUserManagement();
}

function editUser(userId) {
    const user = mockUsers.find(u => u.id === userId);
    if (user) {
        const form = `
            <div class="card mt-4">
                <div class="card-title">Edit User</div>
                <form id="editUserForm">
                    <input type="hidden" id="editUserId" value="${user.id}">
                    <div class="form-group">
                        <label for="editUserName">Name:</label>
                        <input type="text" id="editUserName" value="${user.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserEmail">Email:</label>
                        <input type="email" id="editUserEmail" value="${user.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="editUserRole">Role:</label>
                        <select id="editUserRole">
                            <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
                            <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
                        </select>
                    </div>
                    <button type="submit" class="btn btn-primary">Update User</button>
                </form>
            </div>
        `;
        document.getElementById('adminContent').innerHTML = form;
        document.getElementById('editUserForm').addEventListener('submit', updateUser);
    }
}

function updateUser(e) {
    e.preventDefault();
    const userId = parseInt(document.getElementById('editUserId').value);
    const name = document.getElementById('editUserName').value;
    const email = document.getElementById('editUserEmail').value;
    const role = document.getElementById('editUserRole').value;
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex !== -1) {
        mockUsers[userIndex] = { ...mockUsers[userIndex], name, email, role };
        showNotification(`User ${name} updated successfully`);
        showUserManagement();
    }
}

function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        mockUsers = mockUsers.filter(u => u.id !== userId);
        showNotification('User deleted successfully');
        showUserManagement();
    }
}

function showCourseManagement() {
    const courseRows = mockCourses.map(course => `
        <tr>
            <td>${course.code}</td>
            <td>${course.name}</td>
            <td>${course.credits}</td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="editCourse(${course.id})">Edit</button>
                <button class="btn btn-sm btn-danger" onclick="deleteCourse(${course.id})">Delete</button>
            </td>
        </tr>
    `).join('');

    const content = `
        <div class="card mt-4">
            <div class="card-title">Course Management</div>
            <button class="btn btn-primary mb-2" onclick="showAddCourseForm()">Add New Course</button>
            <table>
                <thead>
                    <tr>
                        <th>Code</th>
                        <th>Name</th>
                        <th>Credits</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${courseRows}
                </tbody>
            </table>
        </div>
    `;
    document.getElementById('adminContent').innerHTML = content;
}

function showAddCourseForm() {
    const form = `
        <div class="card mt-4">
            <div class="card-title">Add New Course</div>
            <form id="addCourseForm">
                <div class="form-group">
                    <label for="courseCode">Course Code:</label>
                    <input type="text" id="courseCode" required>
                </div>
                <div class="form-group">
                    <label for="courseName">Course Name:</label>
                    <input type="text" id="courseName" required>
                </div>
                <div class="form-group">
                    <label for="courseCredits">Credits:</label>
                    <input type="number" id="courseCredits" required>
                </div>
                <button type="submit" class="btn btn-primary">Add Course</button>
            </form>
        </div>
    `;
    document.getElementById('adminContent').innerHTML = form;
    document.getElementById('addCourseForm').addEventListener('submit', addCourse);
}

function addCourse(e) {
    e.preventDefault();
    const code = document.getElementById('courseCode').value;
    const name = document.getElementById('courseName').value;
    const credits = parseInt(document.getElementById('courseCredits').value);
    const newCourse = {
        id: mockCourses.length + 1,
        code: code,
        name: name,
        credits: credits,
        enrolled: false
    };
    mockCourses.push(newCourse);
    showNotification(`New course ${code} added successfully`);
    showCourseManagement();
}

function editCourse(courseId) {
    const course = mockCourses.find(c => c.id === courseId);
    if (course) {
        const form = `
            <div class="card mt-4">
                <div class="card-title">Edit Course</div>
                <form id="editCourseForm">
                    <input type="hidden" id="editCourseId" value="${course.id}">
                    <div class="form-group">
                        <label for="editCourseCode">Course Code:</label>
                        <input type="text" id="editCourseCode" value="${course.code}" required>
                    </div>
                    <div class="form-group">
                        <label for="editCourseName">Course Name:</label>
                        <input type="text" id="editCourseName" value="${course.name}" required>
                    </div>
                    <div class="form-group">
                        <label for="editCourseCredits">Credits:</label>
                        <input type="number" id="editCourseCredits" value="${course.credits}" required>
                    </div>
                    <button type="submit" class="btn btn-primary">Update Course</button>
                </form>
            </div>
        `;
        document.getElementById('adminContent').innerHTML = form;
        document.getElementById('editCourseForm').addEventListener('submit', updateCourse);
    }
}

function updateCourse(e) {
    e.preventDefault();
    const courseId = parseInt(document.getElementById('editCourseId').value);
    const code = document.getElementById('editCourseCode').value;
    const name = document.getElementById('editCourseName').value;
    const credits = parseInt(document.getElementById('editCourseCredits').value);
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
        mockCourses[courseIndex] = { ...mockCourses[courseIndex], code, name, credits };
        showNotification(`Course ${code} updated successfully`);
        showCourseManagement();
    }
}

function deleteCourse(courseId) {
    if (confirm('Are you sure you want to delete this course?')) {
        mockCourses = mockCourses.filter(c => c.id !== courseId);
        showNotification('Course deleted successfully');
        showCourseManagement();
    }
}

function showSystemSettings() {
    const content = `
        <div class="card mt-4">
            <div class="card-title">System Settings</div>
            <form id="systemSettingsForm">
                <div class="form-group">
                    <label for="systemName">System Name:</label>
                    <input type="text" id="systemName" value="Course Registration System" required>
                </div>
                <div class="form-group">
                    <label for="maxEnrollments">Max Enrollments per Student:</label>
                    <input type="number" id="maxEnrollments" value="5" required>
                </div>
                <div class="form-group">
                    <label for="enrollmentPeriod">Enrollment Period:</label>
                    <input type="text" id="enrollmentPeriod" value="Aug 1 - Sep 15" required>
                </div>
                <button type="submit" class="btn btn-primary">Save Settings</button>
            </form>
        </div>
    `;
    document.getElementById('adminContent').innerHTML = content;
    document.getElementById('systemSettingsForm').addEventListener('submit', saveSystemSettings);
}

function saveSystemSettings(e) {
    e.preventDefault();
    const systemName = document.getElementById('systemName').value;
    const maxEnrollments = parseInt(document.getElementById('maxEnrollments').value);
    const enrollmentPeriod = document.getElementById('enrollmentPeriod').value;
    // In a real application, you would save these settings to a database
    showNotification('System settings updated successfully');
}

function initializeCharts() {
    // Course Progress Chart
    const courseProgressCtx = document.getElementById('courseProgressChart').getContext('2d');
    new Chart(courseProgressCtx, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Not Started'],
            datasets: [{
                data: [3, 2, 5],
                backgroundColor: ['#10B981', '#3B82F6', '#EF4444']
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                }
            }
        }
    });

    // Grade Distribution Chart
    const gradeDistributionCtx = document.getElementById('gradeDistributionChart').getContext('2d');
    new Chart(gradeDistributionCtx, {
        type: 'bar',
        data: {
            labels: ['A', 'B', 'C', 'D', 'F'],
            datasets: [{
                label: 'Grade Distribution',
                data: [4, 7, 3, 2, 1],
                backgroundColor: '#3B82F6'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Courses'
                    }
                }
            }
        }
    });
}

// Firebase Authentication functions
function signIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            currentUser = userCredential.user;
            checkAdminStatus();
            updateUserInfo();
            showTab('overview');
        })
        .catch((error) => {
            console.error("Error signing in: ", error);
            alert("Failed to sign in. Please check your credentials.");
        });
}

function signOut() {
    auth.signOut().then(() => {
        currentUser = null;
        isAdmin = false;
        updateUserInfo();
        showTab('overview');
        document.getElementById('adminTab').style.display = 'none';
    }).catch((error) => {
        console.error("Error signing out: ", error);
    });
}

function checkAdminStatus() {
    if (currentUser && currentUser.email === "admin@login") {
        isAdmin = true;
        
        document.getElementById('adminTab').style.display = 'block';
    } else {
        isAdmin = false;
        document.getElementById('adminTab').style.display = 'none';
    }
}

// Profile and Settings functions
function showProfileModal() {
    const modal = document.getElementById('profileModal');
    modal.style.display = 'block';
    if (currentUser) {
        document.getElementById('profileName').value = currentUser.displayName || '';
    }
}

function showSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.style.display = 'block';
}

function showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'block';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'none';
}

function updateProfile(name, avatarFile) {
    if (currentUser) {
        const updatePromises = [];

        if (name) {
            updatePromises.push(currentUser.updateProfile({ displayName: name }));
        }

        if (avatarFile) {
            const storageRef = storage.ref(`avatars/${currentUser.uid}`);
            updatePromises.push(
                storageRef.put(avatarFile).then(() => storageRef.getDownloadURL())
                    .then(url => currentUser.updateProfile({ photoURL: url }))
            );
        }

        Promise.all(updatePromises)
            .then(() => {
                updateUserInfo();
                closeModal('profileModal');
                showNotification("Profile updated successfully");
            })
            .catch(error => {
                console.error("Error updating profile: ", error);
                alert("Failed to update profile. Please try again.");
            });
    }
}

function changePassword(currentPassword, newPassword) {
    if (currentUser) {
        const credential = firebase.auth.EmailAuthProvider.credential(
            currentUser.email,
            currentPassword
        );

        currentUser.reauthenticateWithCredential(credential)
            .then(() => {
                return currentUser.updatePassword(newPassword);
            })
            .then(() => {
                closeModal('settingsModal');
                showNotification("Password changed successfully");
            })
            .catch(error => {
                console.error("Error changing password: ", error);
                alert("Failed to change password. Please check your current password and try again.");
            });
    }
}

function adminLogin(password) {
    if (password === "admin@login") {
        isAdmin = true;
        currentUser = { displayName: "Admin", email: "admin@system" };
        document.getElementById('adminTab').style.display = 'block';
        closeModal('adminLoginModal');
        showNotification("Logged in as admin successfully");
        updateUserInfo();
        showTab('admin');
    } else {
        alert("Incorrect admin password. Please try again.");
    }
}

// Modified showAdminLoginModal function
function showAdminLoginModal() {
    const modal = document.getElementById('adminLoginModal');
    modal.style.display = 'block';
}

// Admin functions
function showUserManagement() {
    // Implement user management functionality
    alert("User management functionality to be implemented");
}

function showCourseManagement() {
    // Implement course management functionality
    alert("Course management functionality to be implemented");
}

function showSystemSettings() {
    // Implement system settings functionality
    alert("System settings functionality to be implemented");
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize with a mock user (replace with actual authentication)
    if (document.getElementById('adminLoginForm')) {
        document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            adminLogin(password);
        });
    }

    currentUser = { displayName: "John Doe", email: "john@example.com" };
    updateUserInfo();
    showTab('overview');

    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            showTab(button.dataset.tab);
        });
    });

    const notificationBtn = document.getElementById('notificationBtn');
    const notificationDropdown = document.getElementById('notificationDropdown');
    notificationBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        notificationDropdown.classList.toggle('show');
        document.getElementById('notificationBadge').style.display = 'none';
        document.getElementById('notificationBadge').textContent = '0';
    });

    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    userMenuBtn.addEventListener('click', (event) => {
        event.stopPropagation();
        userDropdown.classList.toggle('show');
    });

    document.getElementById('profileBtn').addEventListener('click', showProfileModal);
    document.getElementById('settingsBtn').addEventListener('click', showSettingsModal);
    document.getElementById('adminLoginBtn').addEventListener('click', showAdminLoginModal);
    document.getElementById('logoutBtn').addEventListener('click', signOut);

    // Close dropdowns when clicking outside
    document.addEventListener('click', (event) => {
        if (!event.target.closest('.dropdown')) {
            const dropdowns = document.getElementsByClassName('dropdown-content');
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) {
                    openDropdown.classList.remove('show');
                }
            }
        }
    });

    // Close modals
    const closeButtons = document.getElementsByClassName('close');
    for (let i = 0; i < closeButtons.length; i++) {
        closeButtons[i].addEventListener('click', () => closeModal(closeButtons[i].closest('.modal').id));
    }

    // Profile form submission
    document.getElementById('profileForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('profileName').value;
        const avatarFile = document.getElementById('profileAvatar').files[0];
        updateProfile(name, avatarFile);
    });

    // Password change form submission
    document.getElementById('passwordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            alert("New passwords do not match");
            return;
        }

        changePassword(currentPassword, newPassword);
    });

    // Admin login form submission
    document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('adminEmail').value;
        const password = document.getElementById('adminPassword').value;
        adminLogin(email, password);
    });

    // Initialize Lucide icons
    lucide.createIcons();
});